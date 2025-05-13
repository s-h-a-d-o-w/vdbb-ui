"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartData } from "../server-utils/results";
import { metric_order, caseLabels } from "../client-utils/constants";
import { FilenameTooltip } from "./FilenameTooltip";

interface ResultsChartProps {
  data: ChartData[];
}

const BAR_HEIGHT = 30;
const AXIS_HEIGHT_AND_PADDING = 40;

export const metric_unit_map: Record<string, string> = {
  qps: "QPS",
  serial_latency_p99: "ms",
  recall: "%",
  load_duration: "s",
  max_load_count: "k",
};

function isLessBetter(metric: string) {
  return ["load_duration", "serial_latency_p99"].includes(metric);
}

const getColor = (dbName: string) => {
  const predefinedColors = {
    AWSOpenSearch: "var(--color-orange-400)",
    ElasticCloud: "var(--color-yellow-400)",
    LanceDB: "var(--color-green-400)",
    Milvus: "var(--color-teal-400)",
    PgVector: "var(--color-primary)",
    Pinecone: "var(--color-indigo-400)",
    QdrantCloud: "var(--color-rose-400)",
    Redis: "var(--color-rose-600)",
    TiDB: "var(--color-indigo-600)",
    Vespa: "var(--color-teal-600)", //
    WeaviateCloud: "var(--color-green-600)", //
    ZillizCloud: "var(--color-orange-600)",
  };

  if (dbName in predefinedColors) {
    return predefinedColors[dbName as keyof typeof predefinedColors];
  }

  return "#000000";
};

function Tick({
  tickProps,
  dy,
  textAnchor,
}: {
  tickProps: any;
  dy: number;
  textAnchor: string;
}) {
  const { x, y, payload } = tickProps;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={dy}
        textAnchor={textAnchor}
        fill="currentColor"
        className="text-xs"
      >
        {payload.value}
      </text>
    </g>
  );
}

export const ResultsChart = ({ data }: ResultsChartProps) => {
  if (!data.length) {
    return <div className="text-center py-4">No data available</div>;
  }

  // Get available metrics from the data
  const availableMetrics = new Set<string>();
  data.forEach((item) => {
    item.metricsSet?.forEach((metric) => {
      if (metric_order.includes(metric)) {
        availableMetrics.add(metric);
      }
    });
  });

  const metrics = metric_order.filter((metric) => availableMetrics.has(metric));

  // Group data by case name
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={sortedData}
                      margin={{ bottom: 10, left: 50, right: 75 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontalPoints={Array.from(
                          {
                            length: Math.ceil(
                              (height - AXIS_HEIGHT_AND_PADDING) / 100,
                            ),
                          },
                          (_, i) => i * 100,
                        )}
                      />
                      <XAxis
                        type="number"
                        tick={(props) => (
                          <Tick dy={16} textAnchor="middle" tickProps={props} />
                        )}
                      />
                      <YAxis
                        allowDuplicatedCategory
                        type="category"
                        dataKey="db_label"
                        width={240}
                        tickCount={sortedData.length}
                        tick={(props) => (
                          <Tick dy={4} textAnchor="end" tickProps={props} />
                        )}
                      />
                      <Tooltip content={<FilenameTooltip />} />
                      <Bar
                        dataKey={metric}
                        name={`${metric.replace("_", " ")} (${unit})`}
                        label={{
                          position: "right",
                          formatter: (entry: any) => entry,
                          className: "text-xs fill-black dark:fill-white",
                        }}
                        isAnimationActive={false}
                      >
                        {sortedData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getColor(entry.db_name)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
