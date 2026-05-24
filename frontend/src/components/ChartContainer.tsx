'use client';

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  children: React.ReactElement;
  className?: string;
  minHeight?: number;
}

export default function ChartContainer({
  children,
  className = 'w-full h-full min-h-[200px]',
  minHeight = 200,
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className} style={{ minHeight }} aria-hidden />;
  }

  return (
    <div className={className} style={{ minHeight, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={minHeight}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
