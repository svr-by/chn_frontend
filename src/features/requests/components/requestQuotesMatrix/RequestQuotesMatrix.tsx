import { QuoteComparisonMatrix } from '@/features/quotes/components/QuoteComparisonMatrix';

interface RequestQuotesMatrixProps {
  companyId: string;
  requestId: string;
}

export function RequestQuotesMatrix({
  companyId,
  requestId,
}: RequestQuotesMatrixProps) {
  return <QuoteComparisonMatrix companyId={companyId} requestId={requestId} />;
}
