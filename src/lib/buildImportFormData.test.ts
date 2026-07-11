import { describe, expect, it } from 'vitest';

import { buildImportFormData } from '@/lib/buildImportFormData';

describe('buildImportFormData', () => {
  it('appends file and optional fields', () => {
    const file = new File(['a,b'], 'lines.csv', { type: 'text/csv' });

    const formData = buildImportFormData({
      file,
      fieldDelimiter: ';',
      decimalSeparator: ',',
      title: '  Imported title  ',
    });

    expect(formData.get('file')).toBe(file);
    expect(formData.get('fieldDelimiter')).toBe(';');
    expect(formData.get('decimalSeparator')).toBe(',');
    expect(formData.get('title')).toBe('Imported title');
  });

  it('omits blank title', () => {
    const file = new File(['a,b'], 'lines.csv', { type: 'text/csv' });

    const formData = buildImportFormData({
      file,
      title: '   ',
    });

    expect(formData.get('title')).toBeNull();
  });
});
