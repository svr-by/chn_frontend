import { authStorage } from '@/lib/authStorage';

export interface DownloadAuthenticatedFileOptions {
  url: string;
  companyId: string;
  filename?: string;
}

function parseFilenameFromContentDisposition(
  header: string | null,
): string | null {
  if (!header) {
    return null;
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = header.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] ?? null;
}

export async function downloadAuthenticatedFile({
  url,
  companyId,
  filename,
}: DownloadAuthenticatedFileOptions): Promise<void> {
  const accessToken = authStorage.getAccessToken();
  const headers = new Headers();

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  headers.set('X-Company-Id', companyId);

  const response = await fetch(url, { headers });

  if (!response.ok) {
    let message = `Download failed (${response.status})`;
    try {
      const body = (await response.json()) as {
        error?: { message?: string };
      };
      if (body.error?.message) {
        message = body.error.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const resolvedFilename =
    filename ??
    parseFilenameFromContentDisposition(
      response.headers.get('Content-Disposition'),
    ) ??
    'export.csv';

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = resolvedFilename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
