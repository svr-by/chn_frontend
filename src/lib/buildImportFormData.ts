export type CsvFieldDelimiter = ',' | ';' | '\t' | 'tab';
export type CsvDecimalSeparator = '.' | ',';

export interface ImportFormOptions {
  file: File;
  fieldDelimiter?: CsvFieldDelimiter;
  decimalSeparator?: CsvDecimalSeparator;
  title?: string;
}

export function buildImportFormData({
  file,
  fieldDelimiter,
  decimalSeparator,
  title,
}: ImportFormOptions): FormData {
  const formData = new FormData();
  formData.append('file', file);

  if (fieldDelimiter !== undefined) {
    formData.append('fieldDelimiter', fieldDelimiter);
  }

  if (decimalSeparator !== undefined) {
    formData.append('decimalSeparator', decimalSeparator);
  }

  if (title !== undefined && title.trim() !== '') {
    formData.append('title', title.trim());
  }

  return formData;
}
