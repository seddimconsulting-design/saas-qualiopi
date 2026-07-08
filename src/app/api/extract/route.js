import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff'];

/* Extraction de texte serveur (rapide). L'OCR (images / PDF scannés) est fait
   côté navigateur — voir le front. Ici on renvoie { scanned:true } quand il n'y
   a pas de couche texte, pour que le client déclenche l'OCR. */
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

    if (IMAGE_EXT.includes(ext)) {
      // Les images sont OCRisées côté navigateur.
      return NextResponse.json({ filename, text: '', scanned: true });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    let text = '';
    if (ext === 'pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buf });
      text = ((await parser.getText()).text || '').trim();
      await parser.destroy();
      if (text.length < 20) {
        // PDF sans couche texte -> à OCRiser côté navigateur.
        return NextResponse.json({ filename, text: '', scanned: true });
      }
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth');
      text = ((await mammoth.extractRawText({ buffer: buf })).value || '').trim();
    } else {
      text = buf.toString('utf8').trim();
    }

    if (!text) return NextResponse.json({ error: 'Aucun texte extrait (document vide).' }, { status: 422 });
    return NextResponse.json({ filename, text });
  } catch (e) {
    return NextResponse.json({ error: `Extraction impossible : ${e.message}` }, { status: 500 });
  }
}
