"use client";

import { Checkbox as RadixCheckbox } from "radix-ui";
import { CheckIcon } from "@radix-ui/react-icons";

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center mb-2">
      <RadixCheckbox.Root
        className="flex size-[20px] appearance-none items-center justify-center rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-300 outline-none hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-primary"
        checked={checked}
        onCheckedChange={onChange}
      >
        <RadixCheckbox.Indicator>
          <CheckIcon />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
        {label}
      </span>
    </label>
  );
}
