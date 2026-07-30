import { describe, expect, it, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

import { usePreferredListDirection } from '@/hooks/usePreferredListDirection';
import {
  PREFERRED_TRADING_ROLE_STORAGE_KEY,
  readPreferredTradingRole,
  writePreferredTradingRole,
} from '@/lib/preferredDirection';

function createWrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
  };
}

describe('usePreferredListDirection', () => {
  beforeEach(() => {
    localStorage.removeItem(PREFERRED_TRADING_ROLE_STORAGE_KEY);
  });

  it('falls back to absentMeans when storage and URL are empty', () => {
    const { result } = renderHook(
      () =>
        usePreferredListDirection({
          paramName: 'direction',
          absentMeans: 'inbound',
          family: 'documents',
        }),
      { wrapper: createWrapper('/app/quotes') },
    );

    expect(result.current.direction).toBe('inbound');
  });

  it('maps stored buyer role to inbound on documents pages', () => {
    writePreferredTradingRole('buyer');

    const { result } = renderHook(
      () =>
        usePreferredListDirection({
          paramName: 'direction',
          absentMeans: 'inbound',
          family: 'documents',
        }),
      { wrapper: createWrapper('/app/quotes') },
    );

    expect(result.current.direction).toBe('inbound');
  });

  it('maps stored buyer role to outbound on requests pages', () => {
    writePreferredTradingRole('buyer');

    const { result } = renderHook(
      () =>
        usePreferredListDirection({
          paramName: 'tab',
          absentMeans: 'outbound',
          family: 'requests',
        }),
      { wrapper: createWrapper('/app/requests') },
    );

    expect(result.current.direction).toBe('outbound');
  });

  it('maps stored supplier role to outbound on documents pages', () => {
    writePreferredTradingRole('supplier');

    const { result } = renderHook(
      () =>
        usePreferredListDirection({
          paramName: 'direction',
          absentMeans: 'inbound',
          family: 'documents',
        }),
      { wrapper: createWrapper('/app/quotes') },
    );

    expect(result.current.direction).toBe('outbound');
  });

  it('prefers URL param over stored role', () => {
    writePreferredTradingRole('supplier');

    const { result } = renderHook(
      () =>
        usePreferredListDirection({
          paramName: 'direction',
          absentMeans: 'inbound',
          family: 'documents',
        }),
      { wrapper: createWrapper('/app/quotes?direction=inbound') },
    );

    expect(result.current.direction).toBe('inbound');
  });

  it('writes supplier role when documents page switches to outbound', () => {
    const { result } = renderHook(
      () =>
        usePreferredListDirection({
          paramName: 'direction',
          absentMeans: 'inbound',
          family: 'documents',
        }),
      { wrapper: createWrapper('/app/quotes') },
    );

    act(() => {
      result.current.setDirection('outbound');
    });

    expect(result.current.direction).toBe('outbound');
    expect(readPreferredTradingRole()).toBe('supplier');
  });

  it('writes buyer role when requests page switches to outbound', () => {
    const { result } = renderHook(
      () =>
        usePreferredListDirection({
          paramName: 'tab',
          absentMeans: 'outbound',
          family: 'requests',
        }),
      { wrapper: createWrapper('/app/requests?tab=inbound') },
    );

    expect(result.current.direction).toBe('inbound');

    act(() => {
      result.current.setDirection('outbound');
    });

    expect(result.current.direction).toBe('outbound');
    expect(readPreferredTradingRole()).toBe('buyer');
  });
});
