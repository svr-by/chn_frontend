import type { GetCompaniesCompanyIdRequestLinesInboundParams } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesInboundParams';
import type { GetCompaniesCompanyIdRequestLinesParams } from '@/api/generated/models/getCompaniesCompanyIdRequestLinesParams';

export type RequestLinesTab = 'outbound' | 'inbound';

export type PipelineFilterValue = 'any' | 'true' | 'false';

export type RequestLinesFiltersValue = {
  q: string;
  createdByUserId: string;
  buyerCompanyId: string;
  distributed: PipelineFilterValue;
  quoted: PipelineFilterValue;
  selected: PipelineFilterValue;
  invoiced: PipelineFilterValue;
  shipped: PipelineFilterValue;
};

export const DEFAULT_REQUEST_LINES_FILTERS: RequestLinesFiltersValue = {
  q: '',
  createdByUserId: '',
  buyerCompanyId: '',
  distributed: 'any',
  quoted: 'any',
  selected: 'any',
  invoiced: 'any',
  shipped: 'any',
};

function pipelineParam(
  value: PipelineFilterValue,
): 'true' | 'false' | undefined {
  return value === 'any' ? undefined : value;
}

export function buildOutboundRequestLinesQueryArgs({
  companyId,
  limit,
  offset,
  filters,
}: {
  companyId: string;
  limit: number;
  offset: number;
  filters: RequestLinesFiltersValue;
}): { companyId: string } & GetCompaniesCompanyIdRequestLinesParams {
  const trimmedQ = filters.q.trim();
  const createdByUserId = filters.createdByUserId.trim();
  const distributed = pipelineParam(filters.distributed);
  const quoted = pipelineParam(filters.quoted);
  const selected = pipelineParam(filters.selected);
  const invoiced = pipelineParam(filters.invoiced);
  const shipped = pipelineParam(filters.shipped);

  return {
    companyId,
    limit,
    offset,
    sortBy: 'requestCreatedAt',
    sortOrder: 'desc',
    ...(trimmedQ ? { q: trimmedQ } : {}),
    ...(createdByUserId ? { createdByUserId } : {}),
    ...(distributed ? { distributed } : {}),
    ...(quoted ? { quoted } : {}),
    ...(selected ? { selected } : {}),
    ...(invoiced ? { invoiced } : {}),
    ...(shipped ? { shipped } : {}),
  };
}

export function buildInboundRequestLinesQueryArgs({
  companyId,
  limit,
  offset,
  filters,
}: {
  companyId: string;
  limit: number;
  offset: number;
  filters: RequestLinesFiltersValue;
}): { companyId: string } & GetCompaniesCompanyIdRequestLinesInboundParams {
  const trimmedQ = filters.q.trim();
  const buyerCompanyId = filters.buyerCompanyId.trim();
  const quoted = pipelineParam(filters.quoted);

  return {
    companyId,
    limit,
    offset,
    sortBy: 'requestCreatedAt',
    sortOrder: 'desc',
    ...(trimmedQ ? { q: trimmedQ } : {}),
    ...(buyerCompanyId ? { buyerCompanyId } : {}),
    ...(quoted ? { quoted } : {}),
  };
}

export function clearFiltersOnTabChange(
  _nextTab: RequestLinesTab,
  prev: RequestLinesFiltersValue,
): RequestLinesFiltersValue {
  return {
    ...prev,
    createdByUserId: '',
    buyerCompanyId: '',
  };
}

export function areRequestLinesFiltersEqual(
  a: RequestLinesFiltersValue,
  b: RequestLinesFiltersValue,
): boolean {
  return (
    a.q === b.q &&
    a.createdByUserId === b.createdByUserId &&
    a.buyerCompanyId === b.buyerCompanyId &&
    a.distributed === b.distributed &&
    a.quoted === b.quoted &&
    a.selected === b.selected &&
    a.invoiced === b.invoiced &&
    a.shipped === b.shipped
  );
}

function countPipelineFilters(filters: RequestLinesFiltersValue): number {
  let count = 0;
  if (filters.distributed !== 'any') count += 1;
  if (filters.quoted !== 'any') count += 1;
  if (filters.selected !== 'any') count += 1;
  if (filters.invoiced !== 'any') count += 1;
  if (filters.shipped !== 'any') count += 1;
  return count;
}

export function countActiveRequestLinesFilters(
  filters: RequestLinesFiltersValue,
  tab: RequestLinesTab,
): number {
  let count = 0;
  if (filters.q.trim() !== '') count += 1;
  if (tab === 'outbound') {
    if (filters.createdByUserId.trim() !== '') count += 1;
    count += countPipelineFilters(filters);
  } else {
    if (filters.buyerCompanyId.trim() !== '') count += 1;
    if (filters.quoted !== 'any') count += 1;
  }
  return count;
}
