import { Navigate } from 'react-router-dom';

export function InboundRequestsPage() {
  return <Navigate to="/app/requests?tab=inbound" replace />;
}
