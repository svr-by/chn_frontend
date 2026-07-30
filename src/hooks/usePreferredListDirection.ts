import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  directionForTradingRole,
  isListDirection,
  readPreferredTradingRole,
  tradingRoleForDirection,
  writePreferredTradingRole,
  type ListDirection,
  type ListDirectionFamily,
} from '@/lib/preferredDirection';

type PreferredListDirectionParam = 'direction' | 'tab';

type UsePreferredListDirectionOptions = {
  paramName: PreferredListDirectionParam;
  /** Current page meaning when the query param is absent */
  absentMeans: ListDirection;
  /** How inbound/outbound map to buyer/supplier on this page */
  family: ListDirectionFamily;
};

function applyDirectionToParams(
  params: URLSearchParams,
  paramName: PreferredListDirectionParam,
  direction: ListDirection,
): void {
  if (paramName === 'tab') {
    if (direction === 'outbound') {
      params.delete('tab');
    } else {
      params.set('tab', direction);
    }
    return;
  }

  params.set(paramName, direction);
}

export function usePreferredListDirection({
  paramName,
  absentMeans,
  family,
}: UsePreferredListDirectionOptions): {
  direction: ListDirection;
  setDirection: (next: ListDirection) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get(paramName);

  const preferredRole = readPreferredTradingRole();
  const direction: ListDirection = isListDirection(rawParam)
    ? rawParam
    : preferredRole
      ? directionForTradingRole(preferredRole, family)
      : absentMeans;

  useEffect(() => {
    if (isListDirection(rawParam)) {
      return;
    }

    if (direction === absentMeans) {
      return;
    }

    const params = new URLSearchParams(searchParams);
    applyDirectionToParams(params, paramName, direction);
    setSearchParams(params, { replace: true });
  }, [
    absentMeans,
    direction,
    paramName,
    rawParam,
    searchParams,
    setSearchParams,
  ]);

  const setDirection = useCallback(
    (next: ListDirection) => {
      writePreferredTradingRole(tradingRoleForDirection(next, family));
      const params = new URLSearchParams(searchParams);
      applyDirectionToParams(params, paramName, next);
      setSearchParams(params);
    },
    [family, paramName, searchParams, setSearchParams],
  );

  return { direction, setDirection };
}
