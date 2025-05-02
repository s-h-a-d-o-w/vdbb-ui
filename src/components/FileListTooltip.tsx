'use client';

import { useState, ReactNode } from 'react';

interface FileListTooltipProps {
  files: string[];
  children: ReactNode;
}

export const FileListTooltip = ({ files, children }: FileListTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  if (files.length === 0) {
    return <>{children}</>;
  }

  return (
    <div
      className="cursor-default"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      {isVisible && files.length > 0 && (
        <div className="absolute z-10 left-1 bg-white border border-gray-200 rounded shadow-lg p-3">
            <ul className="text-xs space-y-1">
              {files.map((file, index) => (
                <li key={index} title={file}>
                  {file}
                </li>
              ))}
            </ul>
        </div>
      )}
    </div>
  );
};