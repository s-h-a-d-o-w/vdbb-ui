"use client";

import { useState, useMemo } from "react";
import { Filters } from "./Filters";
import { ResultsChart } from "./ResultsChart";
import type {
  ChartData,
  Results as ResultsType,
} from "../server-utils/results";
import { ThemeToggle } from "./ThemeToggle";

const filterChartData = (
  data: ChartData[],
  selectedDbs: string[],
  selectedCase: number,
  startDate?: Date,
): ChartData[] => {
  return data.filter((item) => {
    const dbFilter = selectedDbs.includes(item.db_name);
    const caseFilter = selectedCase === item.case_id;
    let dateFilter = true;

    if (startDate && item.fileDate) {
      dateFilter = item.fileDate >= startDate;
    }

    return dbFilter && caseFilter && dateFilter;
  });
};

export function Results({ chartData, dbNames, caseIds }: ResultsType) {
  const [filteredData, setFilteredData] = useState<ChartData[]>();
  const [currentStartDate, setCurrentStartDate] = useState<Date | undefined>();

  // Calculate file count and get unique filenames
  const { fileCount, filteredFiles } = useMemo(() => {
    if (!currentStartDate) {
      const uniqueFilenames = new Set<string>();
      chartData.forEach((item) => {
        if (item.filename) {
          uniqueFilenames.add(item.filename);
        }
      });
      return {
        fileCount: uniqueFilenames.size,
        filteredFiles: Array.from(uniqueFilenames),
      };
    }

    // Use Set to count unique filenames
    const uniqueFilenames = new Set<string>();

    chartData.forEach((item) => {
      if (item.fileDate && item.filename && item.fileDate >= currentStartDate) {
        uniqueFilenames.add(item.filename);
      }
    });

    return {
      fileCount: uniqueFilenames.size,
      filteredFiles: Array.from(uniqueFilenames),
    };
  }, [chartData, currentStartDate]);

  const handleFiltersChange = (
    newSelectedDbs: string[],
    newSelectedCase: number,
    startDate?: Date,
  ) => {
    setCurrentStartDate(startDate);

    const newData = filterChartData(
      chartData,
      newSelectedDbs,
      newSelectedCase,
      startDate,
    );
    setFilteredData(newData);
  };

  return (
    <div className="flex">
      <div className="print:hidden">
        <Filters
          dbNames={dbNames}
          caseIds={caseIds}
          onFiltersChange={(selectedDbs, selectedCase, startDate) => {
            setTimeout(() => {
              handleFiltersChange(selectedDbs, selectedCase, startDate);
            }, 0);
          }}
          fileCount={fileCount}
          filteredFiles={filteredFiles}
        />
      </div>
      <div className="flex-1 py-8 px-8 print:w-full">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          VectorDB Benchmark Results
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-200 mb-6">
          Label Format:{" "}
          <code className="dark:border-gray-100 border border-gray-300 dark:border-gray-700 p-1 rounded-md">{`<db_name> (<db_label>?, <index>, <num_concurrency>[])`}</code>
        </p>

        {filteredData && <ResultsChart data={filteredData} />}
      </div>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
