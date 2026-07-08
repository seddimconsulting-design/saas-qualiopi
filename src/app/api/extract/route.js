import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff'];

/* OCR d'une image (buffer) en français. */
async function ocrImage(buf) {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('fra');
  try {
    const { data } = await worker.recognize(buf);
    return (data.text || '').trim();
  } finally {
    await worker.terminate();
  }
}

/* OCR d'un PDF scanné : rend chaque page en image puis OCR (max 5 pages). */
async function ocrPdf(buf) {
  const { pdfToPng } = await import('pdf-to-png-converter');
  const pages = await pdfToPng(buf, { viewportScale: 2.0 });
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('fra');
  try {
    const out = [];
    for (const p of pages.slice(0, 5)) {
      const { data } = await worker.recognize(p.content);
      out.push(data.text || '');
    }
    return out.join('\n').trim();
  } finally {
    await worker.terminate();
  }
}

export async function POST(req) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }
    const filename = file.name || 'document';
    const ext = filename.split('.').pop().toLowerCase();
    const buf = Buffer.from(await file.arrayBuffer());
    let text = '';
    let ocr = false;

    if (ext === 'pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buf });
      text = ((await parser.getText()).text || '').trim();
      await parser.destroy();
      if (text.length < 20) {
        // PDF probablement scanné (pas de couche texte) -> OCR
        try { text = await ocrPdf(buf); ocr = true; }
        catch (e) { return NextResponse.json({ error: `PDF scanné : OCR indisponible (${e.message}).` }, { status: 422 }); }
      }
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth');
      text = ((await mammoth.extractRawText({ buffer: buf })).value || '').trim();
    } else if (IMAGE_EXT.includes(ext)) {
      try { text = await ocrImage(buf); ocr = true; }
      catch (e) { return NextResponse.json({ error: `OCR de l'image impossible (${e.message}).` }, { status: 422 }); }
    } else {
      text = buf.toString('utf8').trim();
    }

    if (!text) {
      return NextResponse.json({ error: "Aucun texte extrait (document vide ou illisible)." }, { status: 422 });
    }
    return NextResponse.json({ filename, text, ocr });
  } catch (e) {
    return NextResponse.json({ error: `Extraction impossible : ${e.message}` }, { status: 500 });
  }
}
