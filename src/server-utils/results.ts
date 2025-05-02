import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { caseLabels } from '../client-utils/constants';

export interface Metric {
  max_load_count: number;
  load_duration: number;
  qps: number;
  serial_latency_p99: number;
  recall: number;
  ndcg: number;
  conc_num_list?: number[];
  conc_qps_list: number[];
  conc_latency_p99_list: number[];
  conc_latency_avg_list: number[];
}

export interface TaskConfig {
  db: string;
  db_name?: string;
  db_config: {
    db_label?: string;
  };
  db_case_config: {
    // WIP types (Some of them might be optional and the ones that are currently null obviously don't have the appropriate type yet)
    metric_type: string;
    create_index_before_load: boolean;
    create_index_after_load: boolean;
    lists: number;
    probes: number;
    maintenance_work_mem: string;
    max_parallel_workers: number;
    quantization_type: string;
    table_quantization_type: string;
    reranking: null;
    quantized_fetch_limit: null;
    reranking_metric: null;

    index?: string;
  };
  case_config: {
    case_id: keyof typeof caseLabels;
    concurrency_search_config: {
      num_concurrency: number[];
      concurrency_duration: number;
    }
  };
}

export interface CaseResult {
  metrics: Metric;
  task_config: TaskConfig;
  label: string;
}

export interface TestResult {
  run_id: string;
  task_label: string;
  results: CaseResult[];
  timestamp?: number;
  fileDate?: Date;
  filename?: string;
}

export interface ChartData {
  db: string;
  db_name: string;
  db_label: string;
  case_id: keyof typeof caseLabels;
  load_duration: number;
  qps: number;
  serial_latency_p99: number;
  recall: number;
  max_load_count: number;
  metricsSet: string[];
  fileDate?: Date;
  filename?: string;
}

export type Results = {
  results: TestResult[];
  chartData: ChartData[];
  dbNames: string[];
  caseIds: Array<keyof typeof caseLabels>;
}

export const extractDateFromFilename = (filename: string): Date | null => {
  // Look for a pattern like "result_20240512_..." or any 8-digit sequence
  const dateMatch = filename.match(/\d{8}/);
  if (dateMatch) {
    const dateStr = dateMatch[0];
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  }
  return null;
};

// Read and process all result files
export const getAllResults = async (): Promise<Results> => {
  try {
    const files = await readdir('./private', { recursive: true });
    const resultFiles = files.filter(file => {
      const basename = path.basename(file);
      return basename.startsWith('result_') && basename.endsWith('.json');
    });

    const results: TestResult[] = [];

    for (const file of resultFiles) {
      const basename = path.basename(file);
      const fileDate = extractDateFromFilename(basename);

      const content = await readFile(path.join('./private', file), 'utf-8');
      const result = JSON.parse(content) as TestResult;

      // Add the fileDate and filename to the result object
      if (fileDate) {
        result.fileDate = fileDate;
      }
      result.filename = basename;

      results.push(result);
    }

    const chartData = processResultsForChart(results);
    const dbNames = [...new Set(chartData.map(d => d.db_name))];
    const caseIds = [...new Set(chartData.map(d => d.case_id))];

    return { results, chartData, dbNames, caseIds };
  } catch (error) {
    console.error('Error reading result files:', error);
    return { results: [], chartData: [], dbNames: [], caseIds: [] };
  }
};

function generateLabel(config: TaskConfig, metrics: Metric): string {
  const label = config.db_config.db_label ?
    config.db_config.db_label.length > 10 ?
      config.db_config.db_label.slice(0, 10) + "..." :
      config.db_config.db_label
    : undefined;

  // metrics.conc_num_list isn't defined for capacity cases
  return `${config.db} (${[label, config.db_case_config.index || 'No index info', metrics.conc_num_list ? metrics.conc_num_list.join(', ') + 'T' : undefined].filter(Boolean).join(', ')})`;
}

const processResultsForChart = (results: TestResult[]): ChartData[] => {
  const allCaseResults: CaseResult[] = results.flatMap(r => {
    // Add fileDate and filename to each case result
    return r.results.map(caseResult => ({
      ...caseResult,
      fileDate: r.fileDate,
      filename: r.filename
    }));
  });

  return allCaseResults.map(caseResult => {
    const metricsSet = new Set<string>();
    const metrics = caseResult.metrics;

    // Add metrics that exist to the set
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 1e-7 && !Array.isArray(value)) {
        metricsSet.add(key);
      }
    });

    return {
      db: caseResult.task_config.db,
      db_name: caseResult.task_config.db_name || caseResult.task_config.db,
      db_label: generateLabel(caseResult.task_config, caseResult.metrics),
      case_id: caseResult.task_config.case_config.case_id,
      metricsSet: Array.from(metricsSet),
      fileDate: (caseResult as any).fileDate,
      filename: (caseResult as any).filename,
      ...metrics,
      serial_latency_p99: Math.round(metrics.serial_latency_p99 * 1000 * 100) / 100,
      qps: Math.round(metrics.qps),
      recall: metrics.recall,
      load_duration: Math.round(metrics.load_duration * 10) / 10,
    } satisfies ChartData;
  });
};