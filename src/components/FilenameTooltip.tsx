import { TooltipProps } from "recharts";
import { ChartData } from "../server-utils/results";

export function FilenameTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload[0]) {
    const { db_label, filename } = payload[0]?.payload as ChartData;
    const { name, value } = payload[0];
    return name && value && filename ? (
      <div className="bg-white border border-gray-200 rounded shadow-lg p-2 text-xs dark:bg-gray-700 dark:border-gray-700">
        <p className="font-bold">{db_label}</p>
        <p>{`${name}: ${value}`}</p>
        {filename && <p className="text-gray-600 dark:text-gray-300">File: {filename}</p>}
      </div>
    ) : null;
  }
  return null;
}