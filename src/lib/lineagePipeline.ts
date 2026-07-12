import type { LineageTrace } from '@/api/generated/models/lineageTrace';
import { resolveDocumentPath } from '@/lib/documentRoutes';

export type PipelineStage =
  | 'request'
  | 'quotes'
  | 'selections'
  | 'invoices'
  | 'shipments'
  | 'consolidations';

export interface PipelineItem {
  documentId: string;
  label: string;
  status: string;
  link: string;
  meta?: Record<string, string>;
}

export interface PipelineStep {
  stage: PipelineStage;
  items: PipelineItem[];
}

const STAGE_ORDER: PipelineStage[] = [
  'request',
  'quotes',
  'selections',
  'invoices',
  'shipments',
  'consolidations',
];

export function buildLineagePipeline(trace: LineageTrace): PipelineStep[] {
  const steps: PipelineStep[] = [
    {
      stage: 'request',
      items: [
        {
          documentId: trace.request.id,
          label:
            trace.request.title ??
            trace.request.reference ??
            trace.request.id.slice(0, 8),
          status: trace.request.status,
          link: resolveDocumentPath('MATERIAL_REQUEST', trace.request.id) ?? '#',
          meta: {
            lineNumber: String(trace.requestLine.lineNumber),
            description: trace.requestLine.description,
            quantity: trace.requestLine.quantity,
            unit: trace.requestLine.unit ?? '',
          },
        },
      ],
    },
    {
      stage: 'quotes',
      items: trace.quotes.map((quote) => ({
        documentId: quote.quoteId,
        label: quote.supplierCompany.name,
        status: quote.status,
        link: resolveDocumentPath('SUPPLIER_QUOTE', quote.quoteId) ?? '#',
        meta: {
          unitPrice: quote.line.unitPrice,
          quantity: quote.line.quantity,
          currency: quote.currency,
        },
      })),
    },
    {
      stage: 'selections',
      items: trace.selections.map((selection) => ({
        documentId: selection.selectionId,
        label: selection.selectionId.slice(0, 8),
        status: selection.status,
        link:
          resolveDocumentPath('PURCHASE_SELECTION', selection.selectionId) ?? '#',
        meta: {
          quantity: selection.line.quantity,
        },
      })),
    },
    {
      stage: 'invoices',
      items: trace.invoices.map((invoice) => ({
        documentId: invoice.invoiceId,
        label: invoice.invoiceNumber ?? invoice.invoiceId.slice(0, 8),
        status: invoice.status,
        link: resolveDocumentPath('INVOICE', invoice.invoiceId) ?? '#',
        meta: {
          supplier: invoice.supplierCompany.name,
          currency: invoice.currency,
          payments: String(invoice.payments.length),
        },
      })),
    },
    {
      stage: 'shipments',
      items: trace.shipments.map((shipment) => ({
        documentId: shipment.shippingInvoiceId,
        label:
          shipment.trackingNumber ??
          shipment.carrier ??
          shipment.shippingInvoiceId.slice(0, 8),
        status: shipment.status,
        link:
          resolveDocumentPath('SHIPPING_INVOICE', shipment.shippingInvoiceId) ??
          '#',
        meta: {
          carrier: shipment.carrier ?? '',
          trackingNumber: shipment.trackingNumber ?? '',
        },
      })),
    },
    {
      stage: 'consolidations',
      items: trace.consolidations.map((consolidation) => ({
        documentId: consolidation.consolidationId,
        label: consolidation.consolidationId.slice(0, 8),
        status: consolidation.status,
        link:
          resolveDocumentPath('CONSOLIDATION', consolidation.consolidationId) ??
          '#',
        meta: {
          transportMode: consolidation.transportMode ?? '',
          trackingNumber: consolidation.trackingNumber ?? '',
          linkedViaShippingInvoiceId: consolidation.linkedViaShippingInvoiceId,
        },
      })),
    },
  ];

  return STAGE_ORDER.map(
    (stage) => steps.find((step) => step.stage === stage) ?? { stage, items: [] },
  );
}
