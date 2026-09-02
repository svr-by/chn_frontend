import type { LineageTrace } from '@/api/generated/models/lineageTrace';
import { resolveDocumentPath } from '@/lib/documentRoutes';

export type PipelineStage =
  | 'request'
  | 'quotes'
  | 'invoices'
  | 'shipments'
  | 'consolidations';

export interface PipelineSelection {
  id: string;
  quantity: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface PipelineItem {
  documentId: string;
  label: string;
  status: string;
  link: string;
  meta?: Record<string, string>;
  selection?: PipelineSelection;
}

export interface PipelineStep {
  stage: PipelineStage;
  items: PipelineItem[];
}

const STAGE_ORDER: PipelineStage[] = [
  'request',
  'quotes',
  'invoices',
  'shipments',
  'consolidations',
];

function documentMeta(doc: {
  company: { name: string };
  createdAt: string;
  createdBy: { name: string } | null;
}): Record<string, string> {
  return {
    companyName: doc.company.name,
    createdAt: doc.createdAt,
    ...(doc.createdBy?.name ? { createdBy: doc.createdBy.name } : {}),
  };
}

function optionalLineNotes(
  notes: string | null | undefined,
): Record<string, string> {
  const trimmed = notes?.trim();
  return trimmed ? { notes: trimmed } : {};
}

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
          link:
            resolveDocumentPath('MATERIAL_REQUEST', trace.request.id) ?? '#',
          meta: {
            lineNumber: String(trace.requestLine.lineNumber),
            description: trace.requestLine.description,
            quantity: trace.requestLine.quantity,
            unit: trace.requestLine.unit ?? '',
            ...documentMeta(trace.request),
            ...(trace.requestLine.cancelledAt
              ? { cancelledAt: trace.requestLine.cancelledAt }
              : {}),
          },
        },
      ],
    },
    {
      stage: 'quotes',
      items: trace.quotes.map((quote) => {
        const selection = quote.line.selectionLine;

        return {
          documentId: quote.quoteId,
          label: quote.number ?? quote.company.name,
          status: quote.status,
          link: resolveDocumentPath('SUPPLIER_QUOTE', quote.quoteId) ?? '#',
          meta: {
            lineNumber: String(quote.line.lineNumber),
            unitPrice: quote.line.unitPrice,
            quantity: quote.line.quantity,
            lineTotal: quote.line.lineTotal,
            currency: quote.currency,
            ...optionalLineNotes(quote.line.notes),
            ...documentMeta(quote),
          },
          selection: selection
            ? {
                id: selection.id,
                quantity: selection.quantity,
                notes: selection.notes?.trim() || undefined,
                createdAt: selection.createdAt,
                createdBy: selection.createdBy?.name ?? undefined,
              }
            : undefined,
        };
      }),
    },
    {
      stage: 'invoices',
      items: trace.invoices.map((invoice) => ({
        documentId: invoice.invoiceId,
        label: invoice.number || invoice.invoiceId.slice(0, 8),
        status: invoice.status,
        link: resolveDocumentPath('INVOICE', invoice.invoiceId) ?? '#',
        meta: {
          lineNumber: String(invoice.line.lineNumber),
          unitPrice: invoice.line.unitPrice,
          quantity: invoice.line.quantity,
          lineTotal: invoice.line.lineTotal,
          currency: invoice.currency,
          payments: String(invoice.payments.length),
          ...optionalLineNotes(invoice.line.notes),
          ...documentMeta(invoice),
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
          lineNumber: String(shipment.line.lineNumber),
          carrier: shipment.carrier ?? '',
          trackingNumber: shipment.trackingNumber ?? '',
          ...documentMeta(shipment),
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
          ...documentMeta(consolidation),
        },
      })),
    },
  ];

  return STAGE_ORDER.map(
    (stage) =>
      steps.find((step) => step.stage === stage) ?? { stage, items: [] },
  );
}
