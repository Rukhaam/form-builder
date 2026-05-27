'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '../utils/trpc.js';

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://form-builder-7vyq.onrender.com').replace(/\/+$/, '');

export function TrpcProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error?.data?.code === 'UNAUTHORIZED') {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  }));
  
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${apiUrl}/trpc`,
          
          fetchOptions: {
            credentials: 'include', 
          },

          async headers() {
            const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
            return {
              ...(token && { Authorization: `Bearer ${token}` }),
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}