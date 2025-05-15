"use client";

import { RadioGroup } from "radix-ui";

export function Radiobox({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex items-center mb-2">
      <RadioGroup.Item
        className="flex size-[20px] appearance-none items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-300 outline-none hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-primary"
        value={value}
      >
        <RadioGroup.Indicator className="after:block after:w-[7px] after:h-[7px] after:rounded-full after:bg-gray-700 dark:after:bg-white" />
      </RadioGroup.Item>
      <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
        {label}
      </span>
    </label>
  );
}
