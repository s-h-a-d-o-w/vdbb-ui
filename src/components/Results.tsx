'use client';

import { useState, useMemo } from "react";
import { Filters } from "./Filters";
import { ResultsChart } from "./ResultsChart";
import type { ChartData, Results as ResultsType } from "../server-utils/results";

export const filterChartData = (
  data: ChartData[],
  selectedDbs: string[],
  selectedCases: number[],
  startDate?: Date
): ChartData[] => {
  return data.filter(
    item => {
      const dbFilter = selectedDbs.includes(item.db_name);
      const caseFilter = selectedCases.includes(item.case_id);
      let dateFilter = true;

      if (startDate && item.fileDate) {
        dateFilter = item.fileDate >= startDate;
      }

      return dbFilter && caseFilter && dateFilter;
    }
  );
};

export function Results({ results, chartData, dbNames, caseIds }: ResultsType) {
  const [filteredData, setFilteredData] = useState<ChartData[]>();
  const [currentStartDate, setCurrentStartDate] = useState<Date | undefined>();
  const [selectedDbs, setSelectedDbs] = useState<string[]>(dbNames);
  const [selectedCases, setSelectedCases] = useState<number[]>(caseIds);

  // Calculate file count and get unique filenames
  const { fileCount, filteredFiles } = useMemo(() => {
    if (!currentStartDate) {
      const uniqueFilenames = new Set<string>();
      chartData.forEach(item => {
        if (item.filename) {
          uniqueFilenames.add(item.filename);
        }
      });
      return {
        fileCount: uniqueFilenames.size,
        filteredFiles: Array.from(uniqueFilenames)
      };
    }

    // Use Set to count unique filenames
    const uniqueFilenames = new Set<string>();

    chartData.forEach(item => {
      if (item.fileDate && item.filename && item.fileDate >= currentStartDate) {
        uniqueFilenames.add(item.filename);
      }
    });

    return {
      fileCount: uniqueFilenames.size,
      filteredFiles: Array.from(uniqueFilenames)
    };
  }, [chartData, currentStartDate]);

  const handleFiltersChange = (
    newSelectedDbs: string[],
    newSelectedCases: number[],
    startDate?: Date
  ) => {
    setSelectedDbs(newSelectedDbs);
    setSelectedCases(newSelectedCases);
    setCurrentStartDate(startDate);

    const newData = filterChartData(chartData, newSelectedDbs, newSelectedCases, startDate);
    setFilteredData(newData);
  };

  return (
    <div className="flex">
      <div className="print:hidden">
        <Filters
          dbNames={dbNames}
          caseIds={caseIds}
          onFiltersChange={handleFiltersChange}
          fileCount={fileCount}
          filteredFiles={filteredFiles}
        />
      </div>
      <div className="flex-1 py-8 px-8 print:w-full">
        <h1 className="text-4xl font-bold tracking-tight mb-6">VectorDB Benchmark Results</h1>

        {filteredData && <ResultsChart data={filteredData} />}
      </div>
    </div>
  );
}
