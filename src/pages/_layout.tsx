import "../styles.css";

import type { ReactNode } from "react";

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await getData();

  return (
    <div className="font-['Nunito'] dark:bg-gray-900 dark:text-white">
      <meta name="description" content={data.description} />
      <link rel="icon" type="image/png" href={data.icon} />
      <main>{children}</main>
    </div>
  );
}

const getData = () => {
  const data = {
    description: "VectorDBBench UI",
    icon: "/images/favicon.png",
  };

  return data;
};

export const getConfig = () => {
  return {
    render: "static",
  } as const;
};
