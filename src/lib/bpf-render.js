import PDFDocument from 'pdfkit';

const eur = (n) => `${Number(n || 0).toLocaleString('fr-FR')} €`;

/* Récapitulatif BPF prêt à reporter dans le Cerfa n° 10443. */
export function renderBpfPdf({ of, bpf }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 44 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 44, right = 551;
    let y = 46;

    doc.font('Helvetica-Bold').fontSize(13).fillColor('#1F2A44').text(of.name || '', left, y);
    doc.font('Helvetica').fontSize(8.5).fillColor('#777777');
    [of.nda ? `Déclaration d'activité n° ${of.nda}` : '', of.address, [of.email, of.phone].filter(Boolean).join(' · ')]
      .filter(Boolean).forEach(t => doc.text(t, left));
    y = doc.y + 10;
    doc.moveTo(left, y).lineTo(right, y).strokeColor('#E2E8F0').stroke();

    doc.font('Helvetica-Bold').fontSize(16).fillColor('#0F172A').text('Bilan Pédagogique et Financier', left, y + 12);
    doc.font('Helvetica').fontSize(10).fillColor('#059669').text(`Année civile ${bpf.year}`, left, doc.y + 2);
    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#94A3B8')
      .text('Récapitulatif préparatoire au Cerfa n° 10443 — à reporter sur « Mon Activité Formation » (dépôt avant le 31 mai).', left, doc.y + 4, { width: right - left });

    const section = (titre) => {
      y = doc.y + 14;
      doc.rect(left, y, right - left, 18).fill('#F1F5F9');
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0F172A').text(titre, left + 6, y + 5);
      doc.y = y + 24;
    };
    const ligne = (label, valeur) => {
      const yy = doc.y;
      doc.font('Helvetica').fontSize(9.5).fillColor('#334155').text(label, left + 4, yy, { width: 330 });
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0F172A').text(String(valeur), left + 340, yy, { width: right - left - 344, align: 'right' });
      doc.y = yy + 15;
    };

    section('Cadre C — Bilan pédagogique');
    ligne('Nombre d’actions de formation réalisées', bpf.sessions);
    ligne('Nombre total de stagiaires', bpf.stagiaires);
    ligne('Nombre total d’heures-stagiaires', bpf.heuresStagiaires.toLocaleString('fr-FR'));
    ligne('Durée moyenne par stagiaire', `${bpf.heuresMoyennes} h`);

    section('Cadre B — Bilan financier (produits)');
    ligne('Produits des actions de formation', eur(bpf.produits));
    const origines = Object.entries(bpf.parOrigine || {});
    if (origines.length) {
      origines.forEach(([k, v]) => ligne(`  · ${k}`, eur(v)));
    } else {
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#94A3B8')
        .text('Répartition par origine des fonds indisponible : renseignez les devis acceptés et le type de vos clients.', left + 4, doc.y, { width: right - left - 8 });
      doc.y += 14;
    }

    section('Cadre F — Personnes dispensant les formations');
    ligne('Nombre d’intervenants mobilisés', bpf.formateurs.length);
    if (bpf.formateurs.length) {
      doc.font('Helvetica').fontSize(8.5).fillColor('#64748B')
        .text(bpf.formateurs.join(' · '), left + 4, doc.y, { width: right - left - 8 });
      doc.y += 14;
    }

    section(`Détail des actions ${bpf.year}`);
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#94A3B8');
    doc.text('ACTION', left + 4, doc.y, { width: 250, continued: false });
    const yh = doc.y - 10;
    doc.text('FIN', left + 258, yh); doc.text('H', left + 320, yh);
    doc.text('STAG.', left + 350, yh); doc.text('H-STAG.', left + 395, yh); doc.text('PRODUIT', left + 455, yh, { width: 90, align: 'right' });
    doc.y = yh + 12;

    for (const d of bpf.detail) {
      if (doc.y > 760) { doc.addPage(); doc.y = 50; }
      const yy = doc.y;
      doc.font('Helvetica').fontSize(8.5).fillColor('#1F2937').text(d.title || '', left + 4, yy, { width: 250 });
      const y2 = Math.max(doc.y, yy);
      doc.fontSize(8.5).fillColor('#475569');
      doc.text(d.end || '', left + 258, yy, { width: 58 });
      doc.text(String(d.heures), left + 320, yy, { width: 26 });
      doc.text(String(d.stagiaires), left + 350, yy, { width: 40 });
      doc.text(String(d.heuresStagiaires), left + 395, yy, { width: 55 });
      doc.text(eur(d.produit), left + 455, yy, { width: 90, align: 'right' });
      doc.y = y2 + 4;
      doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor('#EEF2F6').stroke();
      doc.y += 4;
    }

    doc.moveDown(1);
    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#94A3B8')
      .text('Document généré par Certivia à partir de vos données. Vérifiez les montants avec votre comptabilité avant dépôt : le BPF engage votre organisme.', left, doc.y, { width: right - left });

    doc.end();
  });
}
