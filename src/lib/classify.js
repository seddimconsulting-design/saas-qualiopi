import Anthropic from '@anthropic-ai/sdk';
import { INDICATEURS_CATALOG, catalogForPrompt, attenduOf } from './indicators-catalog';

/*
 * Moteur de classification de preuves.
 * - Si ANTHROPIC_API_KEY est défini : classification par Claude (chemin IA).
 * - Sinon : repli déterministe par mots-clés (fonctionne hors-ligne / démo).
 */

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

const SCHEMA = {
  type: 'object',
  properties: {
    indicatorId: { type: 'integer' },
    confidence: { type: 'number' },
    justification: { type: 'string' },
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'integer' }, confidence: { type: 'number' } },
        required: ['id', 'confidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['indicatorId', 'confidence', 'justification', 'candidates'],
  additionalProperties: false,
};

/* Normalise (minuscules + suppression des accents) pour un matching robuste. */
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* Repli déterministe : score par occurrences de mots-clés. */
function heuristicClassify(text) {
  const hay = norm(text);
  const scored = INDICATEURS_CATALOG.map(ind => {
    const hits = ind.kw.filter(k => hay.includes(norm(k))).length;
    return { id: ind.id, hits };
  }).filter(s => s.hits > 0).sort((a, b) => b.hits - a.hits);

  if (scored.length === 0) {
    return { indicatorId: null, confidence: 0, justification: "Aucun indicateur détecté automatiquement (mode hors-ligne). Classez manuellement.", candidates: [], engine: 'heuristique' };
  }
  const top = scored[0];
  return {
    indicatorId: top.id,
    confidence: Math.min(1, 0.4 + top.hits * 0.2),
    justification: `Classé par mots-clés (mode hors-ligne, sans clé API) : ${top.hits} correspondance(s).`,
    candidates: scored.slice(0, 3).map(s => ({ id: s.id, confidence: Math.min(1, 0.4 + s.hits * 0.2) })),
    engine: 'heuristique',
  };
}

/* Classification IA via l'API Claude (sorties structurées). */
async function aiClassify({ filename, text }) {
  const client = new Anthropic();
  const system = [
    "Tu es un expert Qualiopi. On te fournit un document produit par un organisme de formation.",
    "Détermine à quel indicateur du Référentiel National Qualité (RNQ v9) ce document sert de PREUVE,",
    "en te fondant sur l'attendu officiel de chaque indicateur ci-dessous :",
    catalogForPrompt(),
    "Choisis l'indicateur dont l'attendu correspond le mieux au document. En cas de doute, propose plusieurs candidats.",
    "Réponds uniquement via le schéma JSON : indicatorId (le meilleur, entier 1-32, ou null si aucun ne correspond),",
    "confidence (0 à 1), justification (1 phrase en français citant l'attendu concerné),",
    "candidates (jusqu'à 3 indicateurs plausibles avec leur confidence).",
  ].join('\n');

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{
      role: 'user',
      content: `Nom du fichier : ${filename || '(sans nom)'}\n\nContenu :\n${(text || '').slice(0, 12000)}`,
    }],
  });
  const block = resp.content.find(b => b.type === 'text');
  const parsed = JSON.parse(block.text);
  return { ...parsed, engine: 'ia' };
}

export async function classifyDocument({ filename, text }) {
  let result;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      result = await aiClassify({ filename, text });
    } catch (e) {
      // En cas d'échec API, on retombe sur l'heuristique (jamais bloquant).
      const h = heuristicClassify(text);
      result = { ...h, justification: `${h.justification} (repli après erreur IA : ${e.message})` };
    }
  } else {
    result = heuristicClassify(text);
  }
  // Rattache l'attendu Qualiopi de l'indicateur retenu (grounding visible côté UI).
  return { ...result, attendu: attenduOf(result.indicatorId) };
}
