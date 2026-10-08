import { SiteText } from '@/lib/SiteText';
import { useState } from 'react';

export default function DocumentDownload({ url }: { url: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const documentUrl = new URL(url, window.location.origin);
  // Use a fresh URL so previews cannot reuse the previous cached f.txt header.
  if (documentUrl.origin === window.location.origin) documentUrl.searchParams.set('pdfVersion', '2');

  const download = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(documentUrl.href, { cache: 'no-store' });
      if (!response.ok) throw new Error('Download failed');
      const bytes = await response.arrayBuffer();
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') throw new Error('Invalid PDF');
      const filename = decodeURIComponent(documentUrl.pathname.split('/').pop() || 'brochure.pdf')
        .replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '') + '.pdf';
      const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch {
      setError('The PDF could not be downloaded. Please try again, or open the preview and save it there.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="mt-5">
    <div className="flex flex-wrap items-center gap-4">
      <button type="button" onClick={download} disabled={busy} className="rounded bg-red-600 px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Downloading...' : 'Download PDF'}</button>
      <a href={documentUrl.href} target="_blank" rel="noopener noreferrer" className="font-bold text-red-700 underline"><SiteText section="DocumentDownload" name="preview_pdf" /></a>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </div>;
}
