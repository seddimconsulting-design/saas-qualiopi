import PDFDocument from 'pdfkit';

/* On n'incruste que du JPEG (opaque, fiable pour pdfkit) : une image corrompue
   ou en PNG à canal alpha peut bloquer la finalisation du PDF. */
function parseJpeg(dataUrl) {
  const m = /^data:image\/jpe?g;base64,(.+)$/i.exec(dataUrl || '');
  if (!m) return null;
  try { return Buffer.from(m[1], 'base64'); } catch { return null; }
}

function frDateTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return dt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* Génère la feuille d'émargement signée (PDF).
   trainees = [{ first, last, sigs: { [slotKey]: { signature, signed_at } } }] */
export function renderEmargementPdf({ of, session, slots, trainees }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 40, right = 555, bottom = 800;
    const nameX = left, sigX = 250, timeX = 460;
    const nameW = sigX - nameX - 8, sigW = timeX - sigX - 8, timeW = right - timeX;

    // ── En-tête organisme ──
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1F2A44').text(of.name || '', left, 44);
    doc.font('Helvetica').fontSize(8.5).fillColor('#777777');
    const meta = [of.nda ? `Déclaration d'activité n° ${of.nda}` : '', of.address, [of.email, of.phone].filter(Boolean).join(' · ')].filter(Boolean);
    meta.forEach((m) => doc.text(m, left));

    doc.moveTo(left, 96).lineTo(right, 96).strokeColor('#E2E8F0').stroke();

    // ── Titre + infos session ──
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#0F172A').text('Feuille d’émargement', left, 108);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#059669').text(session.title || '', left, 132);
    doc.font('Helvetica').fontSize(9).fillColor('#475569');
    const info = [
      session.trainer ? `Formateur : ${session.trainer}` : '',
      session.duration ? `Durée : ${session.duration}` : '',
      session.modality ? `Modalité : ${session.modality}` : '',
    ].filter(Boolean).join('     ');
    if (info) doc.text(info, left, 148);

    let y = 172;

    const ensure = (h) => { if (y + h > bottom) { doc.addPage(); y = 50; } };

    const rowHeight = 46;
    for (const slot of slots) {
      // Titre de la demi-journée
      ensure(28 + rowHeight);
      doc.rect(left, y, right - left, 20).fill('#F1F5F9');
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0F172A').text(`Émargement — ${slot.label}`, left + 6, y + 5);
      y += 24;

      // En-têtes de colonnes
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#94A3B8');
      doc.text('STAGIAIRE', nameX, y, { width: nameW });
      doc.text('SIGNATURE', sigX, y, { width: sigW });
      doc.text('SIGNÉ LE', timeX, y, { width: timeW });
      y += 14;

      const rows = [...trainees, { first: 'Formateur', last: session.trainer || '', isTrainer: true }];
      for (const t of rows) {
        ensure(rowHeight);
        const sig = t.isTrainer ? null : (t.sigs && t.sigs[slot.key]);
        doc.font('Helvetica').fontSize(9.5).fillColor('#1F2937')
          .text(`${t.first || ''} ${t.last || ''}`.trim(), nameX, y + 14, { width: nameW });

        const jpg = sig && sig.signature ? parseJpeg(sig.signature) : null;
        if (jpg) {
          try { doc.image(jpg, sigX, y + 4, { fit: [sigW, rowHeight - 12] }); } catch { /* ignore */ }
          doc.font('Helvetica').fontSize(8).fillColor('#64748B').text(frDateTime(sig.signed_at), timeX, y + 16, { width: timeW });
        } else if (sig) {
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#059669').text('Signé', sigX, y + 16, { width: sigW });
          doc.font('Helvetica').fontSize(8).fillColor('#64748B').text(frDateTime(sig.signed_at), timeX, y + 16, { width: timeW });
        } else if (t.isTrainer) {
          doc.font('Helvetica-Oblique').fontSize(8).fillColor('#CBD5E1').text('(signature manuscrite)', sigX, y + 16, { width: sigW });
        } else {
          doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#CBD5E1').text('Non signé', sigX, y + 16, { width: sigW });
        }
        doc.moveTo(left, y + rowHeight).lineTo(right, y + rowHeight).strokeColor('#EEF2F6').stroke();
        y += rowHeight;
      }
      y += 10;
    }

    if (trainees.length === 0) {
      doc.font('Helvetica').fontSize(9).fillColor('#94A3B8').text('Aucun stagiaire inscrit à cette session.', left, y);
    }

    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#94A3B8')
      .text('Émargement signé électroniquement via l’espace stagiaire (signature horodatée et tracée).', left, Math.min(y + 8, bottom + 10), { width: right - left });

    doc.end();
  });
}
