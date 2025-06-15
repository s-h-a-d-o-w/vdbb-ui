import useLocalStorageState from "use-local-storage-state";

export function useIsDarkMode() {
  const [darkMode] = useLocalStorageState("darkMode", {
    defaultValue:
      (typeof window !== "undefined" &&
        window?.matchMedia?.("(prefers-color-scheme: dark)").matches) ||
      false,
  });
  return darkMode;
}
