
import { useMemo } from 'react';
import type { ProcessedLabData, TestResultProcessed, GroupedResultRow } from '../types';
import { NORMALIZATION_MAP, WHITELIST, BLACKLIST_TERMS, TABLE_ROW_GROUPS } from '../constants';

export const useLabDataProcessor = (data: ProcessedLabData | null) => {
    const processedResults = useMemo<TestResultProcessed[]>(() => {
        if (!data) return [];

        // 1. Flatten all results from all reports into one array
        let allResults: TestResultProcessed[] = [];
        data.reports.forEach(report => {
            const reportDate = report.reportDate || new Date().toLocaleDateString('es-ES');
            report.results.forEach(res => {
                allResults.push({
                    date: reportDate,
                    section: res.seccion?.trim().toLowerCase() || 'general',
                    name: res.examen?.trim().toLowerCase() || '',
                    value: res.resultado?.trim() || '',
                    units: res.unidades?.trim() || '',
                    referenceRange: res.rangoReferencia?.trim() || '',
                });
            });
        });

        // 2. Process each result: normalize, filter, etc.
        const processed = allResults
            .map(res => {
                // Normalization
                let normalizedName = NORMALIZATION_MAP[res.name] || res.name.charAt(0).toUpperCase() + res.name.slice(1);
                
                // Special logic for Segmentados/Linfocitos
                if ((normalizedName === "Segmentados" || normalizedName === "Linfocitos") && (res.units === "%" || res.units === "o/o")) {
                    normalizedName = `${normalizedName} (%)`;
                }

                return { ...res, name: normalizedName };
            })
            // Filter by whitelist and blacklist
            .filter(res => {
                const inWhitelist = WHITELIST.includes(res.name);
                const inBlacklist = BLACKLIST_TERMS.some(term => res.name.toLowerCase().includes(term.toLowerCase()));
                return inWhitelist && !inBlacklist && res.value; // Also filter out empty results
            });
        
        // 3. Deduplication
        const deduplicatedMap = new Map<string, TestResultProcessed>();
        processed.forEach(res => {
            const key = `${res.date}-${res.name}`;
            const existing = deduplicatedMap.get(key);

            if (!existing) {
                deduplicatedMap.set(key, res);
            } else {
                // Prioritize "hemograma" section for duplicates
                if (res.section.includes('hemograma') && !existing.section.includes('hemograma')) {
                    deduplicatedMap.set(key, res);
                }
            }
        });

        return Array.from(deduplicatedMap.values());
    }, [data]);

    const allDates = useMemo<string[]>(() => {
        if (!processedResults.length) return [];
        const uniqueDates = [...new Set(processedResults.map(res => res.date))];
        return uniqueDates.sort((a: string, b: string) => {
            const [dayA, monthA, yearA] = a.split('/').map(Number);
            const [dayB, monthB, yearB] = b.split('/').map(Number);
            return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
        });
    }, [processedResults]);
    
    const allTestNames = useMemo<string[]>(() => {
       const uniqueNames = [...new Set(processedResults.map(r => r.name))];
       return uniqueNames.sort((a: string, b: string) => a.localeCompare(b));
    }, [processedResults]);

    const groupedData = useMemo<GroupedResultRow[]>(() => {
        if (!processedResults.length || !allDates.length) return [];

        const resultsByDateAndName: { [date: string]: { [name: string]: string } } = {};
        
        processedResults.forEach(res => {
            if (!resultsByDateAndName[res.date]) {
                resultsByDateAndName[res.date] = {};
            }
            // Rounding logic
            let value = res.value;
            if (['Segmentados (%)', 'Linfocitos (%)', 'PCR'].includes(res.name)) {
                const numericValue = parseFloat(value.replace(',', '.'));
                if (!isNaN(numericValue)) {
                    value = Math.round(numericValue).toString();
                }
            }
            resultsByDateAndName[res.date][res.name] = value;
        });

        return TABLE_ROW_GROUPS.map(group => {
            const values: { [date: string]: string } = {};
            allDates.forEach(date => {
                const dateResults = resultsByDateAndName[date] || {};
                const valueParts = group.tests
                    .map(testName => dateResults[testName])
                    .filter(Boolean); // Filter out undefined/null results

                values[date] = valueParts.join(group.separator);
            });
            
            // Determine if any test in this group has data
            const hasData = Object.values(values).some(v => v.length > 0);
            if (!hasData) return null;

            return {
                label: group.label,
                values: values,
                isSingleTest: group.tests.length === 1,
                originalTests: group.tests,
            };
        }).filter((g): g is GroupedResultRow => g !== null);

    }, [processedResults, allDates]);

    return {
        groupedData,
        patientInfo: data?.patientInfo || null,
        allDates,
        allTestNames,
    };
};
