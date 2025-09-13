
import React from 'react';

interface FilterPanelProps {
  allTestNames: string[];
  selectedTests: Set<string>;
  setSelectedTests: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ allTestNames, selectedTests, setSelectedTests }) => {
  
  const handleToggle = (testName: string) => {
    const newSelection = new Set(selectedTests);
    if (newSelection.has(testName)) {
      newSelection.delete(testName);
    } else {
      newSelection.add(testName);
    }
    setSelectedTests(newSelection);
  };

  const handleSelectAll = () => {
    setSelectedTests(new Set(allTestNames));
  };

  const handleDeselectAll = () => {
    setSelectedTests(new Set());
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Filtrar Exámenes</h3>
        <div className="space-x-2">
          <button onClick={handleSelectAll} className="px-3 py-1 text-sm font-medium text-brand-primary border border-brand-primary rounded-md hover:bg-brand-light">
            Seleccionar Todos
          </button>
          <button onClick={handleDeselectAll} className="px-3 py-1 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">
            Deseleccionar Todos
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2">
        {allTestNames.map(name => (
          <label key={name} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedTests.has(name)}
              onChange={() => handleToggle(name)}
              className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <span className="text-gray-700 text-sm">{name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
