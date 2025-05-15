"use client";

import { useEffect, useRef, useState } from "react";
import useLocalStorageState from "use-local-storage-state";
import type { Results } from "../server-utils/results";
import { caseLabels } from "../client-utils/constants";
import { FileListTooltip } from "./FileListTooltip";
import { Checkbox } from "./Checkbox";
import { InfoIcon } from "./InfoIcon";
import { Radiobox } from "./Radiobox";
import { RadioGroup } from "radix-ui";
interface FiltersProps {
  dbNames: Results["dbNames"];
  caseIds: Results["caseIds"];
  onFiltersChange: (
    selectedDbs: string[],
    selectedCase: number,
    startDate?: Date,
  ) => void;
  fileCount?: number;
  filteredFiles?: string[];
}

const START_DATE = "2023-01-01";

// Case groups for organized display
const caseGroups = [
  {
    title: "Capacity Tests",
    ids: [2, 1],
  },
  {
    title: "768D Performance Tests",
    ids: [3, 4, 5],
  },
  {
    title: "768D Filtering Tests",
    ids: [6, 7, 8, 9],
  },
  {
    title: "1536D Performance Tests",
    ids: [11, 10, 50],
  },
  {
    title: "1536D Filtering Tests",
    ids: [13, 12, 15, 14],
  },
  {
    title: "Custom Tests",
    ids: [100, 101],
  },
] as const;

export const Filters = ({
  dbNames,
  caseIds,
  onFiltersChange,
  fileCount = 0,
  filteredFiles = [],
}: FiltersProps) => {
  const [selectedDbs, setSelectedDbs] = useLocalStorageState<string[]>(
    "dbNames",
    { defaultValue: dbNames },
  );
  const [selectedCase, setSelectedCase] = useLocalStorageState<number>("case", {
    defaultValue: caseIds[0]!,
  });
  const [startDate, setStartDate] = useLocalStorageState<string>("startDate", {
    defaultValue: START_DATE,
  });
  const previousDbs = useRef(selectedDbs);
  const previousCase = useRef(selectedCase);
  const previousStartDate = useRef(startDate);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      onFiltersChange(selectedDbs, selectedCase, new Date(startDate));
      setIsInitialized(true);
    }
  }, [isInitialized, onFiltersChange, selectedDbs, selectedCase, startDate]);

  useEffect(() => {
    if (
      previousDbs.current !== selectedDbs ||
      previousCase.current !== selectedCase ||
      previousStartDate.current !== startDate
    ) {
      onFiltersChange(selectedDbs, selectedCase, new Date(startDate));
      previousDbs.current = selectedDbs;
      previousCase.current = selectedCase;
      previousStartDate.current = startDate;
    }
  }, [selectedDbs, selectedCase, startDate, onFiltersChange]);

  const handleDbToggle = (dbName: string) => {
    const newSelection = selectedDbs.includes(dbName)
      ? selectedDbs.filter((db) => db !== dbName)
      : [...selectedDbs, dbName];

    setSelectedDbs(newSelection);
  };

  // const handleCaseToggle = (caseName: number) => {
  //   setSelectedCase(caseName);
  // };

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

  // Generate list of available cases grouped by category
  const getGroupedCases = () => {
    const availableCaseIds = new Set(caseIds);
    return caseGroups
      .map((group) => ({
        ...group,
        cases: group.ids.filter((id) => availableCaseIds.has(id)),
      }))
      .filter((group) => group.cases.length > 0);
  };

  const groupedCases = getGroupedCases();

  return (
    <div className="h-full bg-gray-50 p-4 border-r border-b border-gray-200 w-64 shrink-0 dark:bg-gray-800 dark:border-gray-600">
      <h3 className="font-semibold mb-2">Results after</h3>
      <div className="mb-4 pl-2">
        <div className="mb-2">
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            min={START_DATE}
            max={new Date().toISOString().split("T")[0]}
            className="border border-gray-300 rounded"
          />
        </div>
        <FileListTooltip files={filteredFiles}>
          <div className="dark:bg-gray-700 bg-gray-200 px-3 py-2 rounded text-sm relative inline-flex items-center">
            {fileCount} files match <InfoIcon />
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
        <div className="flex flex-col pl-2">
          {dbNames.map((dbName) => (
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
        <h3 className="font-semibold mb-2">Case Filter</h3>

        <RadioGroup.Root
          value={selectedCase.toString()}
          onValueChange={(value) => setSelectedCase(parseInt(value, 10))}
        >
          {groupedCases.map((group) => (
            <div key={group.title} className="mb-3">
              <h4 className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                {group.title}
              </h4>
              <div className="flex flex-col pl-2">
                {group.cases.map((caseId) => (
                  <Radiobox
                    label={caseLabels[caseId]}
                    value={caseId.toString()}
                    key={caseId}
                  />
                ))}
              </div>
            </div>
          ))}
        </RadioGroup.Root>
      </div>
    </div>
  );
};
