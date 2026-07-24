import type { DocumentRelationships } from '@/api/generated/models/documentRelationships';
import type { DocumentRelationshipsNodesItem } from '@/api/generated/models/documentRelationshipsNodesItem';
import type { DocumentRelationshipsNodesItemDocumentType } from '@/api/generated/models/documentRelationshipsNodesItemDocumentType';
import { DocumentRelationshipsNodesItemDocumentType as DocumentTypeValues } from '@/api/generated/models/documentRelationshipsNodesItemDocumentType';

/** Procurement-chain order for relationship stages. */
export const RELATIONSHIP_STAGE_ORDER = [
  DocumentTypeValues.MATERIAL_REQUEST,
  DocumentTypeValues.SUPPLIER_QUOTE,
  DocumentTypeValues.PURCHASE_SELECTION,
  DocumentTypeValues.INVOICE,
  DocumentTypeValues.PAYMENT,
  DocumentTypeValues.SHIPPING_INVOICE,
  DocumentTypeValues.CONSOLIDATION,
] as const satisfies readonly DocumentRelationshipsNodesItemDocumentType[];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RelatedStage = {
  documentType: DocumentRelationshipsNodesItemDocumentType;
  nodes: DocumentRelationshipsNodesItem[];
};

export type RelatedGraphView = {
  stages: RelatedStage[];
};

/**
 * Prefer human label; never fall back to raw document ids.
 * UUID-looking labels are treated as missing.
 */
export function getRelationshipNodeLabel(
  node: DocumentRelationshipsNodesItem,
  typeLabel: string,
): string {
  const trimmed = node.label?.trim();
  if (trimmed && !UUID_PATTERN.test(trimmed)) {
    return trimmed;
  }
  if (node.companyName?.trim()) {
    return node.companyName.trim();
  }
  return typeLabel;
}

export function buildRelatedGraphView(
  graph: DocumentRelationships,
  currentDocumentId: string,
): RelatedGraphView {
  const nodesByType = new Map<
    DocumentRelationshipsNodesItemDocumentType,
    DocumentRelationshipsNodesItem[]
  >();

  for (const node of graph.nodes) {
    const bucket = nodesByType.get(node.documentType);
    if (bucket) {
      bucket.push(node);
    } else {
      nodesByType.set(node.documentType, [node]);
    }
  }

  const stages: RelatedStage[] = [];
  const seen = new Set<DocumentRelationshipsNodesItemDocumentType>();

  for (const documentType of RELATIONSHIP_STAGE_ORDER) {
    const nodes = nodesByType.get(documentType);
    if (!nodes?.length) {
      continue;
    }
    stages.push({
      documentType,
      nodes: sortStageNodes(nodes, currentDocumentId),
    });
    seen.add(documentType);
  }

  for (const [documentType, nodes] of nodesByType) {
    if (seen.has(documentType) || nodes.length === 0) {
      continue;
    }
    stages.push({
      documentType,
      nodes: sortStageNodes(nodes, currentDocumentId),
    });
  }

  return { stages };
}

function sortStageNodes(
  nodes: DocumentRelationshipsNodesItem[],
  currentDocumentId: string,
): DocumentRelationshipsNodesItem[] {
  return [...nodes].sort((a, b) => {
    if (a.id === currentDocumentId) {
      return -1;
    }
    if (b.id === currentDocumentId) {
      return 1;
    }
    return a.label.localeCompare(b.label);
  });
}
