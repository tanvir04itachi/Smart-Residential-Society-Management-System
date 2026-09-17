'use client';

import { ReactNode, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { createQueryClient } from '@/lib/query-client';
import { AuthBootstrap } from './AuthBootstrap';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthBootstrap>{children}</AuthBootstrap>
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
