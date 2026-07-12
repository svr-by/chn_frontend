export interface LineageEntryInput {
  lineageId: string;
  description: string;
  quantity: string;
  unit?: string | null;
}

export function mapRequestLineToLineageEntry(line: {
  lineageId: string;
  description: string;
  quantity: string;
  unit?: string | null;
}): LineageEntryInput {
  return {
    lineageId: line.lineageId,
    description: line.description,
    quantity: line.quantity,
    unit: line.unit,
  };
}

export function mapNestedRequestLineToLineageEntry(line: {
  lineageId: string;
  quantity: string;
  requestLine: {
    description: string;
    unit?: string | null;
  } | null;
}): LineageEntryInput {
  return {
    lineageId: line.lineageId,
    description: line.requestLine?.description ?? line.lineageId.slice(0, 8),
    quantity: line.quantity,
    unit: line.requestLine?.unit,
  };
}
