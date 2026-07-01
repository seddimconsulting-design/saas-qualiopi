import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/* Extrait le texte d'un fichier uploadé (PDF, DOCX, TXT/MD/CSV). */
export async function POST(req) {
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
    if (ext === 'pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buf });
      const res = await parser.getText();
      text = res.text;
      await parser.destroy();
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth');
      text = (await mammoth.extractRawText({ buffer: buf })).value;
    } else {
      text = buf.toString('utf8');
    }

    text = (text || '').trim();
    if (!text) {
      return NextResponse.json({ error: 'Impossible d\'extraire du texte (document vide ou scanné sans OCR).' }, { status: 422 });
    }
    return NextResponse.json({ filename, text });
  } catch (e) {
    return NextResponse.json({ error: `Extraction impossible : ${e.message}` }, { status: 500 });
  }
}
