'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';
import { useWebSocketStore } from '@/store/useWebSocketStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { connect, disconnect } = useWebSocketStore();

  useEffect(() => {
    setMounted(true);

    // Connect WebSocket
    const token = localStorage.getItem('token');
    connect(token || undefined);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        richColors
        expand
        closeButton
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
