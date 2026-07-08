import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';
import PDFDocument from 'pdfkit';

/* Parse un logo dataURL base64 (png/jpg) -> { buffer, type }. */
function parseLogo(dataUrl) {
  const m = /^data:image\/(png|jpe?g);base64,(.+)$/i.exec(dataUrl || '');
  if (!m) return null;
  return { buffer: Buffer.from(m[2], 'base64'), type: m[1].toLowerCase().startsWith('jp') ? 'jpg' : 'png' };
}

/* Remplace les jetons {{token}} par les données réelles (ou une ligne à compléter). */
const applyCtx = (text, ctx) =>
  (text || '').replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = ctx[k];
    return v !== undefined && v !== null && v !== '' ? String(v) : '……………';
  });

/* Génère le fichier Word (.docx) d'un modèle. */
export async function renderDocx(t, of, ctx = {}) {
  const children = [];
  const logo = parseLogo(of.logo);
  if (logo) {
    try {
      children.push(new Paragraph({ children: [new ImageRun({ type: logo.type, data: logo.buffer, transformation: { width: 130, height: 46 } })] }));
    } catch { /* logo illisible : on ignore */ }
  }
  children.push(new Paragraph({ children: [new TextRun({ text: of.name, bold: true, size: 26 })] }));
  const meta = [`Déclaration d'activité n° ${of.nda}`, of.address, [of.email, of.phone].filter(Boolean).join(' · ')].filter(Boolean);
  meta.forEach((m, i) => children.push(new Paragraph({ spacing: { after: i === meta.length - 1 ? 200 : 0 }, children: [new TextRun({ text: m, size: 18, color: '777777' })] })));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t.title)] }));
  if (t.intro) children.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun(applyCtx(t.intro, ctx))] }));
  for (const s of t.sections) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(s.h)] }));
    for (const line of applyCtx(s.body, ctx).split('\n')) {
      children.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun(line)] }));
    }
  }
  if (t.signature) {
    children.push(new Paragraph({ spacing: { before: 240 }, children: [new TextRun('Fait à ……………………, le ……/……/………')] }));
    children.push(new Paragraph({ spacing: { before: 160 }, children: [new TextRun("Signature de l'organisme                              Signature du client")] }));
  }
  children.push(new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: 'Modèle conforme Qualiopi — à personnaliser selon votre activité.', italics: true, size: 16, color: '999999' })] }));

  const doc = new Document({ styles: { default: { document: { run: { font: 'Arial', size: 22 } } } }, sections: [{ children }] });
  return Packer.toBuffer(doc);
}

/* Génère le fichier PDF d'un modèle. */
export function renderPdf(t, of, ctx = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const logo = parseLogo(of.logo);
    if (logo) {
      try { doc.image(logo.buffer, { fit: [130, 46] }); doc.moveDown(0.4); } catch { /* logo illisible */ }
    }
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1F2A44').text(of.name);
    doc.font('Helvetica').fontSize(9).fillColor('#777777');
    doc.text(`Déclaration d'activité n° ${of.nda}`);
    if (of.address) doc.text(of.address);
    const contact = [of.email, of.phone].filter(Boolean).join(' · ');
    if (contact) doc.text(contact);
    doc.moveDown(1).fillColor('#000000');
    doc.font('Helvetica-Bold').fontSize(17).text(t.title);
    doc.moveDown(0.6);
    if (t.intro) { doc.font('Helvetica').fontSize(10).text(applyCtx(t.intro, ctx), { align: 'justify' }); doc.moveDown(0.6); }
    for (const s of t.sections) {
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#2E5AAC').text(s.h);
      doc.font('Helvetica').fontSize(10).fillColor('#000000').text(applyCtx(s.body, ctx), { align: 'left' });
      doc.moveDown(0.6);
    }
    if (t.signature) {
      doc.moveDown(1).font('Helvetica').fontSize(10);
      doc.text('Fait à ……………………, le ……/……/………');
      doc.moveDown(1.5);
      doc.text("Signature de l'organisme                              Signature du client");
    }
    doc.moveDown(1.5).font('Helvetica-Oblique').fontSize(8).fillColor('#999999')
      .text('Modèle conforme Qualiopi — à personnaliser selon votre activité.');
    doc.end();
  });
}
