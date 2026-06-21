'use client';

import { useEffect, useState } from 'react';

import { trpc } from '@/utils/trpc';

export function useSessionUser({ enabled = true } = {}) {
  const [user, setUser] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);
  const refreshMutation = trpc.auth.refresh.useMutation();

  useEffect(() => {
    if (!enabled) {
      setHasChecked(true);
      return;
    }

    let active = true;
    setHasChecked(false);

    refreshMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (active) setUser(data?.user || null);
      },
      onError: () => {
        if (active) setUser(null);
      },
      onSettled: () => {
        if (active) setHasChecked(true);
      },
    });

    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    user,
    isLoading: enabled && !hasChecked,
    isError: refreshMutation.isError,
  };
}
