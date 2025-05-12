import { useEffect, useRef, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import type { Results, ChartData } from '../server-utils/results';
import { caseLabels } from '../client-utils/constants';
import { FileListTooltip } from './FileListTooltip';
import { Checkbox } from './CheckBox';

interface FiltersProps {
  dbNames: Results['dbNames'];
  caseIds: Results['caseIds'];
  onFiltersChange: (selectedDbs: string[], selectedCases: number[], startDate?: Date) => void;
  fileCount?: number;
  filteredFiles?: string[];
}

const START_DATE = "2023-01-01";

// Case groups for organized display
const caseGroups = [
  {
    title: "Capacity Tests",
    ids: [2, 1]
  },
  {
    title: "768D Performance Tests",
    ids: [3, 4, 5]
  },
  {
    title: "768D Filtering Tests",
    ids: [6, 7, 8, 9]
  },
  {
    title: "1536D Performance Tests",
    ids: [11, 10, 50]
  },
  {
    title: "1536D Filtering Tests",
    ids: [13, 12, 15, 14]
  },
  {
    title: "Custom Tests",
    ids: [100, 101]
  }
] as const;

export const Filters = ({ dbNames, caseIds, onFiltersChange, fileCount = 0, filteredFiles = [] }: FiltersProps) => {
  const [selectedDbs, setSelectedDbs] = useLocalStorageState<string[]>("dbNames", { defaultValue: dbNames });
  const [selectedCases, setSelectedCases] = useLocalStorageState<number[]>("caseNames", { defaultValue: caseIds });
  const [startDate, setStartDate] = useLocalStorageState<string>("startDate", { defaultValue: START_DATE });
  const previousDbs = useRef(selectedDbs);
  const previousCases = useRef(selectedCases);
  const previousStartDate = useRef(startDate);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      onFiltersChange(selectedDbs, selectedCases, new Date(startDate));
      setIsInitialized(true);
    }
  }, [isInitialized, onFiltersChange, selectedDbs, selectedCases, startDate]);

  useEffect(() => {
    if (
      previousDbs.current !== selectedDbs ||
      previousCases.current !== selectedCases ||
      previousStartDate.current !== startDate
    ) {
      onFiltersChange(selectedDbs, selectedCases, new Date(startDate));
      previousDbs.current = selectedDbs;
      previousCases.current = selectedCases;
      previousStartDate.current = startDate;
    }
  }, [selectedDbs, selectedCases, startDate, onFiltersChange]);

  const handleDbToggle = (dbName: string) => {
    const newSelection = selectedDbs.includes(dbName)
      ? selectedDbs.filter(db => db !== dbName)
      : [...selectedDbs, dbName];

    setSelectedDbs(newSelection);
  };

  const handleCaseToggle = (caseName: number) => {
    const newSelection = selectedCases.includes(caseName)
      ? selectedCases.filter(c => c !== caseName)
      : [...selectedCases, caseName];

    setSelectedCases(newSelection);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setStartDate(START_DATE);
    } else {
      setStartDate(e.target.value);
    }
  };

  const selectAllDbs = () => {
    setSelectedDbs([...dbNames]);
  };

  const clearAllDbs = () => {
    setSelectedDbs([]);
  };

  const selectAllCases = () => {
    setSelectedCases([...caseIds]);
  };

  const clearAllCases = () => {
    setSelectedCases([]);
  };

  // Generate list of available cases grouped by category
  const getGroupedCases = () => {
    const availableCaseIds = new Set(caseIds);
    return caseGroups
      .map(group => ({
        ...group,
        cases: group.ids.filter(id => availableCaseIds.has(id))
      }))
      .filter(group => group.cases.length > 0);
  };

  const groupedCases = getGroupedCases();

  return (
    <div className="h-full bg-gray-50 p-4 border-r border-b border-gray-200 w-64 shrink-0 dark:bg-gray-800 dark:border-gray-600">
      <div className="mb-4">
        <div className="mb-2">
          <label className="text-sm mb-1 mr-2">Only use results created after:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={START_DATE}
            max={new Date().toISOString().split('T')[0]}
            className="p-1 border border-gray-300 rounded"
          />
        </div>
        <FileListTooltip files={filteredFiles}>
          <div className="dark:bg-gray-700 bg-gray-200 p-2 rounded text-sm relative flex items-center">
            {fileCount} files match <svg className="ml-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 416.979 416.979">
              <g>
                <path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85
		c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786
		c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576
		c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765
		c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"/>
              </g>
            </svg>
          </div>
        </FileListTooltip>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">DB Filter</h3>
          <div>
            <button
              onClick={selectAllDbs}
              className="bg-primary text-white px-2 py-1 text-xs rounded mr-2"
            >
              Select All
            </button>
            <button
              onClick={clearAllDbs}
              className="bg-gray-500 text-white px-2 py-1 text-xs rounded"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          {dbNames.map(dbName => (
            <Checkbox
              checked={selectedDbs.includes(dbName)}
              onChange={() => handleDbToggle(dbName)}
              label={dbName}
              key={dbName}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Case Filter</h3>
          <div>
            <button
              onClick={selectAllCases}
              className="bg-primary text-white px-2 py-1 text-xs rounded mr-2"
            >
              Select All
            </button>
            <button
              onClick={clearAllCases}
              className="bg-gray-500 text-white px-2 py-1 text-xs rounded"
            >
              Clear All
            </button>
          </div>
        </div>

        {groupedCases.map(group => (
          <div key={group.title} className="mb-3">
            <h4 className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{group.title}</h4>
            <div className="flex flex-col pl-2">
              {group.cases.map(caseId => (
                  <Checkbox
                    checked={selectedCases.includes(caseId)}
                    onChange={() => handleCaseToggle(caseId)}
                    label={caseLabels[caseId]}
                    key={caseId}
                  />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

