export const caseLabels = {
  1: "Capacity (128D)",
  2: "Capacity (960D)",
  3: "Performance (100M, 768D)",
  4: "Performance (10M, 768D)",
  5: "Performance (1M, 768D)",
  6: "Filtering (10M, 768D, 1%)",
  7: "Filtering (1M, 768D, 1%)",
  8: "Filtering (10M, 768D, 99%)",
  9: "Filtering (1M, 768D, 99%)",
  10: "Performance (500K, 1536D)",
  11: "Performance (5M, 1536D)",
  12: "Filtering (500K, 1536D, 1%)",
  13: "Filtering (5M, 1536D, 1%)",
  14: "Filtering (500K, 1536D, 99%)",
  15: "Filtering (5M, 1536D, 99%)",
  50: "Performance (50K, 1536D)",
  100: "Custom",
  101: "Custom Dataset Performance",
} as const;

export const metric_order = [
  "qps",
  "serial_latency_p99",
  "recall",
  "load_duration",
  "max_load_count",
];
