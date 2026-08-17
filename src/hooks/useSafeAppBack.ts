import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';

const APP_HISTORY_KEY = 'chn.appHistory';
const MAX_APP_HISTORY_ENTRIES = 50;
const APP_ROOT = '/app';

interface AppHistoryEntry {
  key: string;
  path: string;
}

function isAppPath(path: string) {
  return path === APP_ROOT || path.startsWith(`${APP_ROOT}/`);
}

function getLocationPath(location: Location) {
  return `${location.pathname}${location.search}${location.hash}`;
}

function getPathname(path: string) {
  return path.split(/[?#]/)[0] ?? path;
}

function findPreviousDifferentPathnameEntry(
  entries: AppHistoryEntry[],
  fromIndex: number,
  currentPathname: string,
): AppHistoryEntry | undefined {
  for (let index = fromIndex; index >= 0; index -= 1) {
    const entry = entries[index];
    if (getPathname(entry.path) !== currentPathname) {
      return entry;
    }
  }

  return undefined;
}

function readAppHistory(): AppHistoryEntry[] {
  try {
    const value = window.sessionStorage.getItem(APP_HISTORY_KEY);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry): entry is AppHistoryEntry =>
        typeof entry?.key === 'string' &&
        typeof entry?.path === 'string' &&
        isAppPath(entry.path),
    );
  } catch {
    return [];
  }
}

function writeAppHistory(entries: AppHistoryEntry[]) {
  try {
    window.sessionStorage.setItem(
      APP_HISTORY_KEY,
      JSON.stringify(entries.slice(-MAX_APP_HISTORY_ENTRIES)),
    );
  } catch {
    // Ignore storage failures; callers still fall back to /app.
  }
}

function findCurrentEntryIndex(entries: AppHistoryEntry[], location: Location) {
  const currentPath = getLocationPath(location);
  let keyIndex = -1;
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index].key === location.key) {
      keyIndex = index;
      break;
    }
  }

  if (keyIndex >= 0) {
    return keyIndex;
  }

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index].path === currentPath) {
      return index;
    }
  }

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (getPathname(entries[index].path) === location.pathname) {
      return index;
    }
  }

  return -1;
}

export function useAppHistoryTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = getLocationPath(location);
    if (!isAppPath(path)) {
      return;
    }

    const entries = readAppHistory();
    const last = entries.at(-1);
    if (last?.key === location.key || last?.path === path) {
      return;
    }

    if (last && getPathname(last.path) === location.pathname) {
      writeAppHistory([
        ...entries.slice(0, -1),
        { key: location.key, path },
      ]);
      return;
    }

    writeAppHistory([...entries, { key: location.key, path }]);
  }, [location]);
}

export function useSafeAppBack(fallbackTo = APP_ROOT) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    const fallbackPath = isAppPath(fallbackTo) ? fallbackTo : APP_ROOT;
    const entries = readAppHistory();
    const currentIndex = findCurrentEntryIndex(entries, location);
    const previousEntry =
      currentIndex > 0
        ? findPreviousDifferentPathnameEntry(
            entries,
            currentIndex - 1,
            location.pathname,
          )
        : undefined;

    if (previousEntry && isAppPath(previousEntry.path)) {
      writeAppHistory(entries.slice(0, currentIndex));
      navigate(previousEntry.path, { replace: true });
      return;
    }

    navigate(fallbackPath, { replace: true });
  }, [fallbackTo, location, navigate]);
}
