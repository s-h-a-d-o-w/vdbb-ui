"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ChartData } from "../server-utils/results";
import { metric_order, caseLabels } from "../client-utils/constants";
import { useIsDarkMode } from "../hooks/useIsDarkMode";
import type { ChartData as BarChartData } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface ResultsChartProps {
  data: ChartData[];
}

const BAR_HEIGHT = 28;
const AXIS_HEIGHT_AND_PADDING = 40;

const metric_unit_map: Record<string, string> = {
  qps: "QPS",
  serial_latency_p99: "ms",
  recall: "%",
  load_duration: "s",
  max_load_count: "k",
};

function isLessBetter(metric: string) {
  return ["load_duration", "serial_latency_p99"].includes(metric);
}

function getCSSVar(variable: string) {
  return typeof getComputedStyle !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(variable)
    : "#000000";
}

const barColors = {
  AWSOpenSearch: getCSSVar("--color-orange-400"),
  ElasticCloud: getCSSVar("--color-yellow-400"),
  LanceDB: getCSSVar("--color-green-400"),
  Milvus: getCSSVar("--color-teal-400"),
  PgVector: getCSSVar("--color-primary"),
  Pinecone: getCSSVar("--color-indigo-400"),
  QdrantCloud: getCSSVar("--color-rose-400"),
  Redis: getCSSVar("--color-rose-600"),
  TiDB: getCSSVar("--color-indigo-600"),
  Vespa: getCSSVar("--color-teal-600"), //
  WeaviateCloud: getCSSVar("--color-green-600"), //
  ZillizCloud: getCSSVar("--color-orange-600"),
} as const;

const getBarColor = (dbName: string) => {
  return dbName in barColors
    ? barColors[dbName as keyof typeof barColors]
    : "#000000";
};

const colors = {
  background: getCSSVar("--color-white"),
  border: getCSSVar("--color-gray-300"),
  text: getCSSVar("--color-gray-800"),
  darkBackground: getCSSVar("--color-gray-700"),
  darkBorder: getCSSVar("--color-gray-700"),
  darkText: getCSSVar("--color-gray-100"),
} as const;

export const ResultsChart = ({ data }: ResultsChartProps) => {
  const isDarkMode = useIsDarkMode();

  if (!data.length) {
    return <div className="text-center py-4">No data available</div>;
  }

  const availableMetrics = new Set<string>();
  data.forEach((item) => {
    item.metricsSet?.forEach((metric) => {
      if (metric_order.includes(metric)) {
        availableMetrics.add(metric);
      }
    });
  });

  const metrics = metric_order.filter((metric) => availableMetrics.has(metric));

  const dataByCase = data.reduce(
    (acc, item) => {
      if (!acc[item.case_id]) {
        acc[item.case_id] = [];
      }
      acc[item.case_id]!.push(item);
      return acc;
    },
    {} as Record<keyof typeof caseLabels, ChartData[]>,
  );

  return (
    <div>
      {Object.entries(dataByCase).map(([caseId, caseData]) => (
        <div key={caseId} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">
            {caseLabels[parseInt(caseId, 10) as keyof typeof caseLabels]}
          </h3>

          {metrics.map((metric) => {
            const filteredData = caseData.filter(
              (item) =>
                item.metricsSet?.includes(metric) &&
                typeof item[metric as keyof ChartData] === "number" &&
                (item[metric as keyof ChartData] as number) > 1e-7,
            );

            if (!filteredData.length) return null;

            const sortedData = [...filteredData].sort((a, b) => {
              if (isLessBetter(metric)) {
                return (
                  (a[metric as keyof ChartData] as number) -
                  (b[metric as keyof ChartData] as number)
                );
              }
              return (
                (b[metric as keyof ChartData] as number) -
                (a[metric as keyof ChartData] as number)
              );
            });

            const unit = metric_unit_map[metric] || "";
            const height =
              sortedData.length * BAR_HEIGHT + AXIS_HEIGHT_AND_PADDING;

            const chartData = {
              labels: sortedData.map((item) => item.db_label),
              datasets: [
                {
                  data: sortedData.map(
                    (item) => item[metric as keyof ChartData] as number,
                  ),
                  backgroundColor: sortedData.map((item) =>
                    getBarColor(item.db_name),
                  ),
                  hoverBackgroundColor: sortedData.map((item) =>
                    getBarColor(item.db_name),
                  ),
                },
              ],
            } satisfies BarChartData<"bar", number[], string>;

            const options = {
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              layout: {
                padding: {
                  left: 50,
                  right: 75,
                  bottom: 10,
                },
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (tooltipItems: TooltipItem<"bar">[]) => {
                      const index = tooltipItems[0]?.dataIndex;
                      if (index !== undefined) {
                        return sortedData[index]?.db_label || "";
                      }
                      return "";
                    },
                    label: (tooltipItem: TooltipItem<"bar">) => {
                      const value = tooltipItem.parsed.x;
                      const index = tooltipItem.dataIndex;
                      const item = sortedData[index];
                      return [
                        `${metric.replace("_", " ")} (${unit}): ${value}`,
                        ...(item?.filename ? [`File: ${item.filename}`] : []),
                      ];
                    },
                  },
                  borderWidth: 1,
                  backgroundColor: isDarkMode
                    ? colors.darkBackground
                    : colors.background,
                  borderColor: isDarkMode ? colors.darkBorder : colors.border,
                  titleColor: isDarkMode ? colors.darkText : colors.text,
                  bodyColor: isDarkMode ? colors.darkText : colors.text,
                },
              },
              scales: {
                x: {
                  border: {
                    color: isDarkMode ? colors.darkBorder : colors.border,
                  },
                  grid: {
                    color: isDarkMode ? colors.darkBorder : colors.border,
                  },
                  ticks: {
                    font: {
                      size: 14,
                      family: "'Nunito', sans-serif",
                    },
                    color: isDarkMode ? colors.darkText : colors.text,
                  },
                },
                y: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    font: {
                      size: 14,
                      family: "'Nunito', sans-serif",
                    },
                    color: isDarkMode ? colors.darkText : colors.text,
                  },
                },
              },
            } satisfies ChartOptions<"bar">;

            return (
              <div key={metric} className="mb-6 print:break-inside-avoid">
                <h4 className="text-md font-medium mb-1">
                  {[
                    metric[0]!.toLocaleUpperCase(),
                    metric.slice(1).toLocaleLowerCase().replaceAll("_", " "),
                  ].join("")}
                  {!["qps", "recall"].includes(metric) && ` in ${unit}`}
                  <span className="text-xs text-gray-500 ml-1 dark:text-gray-300">
                    ({isLessBetter(metric) ? "less" : "more"} is better)
                  </span>
                </h4>

                <div style={{ height: `${height}px` }}>
                  <Bar data={chartData} options={options} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
