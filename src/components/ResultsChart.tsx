'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { ChartData } from '../server-utils/results';
import { metric_order, caseLabels } from '../client-utils/constants';

interface ResultsChartProps {
  data: ChartData[];
}

export const metric_unit_map: Record<string, string> = {
  qps: 'QPS',
  serial_latency_p99: 'ms',
  recall: '%',
  load_duration: 's',
  max_load_count: 'k',
};

function isLessBetter(metric: string) {
  return ['load_duration', 'serial_latency_p99'].includes(metric);
}

const getColor = (dbName: string, index: number) => {
  // Base color: hsl(154, 90%, 50%)
  // Others partly perceptually tweaked.
  const predefinedColors = {
    'AWSOpenSearch': "hsl(34, 100%, 60%)",
    'ElasticCloud': "hsl(69, 90%, 60%)",
    "LanceDB": "hsl(154, 90%, 50%)",
    'Milvus': "hsl(214, 100%, 70%)",
    'PgVector': "hsl(274, 100%, 70%)",
    'Pinecone': "hsl(334, 90%, 50%)",
    'QdrantCloud': "hsl(334, 90%, 35%)",
    'Redis': "hsl(274, 90%, 35%)",
    'TiDB': "hsl(214, 90%, 35%)",
    'Vespa': "hsl(154, 90%, 35%)",
    'WeaviateCloud': "hsl(69, 90%, 35%)",
    'ZillizCloud': "hsl(34, 90%, 35%)",
  };

  if (dbName in predefinedColors) {
    return predefinedColors[dbName as keyof typeof predefinedColors];
  }

  return "#000000";
};

export const ResultsChart = ({ data }: ResultsChartProps) => {
  if (!data.length) {
    return <div className="text-center py-4">No data available</div>;
  }

  // Get available metrics from the data
  const availableMetrics = new Set<string>();
  data.forEach(item => {
    item.metricsSet?.forEach(metric => {
      if (metric_order.includes(metric)) {
        availableMetrics.add(metric);
      }
    });
  });

  const metrics = metric_order.filter(metric => availableMetrics.has(metric));

  // Group data by case name
  const dataByCase = data.reduce((acc, item) => {
    if (!acc[item.case_id]) {
      acc[item.case_id] = [];
    }
    acc[item.case_id]!.push(item);
    return acc;
  }, {} as Record<keyof typeof caseLabels, ChartData[]>);

  return (
    <div>
      {Object.entries(dataByCase).map(([caseId, caseData]) => (
        <div key={caseId} className="mb-8">
          <h3 className="text-lg font-semibold mb-2">{caseLabels[parseInt(caseId, 10) as keyof typeof caseLabels]}</h3>

          {metrics.map(metric => {
            const filteredData = caseData.filter(item =>
              item.metricsSet?.includes(metric) &&
              typeof item[metric as keyof ChartData] === 'number' &&
              (item[metric as keyof ChartData] as number) > 1e-7
            );

            if (!filteredData.length) return null;

            const sortedData = [...filteredData].sort((a, b) => {
              if (isLessBetter(metric)) {
                return (a[metric as keyof ChartData] as number) - (b[metric as keyof ChartData] as number);
              }
              return (b[metric as keyof ChartData] as number) - (a[metric as keyof ChartData] as number);
            });

            const unit = metric_unit_map[metric] || '';

            return (
              <div key={metric} className="mb-6 print:break-inside-avoid">
                <h4 className="text-md font-medium mb-1">
                  {[metric[0]!.toLocaleUpperCase(), metric.slice(1).toLocaleLowerCase().replaceAll('_', ' ')].join('')}
                  {!["qps", "recall"].includes(metric) && ` in ${unit}`}
                  <span className="text-xs text-gray-500 ml-1">
                    ({isLessBetter(metric) ? 'less' : 'more'} is better)
                  </span>
                </h4>

                <div style={{ height: `${sortedData.length * 30}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={sortedData}
                      margin={{ bottom: 10, left: 50, right: 75 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        className='text-xs'
                      />
                      <YAxis
                        allowDuplicatedCategory
                        type="category"
                        dataKey="db_label"
                        width={240}
                        className='text-xs'
                        tickCount={sortedData.length}
                      />
                      <Bar
                        dataKey={metric}
                        name={`${metric.replace('_', ' ')} (${unit})`}
                        label={{
                          position: 'right',
                          formatter: (entry: any) => entry,
                          className: 'fill-black'
                        }}
                        isAnimationActive={false}
                        className='text-xs'
                      >
                        {sortedData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColor(entry.db_name, index)} />
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


