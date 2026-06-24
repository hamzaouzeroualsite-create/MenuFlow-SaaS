import QRCodeLib from 'qrcode';

export function getMenuUrl(slug: string, tableNumber?: number): string {
  const base = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://menuflow.ma';
  const url = `${base}/r/${slug}`;
  return tableNumber ? `${url}?t=${tableNumber}` : url;
}

export async function generateQRCodeDataUrl(url: string, size = 256): Promise<string> {
  return QRCodeLib.toDataURL(url, {
    width: size,
    margin: 2,
    color: { dark: '#111827', light: '#FFFFFF' },
  });
}

export async function generateQRCodeSVG(url: string): Promise<string> {
  return QRCodeLib.toString(url, { type: 'svg', margin: 2 });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export async function downloadQRPNG(url: string, filename: string) {
  const dataUrl = await generateQRCodeDataUrl(url, 512);
  downloadDataUrl(dataUrl, filename);
}

export async function downloadQRSVG(url: string, filename: string) {
  const svg = await generateQRCodeSVG(url);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function printQRCode(dataUrl: string, title: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html><head><title>${title}</title>
    <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif}
    h1{margin-bottom:20px}img{width:300px;height:300px}</style></head>
    <body><h1>${title}</h1><img src="${dataUrl}" /><script>window.onload=()=>window.print()</script></body></html>
  `);
  win.document.close();
}

export async function shareQRCode(url: string, title: string) {
  if (navigator.share) {
    await navigator.share({ title, url });
  } else {
    await navigator.clipboard.writeText(url);
  }
}
