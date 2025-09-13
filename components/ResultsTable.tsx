
import React from 'react';
import type { GroupedResultRow } from '../types';
import { ChartBarIcon } from './icons';

interface ResultsTableProps {
  groupedData: GroupedResultRow[];
  allDates: string[];
  onChartOpen: (testName: string) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ groupedData, allDates, onChartOpen }) => {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-brand-secondary text-white">
          <tr>
            <th className="py-3 px-4 text-left font-semibold sticky left-0 bg-brand-secondary z-10">Examen</th>
            {allDates.map(date => (
              <th key={date} className="py-3 px-4 text-center font-semibold">{date}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groupedData.map((row, index) => (
            <tr
              key={row.label}
              className={`border-b border-gray-200 ${
                row.isSingleTest ? 'hover:bg-brand-light cursor-pointer group' : 'bg-white'
              } ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              onClick={row.isSingleTest ? () => onChartOpen(row.label) : undefined}
            >
              <td className="py-3 px-4 font-medium text-gray-800 sticky left-0 z-10 bg-inherit flex items-center justify-between">
                <span>{row.label}</span>
                {row.isSingleTest && (
                  <ChartBarIcon className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors" />
                )}
              </td>
              {allDates.map(date => (
                <td key={date} className="py-3 px-4 text-center text-gray-600">
                  {row.values[date] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
