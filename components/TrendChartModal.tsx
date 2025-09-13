import React, { useMemo } from 'react';
import type { ChartData } from '../types';
import { XIcon } from './icons';

// Recharts is loaded via a script tag in index.html.
// We will access it from the window object inside the component to avoid a race condition.

interface TrendChartModalProps {
  chartData: ChartData;
  onClose: () => void;
}

const parseRange = (rangeStr: string): { min?: number, max?: number } => {
    if (!rangeStr) return {};
    const cleanedStr = rangeStr.replace(',', '.');
    
    const lessThanMatch = cleanedStr.match(/<\s*(\d+\.?\d*)/);
    if (lessThanMatch) return { max: parseFloat(lessThanMatch[1]) };
    
    const greaterThanMatch = cleanedStr.match(/>\s*(\d+\.?\d*)/);
    if (greaterThanMatch) return { min: parseFloat(greaterThanMatch[1]) };

    const rangeMatch = cleanedStr.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (rangeMatch) return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };
    
    return {};
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const range = data.range || 'N/A';
        return (
            <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                <p className="font-semibold text-gray-800">{`Fecha: ${label}`}</p>
                <p className="text-brand-primary">{`Valor: ${payload[0].value}`}</p>
                <p className="text-sm text-gray-600">{`Rango Ref: ${range}`}</p>
            </div>
        );
    }
    return null;
};

export const TrendChartModal: React.FC<TrendChartModalProps> = ({ chartData, onClose }) => {
    // Access Recharts from the window object inside the component to prevent a race condition on module load.
    const Recharts = (window as any).Recharts;

    const { name, data, range } = chartData;
    const { min, max } = useMemo(() => parseRange(range), [range]);
    const dataWithRange = data.map(d => ({ ...d, range }));

    // Show a loading state if the Recharts library isn't loaded yet.
    if (!Recharts) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[80vh] p-6 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold text-brand-secondary">Tendencia de {name}</h2>
                    <p className="mt-4 text-lg">Cargando gráfico...</p>
                </div>
            </div>
        );
    }

    const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } = Recharts;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[80vh] p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-brand-secondary">Tendencia de {name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <XIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dataWithRange} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" label={{ value: 'Fecha', position: 'insideBottom', offset: -15 }} />
                            <YAxis label={{ value: 'Valor', angle: -90, position: 'insideLeft' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} />
                            
                            {min !== undefined && (
                                <ReferenceLine y={min} label={{ value: `Min: ${min}`, position: 'insideTopLeft' }} stroke="orange" strokeDasharray="3 3" />
                            )}
                            {max !== undefined && (
                                <ReferenceLine y={max} label={{ value: `Max: ${max}`, position: 'insideTopLeft' }} stroke="orange" strokeDasharray="3 3" />
                            )}
                            
                            <Line type="monotone" dataKey="value" name={name} stroke="#007A7A" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
