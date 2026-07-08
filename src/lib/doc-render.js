import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import PDFDocument from 'pdfkit';

/* Remplace les jetons {{token}} par les données réelles (ou une ligne à compléter). */
const applyCtx = (text, ctx) =>
  (text || '').replace(/\{\{(\w+)\}\}/g, (_, k) => {
    const v = ctx[k];
    return v !== undefined && v !== null && v !== '' ? String(v) : '……………';
  });

/* Génère le fichier Word (.docx) d'un modèle. */
export async function renderDocx(t, of, ctx = {}) {
  const children = [
    new Paragraph({ children: [new TextRun({ text: of.name, bold: true, size: 26 })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Déclaration d'activité n° ${of.nda}`, size: 18, color: '777777' })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t.title)] }),
  ];
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

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1F2A44').text(of.name);
    doc.font('Helvetica').fontSize(9).fillColor('#777777').text(`Déclaration d'activité n° ${of.nda}`);
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
