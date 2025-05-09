import { Suspense } from 'react';

import { getAllResults } from '../server-utils/results';
import { Results } from '../components/Results';

export default async function HomePage() {
  const { results, chartData, dbNames, caseIds } = await getAllResults();

  return (
    <div>
      <title>VectorDBBench UI</title>

      <Suspense fallback={<div>Loading filters and charts...</div>}>
        <Results
          results={results}
          chartData={chartData}
          dbNames={dbNames}
          caseIds={caseIds}
        />
      </Suspense>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
