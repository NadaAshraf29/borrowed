'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth-store';
import { useBagStore } from '@/lib/bag-store';
import { useFavoritesStore } from '@/lib/favorites-store';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const initAuth = useAuthStore((s) => s.initAuth);
  const initBag = useBagStore((s) => s.initBag);
  const initFavorites = useFavoritesStore((s) => s.initFavorites);

  useEffect(() => {
    initAuth();
    initBag();
    initFavorites();
  }, [initAuth, initBag, initFavorites]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

