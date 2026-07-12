import { useCallback, useEffect, useRef, useState } from 'react';

interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

interface UseCursorListOptions<T> {
  enabled?: boolean;
  fetchPage: (cursor?: string) => Promise<CursorPage<T>>;
  resetKey?: string;
}

export function useCursorList<T>({
  enabled = true,
  fetchPage,
  resetKey = '',
}: UseCursorListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const fetchPageRef = useRef(fetchPage);

  fetchPageRef.current = fetchPage;

  const reset = useCallback(() => {
    setItems([]);
    setNextCursor(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const page = await fetchPageRef.current();
        if (cancelled) {
          return;
        }
        setItems(page.items);
        setNextCursor(page.nextCursor);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitial();

    return () => {
      cancelled = true;
    };
  }, [enabled, resetKey, reset]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);
    try {
      const page = await fetchPageRef.current(nextCursor);
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, nextCursor]);

  return {
    items,
    hasMore: nextCursor !== null,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    reset,
  };
}
