import { NextResponse } from 'next/server';
import { classifyDocument } from '@/lib/classify';
import { createOne } from '@/lib/collections';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { filename, text } = await req.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Texte du document manquant' }, { status: 400 });
    }
    const result = await classifyDocument({ filename, text });
    const doc = await createOne('documents', {
      filename: filename || 'Document',
      indicator: result.indicatorId,
      confidence: result.confidence,
      justification: result.justification,
      status: 'proposé',
    });
    return NextResponse.json({ result, doc });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
