import { Suspense } from "react";

import { getAllResults } from "../server-utils/results";
import { Results } from "../components/Results";

export default async function HomePage() {
  const { chartData, dbNames, caseIds } = await getAllResults();

  return (
    <div>
      <title>VectorDBBench UI</title>

      <Suspense
        fallback={
          <div className="dark:bg-gray-900 flex items-center justify-center h-screen text-center text-lg dark:text-gray-100">
            Loading data...
          </div>
        }
      >
        <Results chartData={chartData} dbNames={dbNames} caseIds={caseIds} />
      </Suspense>
    </div>
  );
}

export const getConfig = () => {
  return {
    render: "static",
  } as const;
};
