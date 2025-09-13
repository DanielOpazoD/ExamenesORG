
import React, { useState, useCallback, useMemo } from 'react';
import { FileUploader } from './components/FileUploader';
import { ResultsTable } from './components/ResultsTable';
import { FilterPanel } from './components/FilterPanel';
import { TrendChartModal } from './components/TrendChartModal';
import { Spinner } from './components/Spinner';
import { analyzePdf } from './services/geminiService';
import { useLabDataProcessor } from './hooks/useLabDataProcessor';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { PatientInfo, ProcessedLabData, ChartData } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedLabData | null>(null);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const {
    groupedData,
    patientInfo,
    allDates,
    allTestNames,
  } = useLabDataProcessor(processedData);

  const handleFilesSelected = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setProcessedData(null);
    setError(null);
  }, []);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setError(null);
    setProcessedData(null);

    try {
      const results = await Promise.all(
        files.map(file => analyzePdf(file))
      );
      const combinedData: ProcessedLabData = {
        patientInfo: results.length > 0 ? results[0].patientInfo : { nombre: 'N/A', id: 'N/A', fechaNacimiento: 'N/A' },
        reports: results.flat()
      };
      setProcessedData(combinedData);
      // Initialize filter with all tests selected
      const uniqueTests = new Set(results.flatMap(r => r.results.map(t => t.examen)));
      setSelectedTests(new Set(allTestNames));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al analizar los archivos.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChartOpen = useCallback((testName: string) => {
    const testRow = groupedData.find(g => g.label === testName);
    if (!testRow || !processedData) return;

    const dataPoints = allDates.map(date => {
        const valueStr = testRow.values[date];
        const value = valueStr ? parseFloat(valueStr.replace(',', '.')) : null;
        return value !== null && !isNaN(value) ? { date, value } : null;
    }).filter(Boolean);
    
    // Find one original result to get the reference range
    let referenceRange = 'N/A';
    for (const report of processedData.reports) {
        const result = report.results.find(r => r.examen === testName);
        if (result && result.rangoReferencia) {
            referenceRange = result.rangoReferencia;
            break;
        }
    }

    setChartData({
        name: testName,
        data: dataPoints as { date: string, value: number }[],
        range: referenceRange,
    });
  }, [groupedData, allDates, processedData]);
  
  const calculateAge = (birthDateString: string): string => {
      if (!birthDateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(birthDateString)) return 'N/A';
      const [day, month, year] = birthDateString.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);
      if (isNaN(birthDate.getTime())) return 'N/A';
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      return String(Math.abs(ageDate.getUTCFullYear() - 1970));
  };

  const handleDownloadPdf = () => {
    if (!groupedData || !patientInfo || !allDates) return;
    
    const doc = new jsPDF();
    
    const age = calculateAge(patientInfo.fechaNacimiento);

    doc.setFontSize(18);
    doc.setTextColor('#005A5A');
    doc.text('Resultados de Laboratorio Consolidados', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor('#000000');
    doc.text(`Paciente: ${patientInfo.nombre}`, 14, 32);
    doc.text(`ID: ${patientInfo.id}`, 14, 38);
    doc.text(`Fecha de Nacimiento: ${patientInfo.fechaNacimiento} (Edad: ${age} años)`, 14, 44);

    const filteredGroupedData = groupedData.filter(row => {
        const testsInRow = row.originalTests;
        return testsInRow.some(test => selectedTests.has(test));
    });

    const head = [['Examen', ...allDates]];
    const body = filteredGroupedData.map(row => [row.label, ...allDates.map(date => row.values[date] || '-')]);
    
    (doc as any).autoTable({
        startY: 50,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { fillColor: '#005A5A' },
        styles: { fontSize: 8 },
    });
    
    const patientName = patientInfo.nombre.replace(/ /g, '_');
    doc.save(`resultados_laboratorio_${patientName}.pdf`);
  };

  const filteredGroupedData = useMemo(() => {
    if (!groupedData) return [];
    return groupedData.filter(row => {
        const testsInRow = row.originalTests;
        return testsInRow.some(test => selectedTests.has(test));
    });
  }, [groupedData, selectedTests]);


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-secondary">Visualizador de Reportes de Laboratorio</h1>
          <p className="text-lg text-gray-600 mt-2">Cargue sus reportes en PDF para un análisis consolidado e inteligente.</p>
        </header>
        
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <FileUploader onFilesSelected={handleFilesSelected} files={files} />
            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleGenerate}
                    disabled={files.length === 0 || isLoading}
                    className="px-8 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analizando...' : 'Generar Tabla'}
                </button>
            </div>
        </div>

        {isLoading && <Spinner message="Extrayendo datos de los reportes..." />}
        {error && <div className="bg-red-100 border-l-4 border-danger text-red-700 p-4 rounded-md shadow-md" role="alert"><p><strong>Error:</strong> {error}</p></div>}
        
        {processedData && groupedData.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-brand-secondary">Resultados Consolidados</h2>
                <button
                    onClick={handleDownloadPdf}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 transition-all"
                >
                    Descargar PDF
                </button>
            </div>

            {patientInfo && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-brand-light rounded-lg">
                  <div><span className="font-semibold">Paciente:</span> {patientInfo.nombre}</div>
                  <div><span className="font-semibold">ID:</span> {patientInfo.id}</div>
                  <div><span className="font-semibold">F. Nacimiento:</span> {patientInfo.fechaNacimiento}</div>
                  <div><span className="font-semibold">Edad:</span> {calculateAge(patientInfo.fechaNacimiento)} años</div>
              </div>
            )}
            
            <FilterPanel allTestNames={allTestNames} selectedTests={selectedTests} setSelectedTests={setSelectedTests} />
            
            <ResultsTable
              groupedData={filteredGroupedData}
              allDates={allDates}
              onChartOpen={handleChartOpen}
            />
          </div>
        )}
      </main>
      {chartData && (
          <TrendChartModal 
              chartData={chartData}
              onClose={() => setChartData(null)}
          />
      )}
    </div>
  );
};

export default App;
