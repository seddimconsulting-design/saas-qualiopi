'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap, LayoutDashboard, Users, Rss, MessageSquareWarning,
  CheckSquare, Plus, FileText, Trash2, AlertTriangle, CheckCircle2,
  Save, ChevronRight, TrendingUp, BarChart3, Euro, Calendar,
  Clock, Star, Building2, CreditCard, ClipboardList, Bell,
  BookOpen, Shield, Award, X, Filter, Search, Download,
  ArrowUpRight, ArrowDownRight, Minus, Upload, LogOut, Settings
} from 'lucide-react';
import { TEMPLATES } from '@/lib/doc-templates';

const IMG_EXT = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tif', 'tiff'];

/* OCR côté navigateur (tesseract.js en français). */
async function ocrImageClient(fileOrCanvas) {
  const Tesseract = (await import('tesseract.js')).default;
  const { data } = await Tesseract.recognize(fileOrCanvas, 'fra');
  return (data.text || '').trim();
}

/* OCR d'un PDF scanné : rasterisation via pdf.js puis OCR (max 5 pages). */
async function ocrPdfClient(file) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const n = Math.min(pdf.numPages, 5);
  let text = '';
  for (let i = 1; i <= n; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    text += (await ocrImageClient(canvas)) + '\n';
  }
  return text.trim();
}

/* ─── helpers ─── */
const cls = (...args) => args.filter(Boolean).join(' ');
const STATUS_BADGE = {
  'Projet':   'bg-amber-50 text-amber-700 border-amber-200',
  'Actif':    'bg-blue-50 text-blue-700 border-blue-200',
  'Terminé':  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Annulé':   'bg-red-50 text-red-700 border-red-200',
};
const REC_STATUS = {
  'En cours': 'bg-red-50 text-red-700 border-red-200',
  'Résolue':  'bg-emerald-50 text-emerald-700 border-emerald-200',
};
const PAC_STATUS = {
  'En cours':   'bg-blue-50 text-blue-700 border-blue-200',
  'Terminé':    'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En attente': 'bg-slate-100 text-slate-600 border-slate-200',
};
const DOC_LABELS = {
  convention:  '1. Convention / Contrat',
  positioning: '2. Positionnement amont (Ind. 8)',
  attendance:  '3. Émargement d\'assiduité',
  certificate: '4. Certificat de réalisation',
};
// Modèle à générer pour chaque document de conformité d'une session.
const SESSION_DOC_TPL = {
  convention:  'convention',
  positioning: 'positionnement',
  attendance:  'emargement',
  certificate: 'attestation-fin',
};
// Documents générables au niveau d'un stagiaire (pré-remplis avec son nom).
const TRAINEE_DOCS = [
  { id: 'positionnement',  label: 'Fiche de positionnement' },
  { id: 'fiche-suivi',     label: 'Fiche de suivi individualisé' },
  { id: 'attestation-fin', label: 'Certificat de réalisation' },
];

/* ─── KPI card ─── */
function KpiCard({ label, value, sub, icon: Icon, color = 'emerald', trend }) {
  const colors = {
    emerald:'bg-emerald-50 text-emerald-600',
    amber:  'bg-amber-50 text-amber-600',
    red:    'bg-red-50 text-red-600',
    blue:   'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={cls('w-8 h-8 rounded-lg flex items-center justify-center', colors[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={cls('flex items-center gap-1 text-xs font-semibold', trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-slate-400')}>
          {trend > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : trend < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          {Math.abs(trend)}% vs mois dernier
        </div>
      )}
    </div>
  );
}

/* ─── Indicator badge 32 indicateurs ─── */
const INDICATEURS = [
  { id: 1, crit: 1, label: "Info publics sur objectifs & résultats", ok: true },
  { id: 2, crit: 1, label: "Identification des prérequis & profils", ok: true },
  { id: 3, crit: 1, label: "Délais et modalités d'accès", ok: true },
  { id: 4, crit: 1, label: "Accessibilité handicap", ok: false },
  { id: 5, crit: 2, label: "Contenu et objectifs pédagogiques", ok: true },
  { id: 6, crit: 2, label: "Adaptation des modalités pédagogiques", ok: true },
  { id: 7, crit: 2, label: "Adéquation ressources humaines", ok: true },
  { id: 8, crit: 2, label: "Positionnement à l'entrée", ok: false },
  { id: 9, crit: 2, label: "Évaluation des acquis en cours", ok: true },
  { id: 10, crit: 2, label: "Évaluation des acquis en fin", ok: true },
  { id: 11, crit: 2, label: "Accompagnement des apprenants", ok: true },
  { id: 12, crit: 2, label: "Suivi des apprentissages foad/distanciel", ok: false },
  { id: 13, crit: 3, label: "Recueil de la satisfaction à chaud", ok: false },
  { id: 14, crit: 3, label: "Recueil de la satisfaction à froid", ok: false },
  { id: 15, crit: 3, label: "Exploitation des résultats satisfaction", ok: false },
  { id: 16, crit: 3, label: "Indicateurs de résultats communiqués", ok: true },
  { id: 17, crit: 4, label: "Coordination des acteurs internes/externes", ok: true },
  { id: 18, crit: 4, label: "Qualification des formateurs", ok: true },
  { id: 19, crit: 4, label: "Maintien et développement compétences formateurs", ok: false },
  { id: 20, crit: 4, label: "Moyens techniques et pédagogiques adaptés", ok: true },
  { id: 21, crit: 4, label: "Locaux accessibles et adaptés", ok: true },
  { id: 22, crit: 4, label: "Gestion des sous-traitants", ok: false },
  { id: 23, crit: 5, label: "Veilles réglementaires et sectorielles", ok: true },
  { id: 24, crit: 5, label: "Mise en œuvre et traçabilité des veilles", ok: false },
  { id: 25, crit: 6, label: "Traçabilité des actions de formation", ok: true },
  { id: 26, crit: 6, label: "Communication avec financeurs/prescripteurs", ok: true },
  { id: 27, crit: 6, label: "Recueil besoins prescripteurs/financeurs", ok: false },
  { id: 28, crit: 6, label: "Mise en relation prescripteurs/apprenants", ok: false },
  { id: 29, crit: 7, label: "Mesure de la satisfaction parties prenantes", ok: true },
  { id: 30, crit: 7, label: "Traitement des réclamations", ok: false },
  { id: 31, crit: 7, label: "Gestion des non-conformités", ok: true },
  { id: 32, crit: 7, label: "Amélioration continue", ok: false },
];
const CRITERES_LABELS = {
  1: "Information du public",
  2: "Conception pédagogique",
  3: "Satisfaction & résultats",
  4: "Ressources & moyens",
  5: "Veille & amélioration",
  6: "Traçabilité & relations",
  7: "Processus qualité",
};

/* ─── statuts & moteur de preuve ─── */
const IND_STATUS = {
  conforme: { label: 'Conforme', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  partiel:  { label: 'Partiel',  badge: 'bg-amber-50 text-amber-700 border-amber-100',       dot: 'bg-amber-400' },
  manquant: { label: 'Manquant', badge: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-400' },
};
const STATUS_WEIGHT = { conforme: 1, partiel: 0.5, manquant: 0 };
const IND_TAB = { 4:'sessions',8:'sessions',9:'sessions',10:'sessions',13:'satisfaction',14:'satisfaction',15:'satisfaction',16:'indicateurs',18:'sessions',23:'veilles',24:'veilles',25:'sessions',29:'satisfaction',30:'reclamations',31:'pac',32:'pac' };

const mk = (status, evidence = [], gaps = []) => ({ status, evidence, gaps });

/* Règles déterministes : chaque indicateur dérive son statut des données réelles. */
function buildIndicators(d, manual = {}) {
  const { sessions, trainees, veilles, reclamations, pac } = d;
  const n = sessions.length;
  const tN = trainees.length;
  const rate = (a, b) => (b === 0 ? 0 : a / b);
  const tri = (r, ev, gap) => (r >= 1 ? mk('conforme', ev) : r > 0 ? mk('partiel', ev, [gap]) : mk('manquant', [], [gap]));

  const withPos = sessions.filter(s => s.docs?.positioning).length;
  const withCert = sessions.filter(s => s.docs?.certificate).length;
  const withTrainer = sessions.filter(s => s.trainer).length;
  const totalDocs = sessions.reduce((a, s) => a + (s.docs ? Object.values(s.docs).filter(Boolean).length : 0), 0);
  const maxDocs = n * 4;
  const hot = trainees.filter(t => t.satHot).length;
  const cold = trainees.filter(t => t.satCold).length;
  const sHandi = sessions.filter(s => s.handicap);
  const handiNoNote = sHandi.filter(s => !s.handicapNote);
  const openRec = reclamations.filter(r => r.status !== 'Résolue');
  const pacDone = pac.filter(p => p.status === 'Terminé');

  const RULES = {
    4: () => (sHandi.length === 0
        ? mk('partiel', [], ['Désigner un référent handicap et formaliser la procédure'])
        : handiNoNote.length > 0
          ? mk('partiel', [`${sHandi.length - handiNoNote.length}/${sHandi.length} session(s) handicap documentée(s)`], [`${handiNoNote.length} session(s) handicap sans note d'aménagement`])
          : mk('conforme', [`Aménagements documentés (${sHandi.length} session(s))`])),
    8: () => tri(rate(withPos, n), [`${withPos}/${n} sessions avec positionnement amont`], 'Ajouter le test de positionnement aux sessions manquantes'),
    9: () => tri(rate(totalDocs, maxDocs), [`Traçabilité des acquis : ${totalDocs}/${maxDocs} documents`], 'Compléter les évaluations et émargements'),
    10: () => tri(rate(withCert, n), [`${withCert}/${n} sessions avec certificat de réalisation`], 'Émettre les certificats de réalisation manquants'),
    13: () => tri(rate(hot, tN), [`${hot}/${tN} évaluations à chaud recueillies`], 'Collecter la satisfaction à chaud manquante'),
    14: () => tri(rate(cold, tN), [`${cold}/${tN} évaluations à froid recueillies`], 'Lancer les enquêtes à froid (J+90)'),
    15: () => (pac.length > 0
        ? mk('conforme', ["Résultats exploités via le plan d'amélioration"])
        : mk('partiel', [], ["Analyser les évaluations dans le plan d'amélioration"])),
    16: () => (withCert > 0
        ? mk('conforme', ['Taux de réussite calculables et publiables'])
        : mk('partiel', [], ["Aucun résultat à communiquer pour l'instant"])),
    18: () => tri(rate(withTrainer, n), [`${withTrainer}/${n} sessions avec formateur assigné`], 'Assigner et documenter un formateur qualifié'),
    23: () => (veilles.length > 0
        ? mk('conforme', [`${veilles.length} veille(s) enregistrée(s)`])
        : mk('manquant', [], ['Enregistrer au moins une veille réglementaire'])),
    24: () => (veilles.some(v => v.exploit)
        ? mk('conforme', ['Veilles exploitées et tracées'])
        : veilles.length > 0 ? mk('partiel', [], ["Documenter l'exploitation des veilles"]) : mk('manquant', [], ['Aucune veille exploitée'])),
    25: () => tri(rate(totalDocs, maxDocs), [`Dossiers de session : ${totalDocs}/${maxDocs} documents`], 'Compléter les documents de traçabilité'),
    29: () => (hot > 0 || cold > 0
        ? mk('conforme', [`Satisfaction mesurée (${hot + cold} retours)`])
        : mk('manquant', [], ['Mesurer la satisfaction des parties prenantes'])),
    30: () => (reclamations.length === 0
        ? mk('partiel', [], ['Mettre en place le registre des réclamations'])
        : openRec.length > 0
          ? mk('partiel', [`${reclamations.length - openRec.length} réclamation(s) traitée(s)`], [`${openRec.length} réclamation(s) ouverte(s) à traiter`])
          : mk('conforme', [`${reclamations.length} réclamation(s) traitée(s)`])),
    31: () => (pac.length > 0
        ? mk('conforme', [`${pac.length} action(s) de non-conformité suivie(s)`])
        : mk('manquant', [], ['Ouvrir le registre des non-conformités'])),
    32: () => (pacDone.length > 0
        ? mk('conforme', [`${pacDone.length} action(s) d'amélioration finalisée(s)`])
        : pac.length > 0 ? mk('partiel', [], ["Finaliser les actions du plan d'amélioration"]) : mk('manquant', [], ['Initier le plan d\'amélioration continue'])),
  };

  return INDICATEURS.map(meta => {
    const r = RULES[meta.id];
    if (r) return { ...meta, ...r(), auto: true };
    const status = manual[meta.id] || (meta.ok ? 'conforme' : 'manquant');
    return { ...meta, status, evidence: [], gaps: status === 'conforme' ? [] : ['À documenter manuellement'], auto: false };
  });
}

/* ──────────── APP ──────────── */
export default function AppClient() {
  const [tab, setTab] = useState('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [search, setSearch] = useState('');

  /* modals */
  const [modal, setModal] = useState(null); // 'session'|'trainee'|'veille'|'rec'|'pac'|'client'|'devis'|'satisfaction'

  /* data — chargée depuis PostgreSQL via /api/bootstrap */
  const [sessions, setSessions] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [veilles, setVeilles] = useState([]);
  const [reclamations, setReclamations] = useState([]);
  const [pac, setPac] = useState([]);
  const [clients, setClients] = useState([]);
  const [devis, setDevis] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [manualStatus, setManualStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [me, setMe] = useState(null);
  const [verifState, setVerifState] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [onbHidden, setOnbHidden] = useState(false);
  const [feedback, setFeedback] = useState(null); // null (fermé) | { msg, state }
  const [docMenu, setDocMenu] = useState(null); // id du stagiaire dont le menu Documents est ouvert
  const [roster, setRoster] = useState({ enrolled: [], all: [], total: 0 });
  const [addTraineeId, setAddTraineeId] = useState('');
  const [inviteMsg, setInviteMsg] = useState(null); // { traineeId, link, email, emailed } | null
  const [satResponses, setSatResponses] = useState([]);
  const [positionings, setPositionings] = useState([]);
  const [quizDraft, setQuizDraft] = useState(null); // null = pas en édition ; sinon tableau de questions
  const [profile, setProfile] = useState({ name: '', nda: '', address: '', email: '', phone: '', logo: '' });
  const [team, setTeam] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [myUserId, setMyUserId] = useState(null);
  const [teamForm, setTeamForm] = useState({ email: '', password: '', name: '' });
  const [orgMsg, setOrgMsg] = useState('');
  const [aiForm, setAiForm] = useState({ filename: '', text: '' });
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [docSession, setDocSession] = useState('');
  const [docTrainee, setDocTrainee] = useState('');

  useEffect(() => {
    fetch('/api/bootstrap')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setDbError(d.error); return; }
        setSessions(d.sessions || []);
        setTrainees(d.trainees || []);
        setVeilles(d.veilles || []);
        setReclamations(d.reclamations || []);
        setPac(d.pac || []);
        setClients(d.clients || []);
        setDevis(d.devis || []);
        setDocuments(d.documents || []);
        setManualStatus(d.manualStatus || {});
      })
      .catch(e => setDbError(e.message))
      .finally(() => setLoading(false));
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(setMe).catch(() => {});
    fetch('/api/profile').then(r => r.ok ? r.json() : null).then(p => {
      if (p) setProfile({ name: p.name || '', nda: p.nda || '', address: p.address || '', email: p.email || '', phone: p.phone || '', logo: p.logo || '' });
    }).catch(() => {});
    fetch('/api/team').then(r => r.ok ? r.json() : null).then(d => {
      if (d) { setTeam(d.users || []); setMyRole(d.myRole); setMyUserId(d.me); }
    }).catch(() => {});
    fetch('/api/satisfaction').then(r => r.ok ? r.json() : null).then(d => { if (d) setSatResponses(d.responses || []); }).catch(() => {});
    try { if (localStorage.getItem('certivia_onboarding_hidden') === '1') setOnbHidden(true); } catch {}
  }, []);

  const hideOnboarding = () => {
    setOnbHidden(true);
    try { localStorage.setItem('certivia_onboarding_hidden', '1'); } catch {}
  };
  const sendFeedback = async () => {
    setFeedback(f => ({ ...f, state: 'sending' }));
    try {
      const r = await fetch('/api/feedback', { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ message: feedback.msg }) });
      setFeedback(f => ({ ...f, state: r.ok ? 'sent' : 'error' }));
    } catch { setFeedback(f => ({ ...f, state: 'error' })); }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };
  const resendVerification = async () => {
    setVerifState('sending');
    try {
      const r = await fetch('/api/auth/resend-verification', { method: 'POST' });
      setVerifState(r.ok ? 'sent' : 'error');
    } catch { setVerifState('error'); }
  };
  const saveProfile = async () => {
    setOrgMsg('');
    const r = await fetch('/api/profile', { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(profile) }).then(x => x.json());
    if (r.error) { setOrgMsg(r.error); return; }
    setProfile({ name: r.name || '', nda: r.nda || '', address: r.address || '', email: r.email || '', phone: r.phone || '', logo: r.logo || '' });
    setMe(m => (m ? { ...m, ofName: r.name } : m));
    setOrgMsg('Profil enregistré.');
  };
  const onLogo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(png|jpe?g)/.test(f.type)) { setOrgMsg('Logo : PNG ou JPG uniquement.'); return; }
    if (f.size > 500 * 1024) { setOrgMsg('Logo trop volumineux (max 500 Ko).'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfile(p => ({ ...p, logo: reader.result }));
    reader.readAsDataURL(f);
    e.target.value = '';
  };
  const addTeamUser = async () => {
    setOrgMsg('');
    if (!teamForm.email.trim() || !teamForm.password) return;
    const r = await fetch('/api/team', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(teamForm) }).then(x => x.json());
    if (r.error) { setOrgMsg(r.error); return; }
    setTeam(p => [...p, r.user]);
    setTeamForm({ email: '', password: '', name: '' });
  };
  const removeTeamUser = async (id) => {
    const r = await fetch(`/api/team/${id}`, { method: 'DELETE' }).then(x => x.json());
    if (r.error) { setOrgMsg(r.error); return; }
    setTeam(p => p.filter(u => u.id !== id));
  };

  /* helpers API */
  const jsonHeaders = { 'Content-Type': 'application/json' };
  const api = {
    create: (c, body) => fetch(`/api/${c}`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(body) }).then(r => r.json()),
    remove: (c, id) => fetch(`/api/${c}/${id}`, { method: 'DELETE' }),
    patch: (c, id, body) => fetch(`/api/${c}/${id}`, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(body) }),
    setInd: (id, status) => fetch('/api/indicator-status', { method: 'PUT', headers: jsonHeaders, body: JSON.stringify({ id, status }) }),
  };
  const delItem = (c, id, setter) => { setter(p => p.filter(x => x.id !== id)); api.remove(c, id); };

  /* form state */
  const emptySession = { title: '', trainer: '', start: '', end: '', duration: '', status: 'Projet', trainees: 0, handicap: false, handicapNote: '', price: 0, modality: 'Présentiel' };
  const emptyTrainee = { first: '', last: '', email: '', phone: '', disability: '', score: 'Non fait' };
  const emptyVeille  = { type: '', source: '', summary: '', exploit: '', date: new Date().toISOString().slice(0, 10) };
  const emptyRec     = { issuer: '', role: '', desc: '', status: 'En cours', reply: '', date: new Date().toISOString().slice(0, 10) };
  const emptyPac     = { action: '', indicator: '', trigger: '', owner: '', deadline: '', status: 'En cours' };
  const emptyClient  = { name: '', type: 'Financeur', contact: '', email: '', phone: '', ca: 0 };
  const emptyDevis   = { client: '', session: '', amount: 0, status: 'En attente', date: new Date().toISOString().slice(0, 10) };

  const [form, setForm] = useState({});
  const openModal = (m, defaults = {}) => { setModal(m); setForm(defaults); };
  const closeModal = () => setModal(null);
  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  /* computed */
  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const totalDocs = sessions.reduce((a, s) => a + Object.values(s.docs).filter(Boolean).length, 0);
  const maxDocs   = sessions.length * 4;
  const conformRate = maxDocs > 0 ? Math.round((totalDocs / maxDocs) * 100) : 0;
  const activeSess  = sessions.filter(s => s.status === 'Actif').length;
  const openRec     = reclamations.filter(r => r.status !== 'Résolue').length;
  const totalCA     = sessions.filter(s => s.status !== 'Annulé').reduce((a, s) => a + (s.price || 0), 0);
  const liveInd     = useMemo(() => buildIndicators({ sessions, trainees, veilles, reclamations, pac }, manualStatus), [sessions, trainees, veilles, reclamations, pac, manualStatus]);
  const indOk       = liveInd.filter(i => i.status === 'conforme').length;
  const readiness   = Math.round(liveInd.reduce((a, i) => a + STATUS_WEIGHT[i.status], 0) / INDICATEURS.length * 100);
  const satScores   = trainees.filter(t => t.satHot).map(t => t.satHot);
  const avgSat      = satScores.length ? (satScores.reduce((a,b) => a+b, 0) / satScores.length).toFixed(1) : '–';

  const filteredSessions = useMemo(() =>
    sessions.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.trainer.toLowerCase().includes(search.toLowerCase())),
    [sessions, search]
  );

  /* actions */
  const toggleDoc = (docKey) => {
    if (!selectedSessionId) return;
    setSessions(p => p.map(s => {
      if (s.id !== selectedSessionId) return s;
      const docs = { ...s.docs, [docKey]: !s.docs[docKey] };
      api.patch('sessions', s.id, { docs });
      return { ...s, docs };
    }));
  };

  const saveSession = async () => {
    if (!form.title?.trim()) return;
    const saved = await api.create('sessions', { ...emptySession, ...form, docs: { convention: false, positioning: false, attendance: false, certificate: false } });
    if (saved && !saved.error) setSessions(p => [...p, saved]);
    closeModal();
  };
  const saveTrainee = async () => {
    if (!form.first?.trim()) return;
    const saved = await api.create('trainees', { ...emptyTrainee, ...form });
    if (saved && !saved.error) setTrainees(p => [...p, saved]);
    closeModal();
  };
  const saveVeille = async () => {
    if (!form.type?.trim()) return;
    const saved = await api.create('veilles', { ...emptyVeille, ...form });
    if (saved && !saved.error) setVeilles(p => [...p, saved]);
    closeModal();
  };
  const saveRec = async () => {
    if (!form.issuer?.trim()) return;
    const saved = await api.create('reclamations', { ...emptyRec, ...form });
    if (saved && !saved.error) setReclamations(p => [...p, saved]);
    closeModal();
  };
  const savePac = async () => {
    if (!form.action?.trim()) return;
    const saved = await api.create('pac', { ...emptyPac, ...form });
    if (saved && !saved.error) setPac(p => [...p, saved]);
    closeModal();
  };
  const saveClient = async () => {
    if (!form.name?.trim()) return;
    const saved = await api.create('clients', { ...emptyClient, ...form });
    if (saved && !saved.error) setClients(p => [...p, saved]);
    closeModal();
  };
  const saveDevis = async () => {
    if (!form.client?.trim()) return;
    const saved = await api.create('devis', { ...emptyDevis, ...form });
    if (saved && !saved.error) setDevis(p => [...p, saved]);
    closeModal();
  };

  /* moteur de preuve : écarts + export dossier d'audit */
  const gaps = liveInd.filter(i => i.status !== 'conforme');
  const cycleStatus = (id) => {
    const order = ['manquant', 'partiel', 'conforme'];
    setManualStatus(p => {
      const cur = p[id] || (INDICATEURS.find(i => i.id === id)?.ok ? 'conforme' : 'manquant');
      const next = order[(order.indexOf(cur) + 1) % order.length];
      api.setInd(id, next);
      return { ...p, [id]: next };
    });
  };
  const exportDossier = () => {
    const L = [];
    L.push("DOSSIER D'AUDIT QUALIOPI — Sokai Formation");
    L.push(`Audit-readiness : ${readiness}%  (${indOk}/32 indicateurs conformes)`);
    L.push('Généré le ' + new Date().toLocaleDateString('fr-FR'));
    L.push('');
    Object.entries(CRITERES_LABELS).forEach(([k, l]) => {
      L.push(`== Critère ${k} — ${l} ==`);
      liveInd.filter(i => i.crit === +k).forEach(i => {
        L.push(`  [${IND_STATUS[i.status].label}] Ind. ${i.id} — ${i.label}`);
        i.evidence.forEach(e => L.push('     Preuve : ' + e));
        i.gaps.forEach(g => L.push('     Écart : ' + g));
      });
      L.push('');
    });
    const blob = new Blob([L.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'dossier-audit-qualiopi.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  /* moteur de preuve IA : analyse d'un document -> indicateur */
  const indLabel = (id) => INDICATEURS.find(i => i.id === id)?.label || '';
  const docUrl = (id, fmt) => {
    const qs = [docSession && `sessionId=${docSession}`, docTrainee && `traineeId=${docTrainee}`].filter(Boolean).join('&');
    return `/api/document/${id}?format=${fmt}${qs ? '&' + qs : ''}`;
  };
  /* Lien de génération d'un document pré-rempli pour un contexte précis. */
  const docUrlFor = (id, fmt, { sessionId, traineeId } = {}) => {
    const qs = [sessionId && `sessionId=${sessionId}`, traineeId && `traineeId=${traineeId}`].filter(Boolean).join('&');
    return `/api/document/${id}?format=${fmt}${qs ? '&' + qs : ''}`;
  };

  /* Émargement / espace stagiaire (côté organisme) */
  const loadRoster = async (sid) => {
    if (!sid) { setRoster({ enrolled: [], all: [] }); return; }
    const d = await fetch(`/api/roster?sessionId=${sid}`).then(r => r.ok ? r.json() : null).catch(() => null);
    if (d) setRoster(d);
  };
  const enrollTrainee = async (tid) => {
    if (!tid) return;
    await fetch('/api/roster', { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ sessionId: selectedSessionId, traineeId: tid }) });
    setAddTraineeId(''); loadRoster(selectedSessionId);
  };
  const unenrollTrainee = async (tid) => {
    await fetch(`/api/roster?sessionId=${selectedSessionId}&traineeId=${tid}`, { method: 'DELETE' });
    loadRoster(selectedSessionId);
  };
  const inviteTrainee = async (tid) => {
    setInviteMsg({ traineeId: tid, loading: true });
    try {
      const r = await fetch('/api/roster/invite', { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ traineeId: tid }) }).then(x => x.json());
      setInviteMsg({ traineeId: tid, link: r.link, email: r.email, emailed: r.emailed });
      loadRoster(selectedSessionId);
    } catch (e) { setInviteMsg({ traineeId: tid, error: e.message }); }
  };
  const loadPositionings = async (sid) => {
    if (!sid) { setPositionings([]); return; }
    const d = await fetch(`/api/positioning?sessionId=${sid}`).then(r => r.ok ? r.json() : null).catch(() => null);
    if (d) setPositionings(d.positionings || []);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setInviteMsg(null); setQuizDraft(null); loadRoster(selectedSessionId); loadPositionings(selectedSessionId); }, [selectedSessionId]);

  /* Éditeur de QCM de positionnement */
  const startQuizEdit = () => setQuizDraft((selectedSession?.quiz || []).map(x => ({ q: x.q || '', options: [...(x.options || ['', ''])], correct: x.correct ?? 0 })));
  const addQuestion = () => setQuizDraft(d => [...d, { q: '', options: ['', ''], correct: 0 }]);
  const removeQuestion = (i) => setQuizDraft(d => d.filter((_, j) => j !== i));
  const setQ = (i, patch) => setQuizDraft(d => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setOpt = (i, j, val) => setQuizDraft(d => d.map((x, k) => (k === i ? { ...x, options: x.options.map((o, m) => (m === j ? val : o)) } : x)));
  const addOpt = (i) => setQuizDraft(d => d.map((x, j) => (j === i ? { ...x, options: [...x.options, ''] } : x)));
  const removeOpt = (i, j) => setQuizDraft(d => d.map((x, k) => (k === i ? { ...x, options: x.options.filter((_, m) => m !== j), correct: x.correct >= j && x.correct > 0 ? x.correct - 1 : x.correct } : x)));
  const saveQuiz = async () => {
    const clean = quizDraft
      .map(x => ({ q: (x.q || '').trim(), options: x.options.map(o => (o || '').trim()).filter(Boolean), correct: Number(x.correct) || 0 }))
      .filter(x => x.q && x.options.length >= 2)
      .map(x => ({ ...x, correct: Math.min(x.correct, x.options.length - 1) }));
    await api.patch('sessions', selectedSessionId, { quiz: clean });
    setSessions(ss => ss.map(s => (s.id === selectedSessionId ? { ...s, quiz: clean } : s)));
    setQuizDraft(null);
  };
  const analyzeDoc = async () => {
    if (!aiForm.text.trim()) return;
    setAiLoading(true); setAiResult(null);
    try {
      const r = await fetch('/api/classify', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(aiForm) }).then(x => x.json());
      if (r.error) setAiResult({ error: r.error });
      else { setAiResult(r.result); setDocuments(p => [...p, r.doc]); }
    } catch (e) { setAiResult({ error: e.message }); }
    setAiLoading(false);
  };
  const validateDoc = (doc, indicatorId) => {
    if (indicatorId) {
      api.setInd(indicatorId, 'conforme');
      setManualStatus(p => ({ ...p, [indicatorId]: 'conforme' }));
    }
    api.patch('documents', doc.id, { status: 'validé' });
    setDocuments(p => p.map(x => x.id === doc.id ? { ...x, status: 'validé' } : x));
  };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true); setAiResult(null);
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    try {
      if (IMG_EXT.includes(ext)) {
        // Image : OCR directement dans le navigateur
        const text = await ocrImageClient(file);
        setAiForm({ filename: file.name, text });
      } else {
        const fd = new FormData();
        fd.append('file', file);
        const r = await fetch('/api/extract', { method: 'POST', body: fd }).then(x => x.json());
        if (r.error) setAiResult({ error: r.error });
        else if (r.scanned) {
          // PDF scanné : OCR dans le navigateur (rasterisation pdf.js)
          const text = await ocrPdfClient(file);
          setAiForm({ filename: file.name, text });
        } else {
          setAiForm({ filename: r.filename, text: r.text });
        }
      }
    } catch (err) { setAiResult({ error: `OCR / extraction : ${err.message}` }); }
    setExtracting(false);
    e.target.value = '';
  };

  /* ── nav ── */
  const navItems = [
    { key: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { key: 'sessions',     icon: Calendar,        label: 'Sessions' },
    { key: 'trainees',     icon: Users,           label: 'Stagiaires' },
    { key: 'satisfaction', icon: Star,            label: 'Satisfaction' },
    { key: 'veilles',      icon: Rss,             label: 'Veilles' },
    { key: 'reclamations', icon: MessageSquareWarning, label: 'Réclamations', badge: openRec },
    { key: 'pac',          icon: CheckSquare,     label: 'Plan qualité' },
    { key: 'indicateurs',  icon: Shield,          label: '32 Indicateurs' },
    { key: 'copilote',     icon: ClipboardList,   label: 'Copilote IA', badge: gaps.length },
    { key: 'preuves',      icon: Award,           label: 'Preuves IA' },
    { key: 'documents',    icon: FileText,        label: 'Documents types' },
    { key: 'crm',          icon: Building2,       label: 'CRM' },
    { key: 'facturation',  icon: Euro,            label: 'Devis & Facturation' },
    { key: 'organisme',    icon: Settings,        label: 'Mon organisme' },
  ];

  /* ── shared styles ── */
  const inp = "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-slate-800 placeholder-slate-300";
  const lbl = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";
  const btn = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition";

  /* ── Modal wrapper ── */
  const Modal = ({ title, onSave, children }) => (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
          <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        <div className="flex gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onSave} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}><Save className="w-3.5 h-3.5" /> Enregistrer</button>
          <button onClick={closeModal} className={cls(btn, 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>Annuler</button>
        </div>
      </div>
    </div>
  );

  const Row2 = ({ children }) => <div className="grid grid-cols-2 gap-3">{children}</div>;
  const Field = ({ label: l, full, children }) => (
    <div className={full ? 'col-span-2' : ''}><label className={lbl}>{l}</label>{children}</div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">Certivia</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Qualiopi</p>
            </div>
          </div>

          {/* Conformité pill */}
          <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-500">Audit-readiness</span>
              <span className="text-xs font-black text-emerald-600">{readiness}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className={cls('h-1.5 rounded-full transition-all duration-500', readiness >= 90 ? 'bg-emerald-500' : readiness >= 70 ? 'bg-emerald-500' : 'bg-amber-400')} style={{ width: `${readiness}%` }} />
            </div>
          </div>

          {/* Nav */}
          <nav className="p-2 space-y-0.5 mt-1">
            {navItems.map(({ key, icon: Icon, label, badge }) => (
              <button key={key} onClick={() => setTab(key)}
                className={cls('w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition',
                  tab === key ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge > 0 && <span className="w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{badge}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-800 truncate">{me?.ofName || '—'}</p>
          <p className="text-[10px] text-slate-400 truncate">{me?.email || ''}</p>
          <button onClick={logout} className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition">
            <LogOut className="w-3 h-3" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">{navItems.find(n => n.key === tab)?.label}</h2>
            <p className="text-[11px] text-slate-400">{me?.ofName || '…'} · 32 indicateurs Qualiopi</p>
          </div>
          <div className="flex items-center gap-2">
            {openRec > 0 && (
              <button onClick={() => setTab('reclamations')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-bold animate-pulse">
                <Bell className="w-3 h-3" /> {openRec} réclamation{openRec > 1 ? 's' : ''} ouverte{openRec > 1 ? 's' : ''}
              </button>
            )}
            <button onClick={exportDossier}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold hover:bg-emerald-700 transition">
              <Download className="w-3 h-3" /> Dossier d&apos;audit
            </button>
            <div className={cls('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border',
              readiness >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : readiness >= 70 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-200')}>
              <span className={cls('w-2 h-2 rounded-full', readiness >= 90 ? 'bg-emerald-500 animate-pulse' : readiness >= 70 ? 'bg-amber-500' : 'bg-red-500')} />
              {readiness}% audit-ready
            </div>
          </div>
        </header>

        {me && me.emailVerified === false && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-amber-800">
            {verifState === 'sent' ? (
              <span className="font-bold">E-mail de confirmation renvoyé — vérifiez votre boîte ({me.email}) et vos spams.</span>
            ) : (
              <>
                <span>Confirmez votre adresse e-mail (<span className="font-bold">{me.email}</span>) pour sécuriser votre compte.</span>
                <button onClick={resendVerification} disabled={verifState === 'sending'}
                  className="font-bold underline hover:text-amber-900 disabled:opacity-50">
                  {verifState === 'sending' ? 'Envoi…' : verifState === 'error' ? 'Réessayer' : 'Renvoyer l’e-mail'}
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {dbError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
              Base de données non connectée ({dbError}). Lancez PostgreSQL (docker compose up -d) puis rechargez la page.
            </div>
          )}
          {loading && !dbError && (
            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">Chargement des données…</div>
          )}

          {/* ══════════════ DASHBOARD ══════════════ */}
          {tab === 'dashboard' && (
            <>
              {/* Onboarding — se coche selon les données réelles, disparaît une fois complet */}
              {(() => {
                const steps = [
                  { done: me?.emailVerified !== false, label: 'Confirmer votre adresse e-mail', action: me?.emailVerified === false ? resendVerification : null, cta: 'Renvoyer' },
                  { done: !!(profile.name && profile.address), label: 'Compléter le profil de votre organisme (NDA, adresse, logo)', action: () => setTab('organisme'), cta: 'Compléter' },
                  { done: sessions.length > 0, label: 'Créer votre première session de formation', action: () => setTab('sessions'), cta: 'Créer' },
                  { done: trainees.length > 0, label: 'Ajouter votre premier stagiaire', action: () => setTab('trainees'), cta: 'Ajouter' },
                ];
                const doneCount = steps.filter(s => s.done).length;
                if (onbHidden || doneCount === steps.length) return null;
                return (
                  <div className="bg-white rounded-2xl border border-emerald-200 p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-black text-slate-900">Bienvenue sur Certivia 👋</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Quelques étapes pour démarrer votre pilotage Qualiopi — {doneCount}/{steps.length} faites.</p>
                      </div>
                      <button onClick={hideOnboarding} className="text-slate-300 hover:text-slate-500 p-1" title="Masquer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
                    </div>
                    <div className="space-y-1.5">
                      {steps.map((s, k) => (
                        <div key={k} className="flex items-center gap-3 py-1.5">
                          <CheckCircle2 className={cls('w-4 h-4 shrink-0', s.done ? 'text-emerald-500' : 'text-slate-200')} />
                          <span className={cls('flex-1 text-xs', s.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium')}>{s.label}</span>
                          {!s.done && s.action && (
                            <button onClick={s.action} className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700">
                              {s.cta} <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard label="Audit-readiness" value={`${readiness}%`} icon={Shield} color="emerald" sub={`${indOk}/32 indicateurs`} trend={5} />
                <KpiCard label="Sessions actives" value={activeSess} icon={Calendar} color="blue" sub={`${sessions.length} au total`} />
                <KpiCard label="Stagiaires" value={trainees.length} icon={Users} color="violet" sub="inscrits" trend={12} />
                <KpiCard label="Satisfaction" value={`${avgSat}/5`} icon={Star} color="amber" sub="éval. à chaud moy." />
                <KpiCard label="Réclamations" value={openRec} icon={MessageSquareWarning} color={openRec > 0 ? 'red' : 'emerald'} sub="ouvertes" />
                <KpiCard label="CA prévisionnel" value={`${(totalCA/1000).toFixed(1)}k€`} icon={Euro} color="emerald" sub="sessions en cours" trend={8} />
              </div>

              {/* Grille principale */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Sessions récentes */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-extrabold text-slate-900">Sessions récentes</p>
                    <button onClick={() => setTab('sessions')} className="text-[10px] text-emerald-600 font-bold hover:underline">Tout voir →</button>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {sessions.slice(0, 4).map(s => {
                      const done = Object.values(s.docs).filter(Boolean).length;
                      return (
                        <div key={s.id} className="px-6 py-3.5 flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">{s.title}</p>
                            <p className="text-[10px] text-slate-400">{s.trainer} · {s.start}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex gap-0.5">
                              {Object.values(s.docs).map((v, i) => (
                                <div key={i} className={cls('w-2 h-2 rounded-full', v ? 'bg-emerald-400' : 'bg-slate-200')} />
                              ))}
                            </div>
                            <span className={cls('px-2 py-0.5 rounded-full text-[9px] font-bold border', STATUS_BADGE[s.status])}>{s.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Radar indicateurs */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-xs font-extrabold text-slate-900 mb-4">Critères Qualiopi</p>
                  <div className="space-y-2.5">
                    {Object.entries(CRITERES_LABELS).map(([k, label]) => {
                      const inds = liveInd.filter(i => i.crit === +k);
                      const okCount = inds.filter(i => i.status === 'conforme').length;
                      const pct = Math.round((inds.reduce((a, i) => a + STATUS_WEIGHT[i.status], 0) / inds.length) * 100);
                      return (
                        <div key={k}>
                          <div className="flex justify-between mb-1">
                            <p className="text-[10px] font-semibold text-slate-600 truncate max-w-[160px]">C{k} · {label}</p>
                            <p className="text-[10px] font-bold text-slate-500">{okCount}/{inds.length}</p>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className={cls('h-1.5 rounded-full', pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-emerald-500' : 'bg-amber-400')}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Satisfaction & BPF */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-xs font-extrabold text-slate-900 mb-4">Satisfaction par stagiaire</p>
                  <div className="space-y-2.5">
                    {trainees.map(t => (
                      <div key={t.id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700 shrink-0">{t.first[0]}{t.last[0]}</div>
                        <p className="text-xs font-semibold text-slate-700 flex-1">{t.first} {t.last}</p>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} className={cls('w-3 h-3', (t.satHot||0) >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')} />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 w-8 text-right">{t.satHot ? `${t.satHot}/5` : '–'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-xs font-extrabold text-slate-900 mb-4">Bilan Pédagogique & Financier (BPF)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: "Sessions réalisées", v: sessions.filter(s => s.status === 'Terminé').length },
                      { l: "Stagiaires formés", v: trainees.length },
                      { l: "Heures de formation", v: sessions.reduce((a, s) => a + parseInt(s.duration), 0) + 'h' },
                      { l: "CA total", v: `${(totalCA/1000).toFixed(1)}k€` },
                      { l: "Taux satisfaction moyen", v: `${avgSat}/5` },
                      { l: "Indicateurs conformes", v: `${indOk}/32` },
                    ].map(({ l, v }) => (
                      <div key={l} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-semibold">{l}</p>
                        <p className="text-lg font-black text-slate-900 mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ══════════════ SESSIONS ══════════════ */}
          {tab === 'sessions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input className="flex-1 text-xs bg-transparent outline-none placeholder-slate-400" placeholder="Rechercher une session…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <button onClick={() => openModal('session', emptySession)} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                    <Plus className="w-3.5 h-3.5" /> Nouvelle
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {filteredSessions.map(s => {
                    const done = Object.values(s.docs).filter(Boolean).length;
                    return (
                      <div key={s.id} onClick={() => setSelectedSessionId(s.id === selectedSessionId ? null : s.id)}
                        className={cls('px-6 py-4 flex items-center gap-4 cursor-pointer transition group',
                          selectedSessionId === s.id ? 'bg-emerald-50 border-l-4 border-l-emerald-600' : 'border-l-4 border-l-transparent hover:bg-slate-50')}>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-xs text-slate-900 truncate">{s.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{s.trainer} · {s.start} → {s.end} · <span className="font-semibold">{s.duration}</span></p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{s.modality} · {s.trainees} stagiaires · {s.price ? s.price.toLocaleString('fr-FR') + ' €' : '–'}</p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <span className={cls('px-2 py-0.5 rounded-full text-[9px] font-bold border', STATUS_BADGE[s.status])}>{s.status}</span>
                          <div className="flex gap-0.5">
                            {Object.values(s.docs).map((v, i) => (
                              <div key={i} className={cls('w-2.5 h-2.5 rounded-full border', v ? 'bg-emerald-400 border-emerald-300' : 'bg-slate-200 border-slate-200')} />
                            ))}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); delItem('sessions', s.id, setSessions); if (selectedSessionId === s.id) setSelectedSessionId(null); }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {filteredSessions.length === 0 && <p className="text-xs text-center text-slate-400 py-10">Aucune session trouvée.</p>}
                </div>
              </div>

              {/* Panneau docs */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                {!selectedSession ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                    <FileText className="w-10 h-10 mb-3" />
                    <p className="text-xs text-center text-slate-400 font-semibold">Sélectionnez une session<br />pour gérer les documents</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <span className={cls('text-[9px] font-black uppercase px-2 py-0.5 rounded border', STATUS_BADGE[selectedSession.status])}>{selectedSession.status}</span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-2 leading-tight">{selectedSession.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{selectedSession.trainer} · {selectedSession.duration} · {selectedSession.modality}</p>
                      <p className="text-[11px] font-bold text-emerald-600 mt-0.5">{selectedSession.price?.toLocaleString('fr-FR')} €</p>
                    </div>
                    {selectedSession.handicap && (
                      <div className="flex gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700">{selectedSession.handicapNote}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documents de conformité</p>
                      {Object.entries(selectedSession.docs).map(([k, v]) => (
                        <div key={k}
                          className={cls('flex items-center gap-2 p-2.5 rounded-xl border',
                            v ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100')}>
                          <button onClick={() => toggleDoc(k)} title={v ? 'Fait — cliquer pour annuler' : 'Marquer comme fait'} className="shrink-0">
                            {v ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                               : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                          </button>
                          <span className={cls('text-[11px] font-semibold flex-1 min-w-0', v ? 'text-emerald-700' : 'text-slate-600')}>{DOC_LABELS[k]}</span>
                          <a href={docUrlFor(SESSION_DOC_TPL[k], 'pdf', { sessionId: selectedSession.id })} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700">PDF</a>
                          <a href={docUrlFor(SESSION_DOC_TPL[k], 'docx', { sessionId: selectedSession.id })} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Word</a>
                        </div>
                      ))}
                      <p className="text-[10px] text-slate-400 pt-1 leading-snug">Pastille = marquer comme fait. PDF / Word = générer le document pré-rempli avec les infos de la session (le Word est modifiable).</p>
                    </div>

                    {/* Émargement / espace stagiaire */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Émargement des stagiaires</p>
                      <div className="flex gap-2">
                        <select value={addTraineeId} onChange={e => setAddTraineeId(e.target.value)}
                          className="flex-1 min-w-0 px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700">
                          <option value="">+ Inscrire un stagiaire…</option>
                          {roster.all.filter(a => !roster.enrolled.some(en => en.id === a.id)).map(a => (
                            <option key={a.id} value={a.id}>{a.first} {a.last}</option>
                          ))}
                        </select>
                        <button onClick={() => enrollTrainee(addTraineeId)} disabled={!addTraineeId}
                          className={cls(btn, 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50')}>Ajouter</button>
                      </div>
                      {roster.enrolled.length === 0 && <p className="text-[10px] text-slate-400">Aucun stagiaire inscrit à cette session.</p>}
                      {roster.enrolled.map(en => {
                        const complete = roster.total > 0 && en.signed_count >= roster.total;
                        return (
                        <div key={en.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate">{en.first} {en.last}</p>
                            <p className={cls('text-[10px] font-semibold', complete ? 'text-emerald-600' : en.signed_count > 0 ? 'text-amber-600' : 'text-slate-400')}>
                              {en.signed_count}/{roster.total} demi-journée{roster.total > 1 ? 's' : ''} signée{en.signed_count > 1 ? 's' : ''}
                              {!complete && en.has_access ? ' · lien envoyé' : ''}
                            </p>
                          </div>
                          {complete
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            : <button onClick={() => inviteTrainee(en.id)} className="text-[10px] font-bold text-emerald-600 hover:underline shrink-0">
                                {en.has_access ? 'Renvoyer' : 'Envoyer'} le lien
                              </button>}
                          <button onClick={() => unenrollTrainee(en.id)} className="p-1 text-red-300 hover:text-red-500 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        );
                      })}
                      {inviteMsg && inviteMsg.link && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 break-all">
                          {inviteMsg.emailed ? `Lien envoyé par e-mail à ${inviteMsg.email}. ` : 'Aucun e-mail pour ce stagiaire — copiez le lien : '}
                          <span className="font-mono text-emerald-800">{inviteMsg.link}</span>
                        </div>
                      )}
                      <a href={`/api/emargement/${selectedSession.id}`} target="_blank" rel="noopener noreferrer"
                        className={cls(btn, 'w-full justify-center bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700')}>
                        <Download className="w-3.5 h-3.5" /> Feuille d&apos;émargement signée (PDF)
                      </a>
                    </div>

                    {/* Positionnement : QCM + résultats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Positionnement (test de niveau)</p>
                        {quizDraft === null && (
                          <button onClick={startQuizEdit} className="text-[10px] font-bold text-emerald-600 hover:underline">
                            {(selectedSession.quiz || []).length ? 'Modifier le QCM' : 'Créer un QCM'}
                          </button>
                        )}
                      </div>
                      {quizDraft === null ? (
                        <>
                          <p className="text-[10px] text-slate-400">
                            {(selectedSession.quiz || []).length
                              ? `${selectedSession.quiz.length} question(s). Les stagiaires remplissent leur positionnement dans leur espace.`
                              : 'Aucun QCM. Les stagiaires renseignent leurs besoins ; ajoutez un QCM pour un test noté.'}
                          </p>
                          {positionings.map((p, i) => (
                            <div key={i} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] font-bold text-slate-800 truncate">{p.first} {p.last}</p>
                                {p.score != null && <span className="text-[10px] font-bold text-emerald-700 shrink-0">{Math.round(p.score)}%</span>}
                              </div>
                              <p className="text-[10px] text-slate-500">Niveau déclaré : {(p.answers && p.answers.level) || '—'}</p>
                              {p.answers && p.answers.objectives && <p className="text-[10px] text-slate-500 mt-0.5 italic">« {p.answers.objectives} »</p>}
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="space-y-3">
                          {quizDraft.map((item, i) => (
                            <div key={i} className="p-2.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                              <div className="flex gap-1.5">
                                <input value={item.q} onChange={e => setQ(i, { q: e.target.value })} placeholder={`Question ${i + 1}`}
                                  className="flex-1 px-2 py-1.5 text-[11px] rounded border border-slate-200" />
                                <button onClick={() => removeQuestion(i)} className="p-1 text-red-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                              {item.options.map((opt, j) => (
                                <div key={j} className="flex items-center gap-1.5 pl-2">
                                  <input type="radio" checked={item.correct === j} onChange={() => setQ(i, { correct: j })} title="Bonne réponse" className="accent-emerald-600" />
                                  <input value={opt} onChange={e => setOpt(i, j, e.target.value)} placeholder={`Réponse ${j + 1}`}
                                    className="flex-1 px-2 py-1 text-[11px] rounded border border-slate-200" />
                                  {item.options.length > 2 && <button onClick={() => removeOpt(i, j)} className="text-red-300 hover:text-red-500 text-sm leading-none">×</button>}
                                </div>
                              ))}
                              <button onClick={() => addOpt(i)} className="text-[10px] text-emerald-600 font-bold pl-2">+ réponse</button>
                            </div>
                          ))}
                          <button onClick={addQuestion} className={cls(btn, 'w-full justify-center bg-slate-100 text-slate-600 hover:bg-slate-200')}><Plus className="w-3.5 h-3.5" /> Ajouter une question</button>
                          <div className="flex gap-2">
                            <button onClick={() => setQuizDraft(null)} className={cls(btn, 'flex-1 justify-center bg-white border border-slate-200 text-slate-600')}>Annuler</button>
                            <button onClick={saveQuiz} className={cls(btn, 'flex-[2] justify-center bg-emerald-600 text-white hover:bg-emerald-700')}><Save className="w-3.5 h-3.5" /> Enregistrer le QCM</button>
                          </div>
                          <p className="text-[10px] text-slate-400">Cochez le rond de la bonne réponse pour chaque question.</p>
                        </div>
                      )}
                    </div>

                    <button onClick={exportDossier} className={cls(btn, 'w-full justify-center bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                      <Download className="w-3.5 h-3.5" /> Exporter le dossier
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════ STAGIAIRES ══════════════ */}
          {tab === 'trainees' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900">Registre des stagiaires</h3>
                <button onClick={() => openModal('trainee', emptyTrainee)} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {trainees.map(t => (
                  <div key={t.id}>
                    <div className="px-6 py-4 flex items-center gap-4 group">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-700 shrink-0">{t.first[0]}{t.last[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-900">{t.first} {t.last}</p>
                        <p className="text-[10px] text-slate-400">{t.email} · {t.phone}</p>
                        {t.disability && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> {t.disability}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={cls('text-[10px] font-bold px-2.5 py-1 rounded-xl border', t.score !== 'Non fait' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-100')}>
                          Positionnement : {t.score}
                        </span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n => <Star key={n} className={cls('w-3 h-3', (t.satHot||0) >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')} />)}
                        </div>
                        <button onClick={() => setDocMenu(docMenu === t.id ? null : t.id)}
                          className={cls('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition', docMenu === t.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                          <FileText className="w-3.5 h-3.5" /> Documents
                        </button>
                        <button onClick={() => delItem('trainees', t.id, setTrainees)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {docMenu === t.id && (
                      <div className="px-6 pb-4 -mt-1 flex flex-wrap gap-2">
                        {TRAINEE_DOCS.map(d => (
                          <div key={d.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                            <span className="text-[11px] font-semibold text-slate-600">{d.label}</span>
                            <a href={docUrlFor(d.id, 'pdf', { traineeId: t.id })} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700">PDF</a>
                            <a href={docUrlFor(d.id, 'docx', { traineeId: t.id })} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Word</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ SATISFACTION ══════════════ */}
          {tab === 'satisfaction' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="Satisfaction à chaud" value={`${avgSat}/5`} icon={Star} color="amber" />
                <KpiCard label="Taux de réponse" value={`${Math.round((trainees.filter(t => t.satHot).length / trainees.length) * 100)}%`} icon={BarChart3} color="emerald" />
                <KpiCard label="Recommandation" value="92%" icon={TrendingUp} color="emerald" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-xs font-extrabold text-slate-900">Évaluations individuelles (à chaud & à froid)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Indicateurs 13 & 14 Qualiopi</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {trainees.map(t => (
                    <div key={t.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700 shrink-0">{t.first[0]}{t.last[0]}</div>
                      <p className="text-xs font-semibold text-slate-800 flex-1">{t.first} {t.last}</p>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 font-semibold mb-1">À CHAUD</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => <Star key={n} className={cls('w-3.5 h-3.5', (t.satHot||0) >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')} />)}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 font-semibold mb-1">À FROID (J+90)</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => t.satCold
                              ? <Star key={n} className={cls('w-3.5 h-3.5', t.satCold >= n ? 'text-emerald-400 fill-emerald-400' : 'text-slate-200 fill-slate-200')} />
                              : <div key={n} className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-dashed border-slate-200" />
                            )}
                          </div>
                        </div>
                        {!t.satCold && <span className="text-[9px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-dashed border-slate-200">En attente</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {satResponses.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-xs font-extrabold text-slate-900">Commentaires des stagiaires</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Verbatims déposés via l&apos;espace stagiaire</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {satResponses.map((r, i) => (
                      <div key={i} className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{r.first} {r.last}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-500 border-slate-200">{r.kind === 'froid' ? 'À froid' : 'À chaud'}</span>
                          <span className="text-[10px] text-slate-400 truncate">{r.session_title}</span>
                          <div className="flex gap-0.5 ml-auto shrink-0">
                            {[1,2,3,4,5].map(n => <Star key={n} className={cls('w-3 h-3', Math.round(r.overall) >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')} />)}
                          </div>
                        </div>
                        {r.comment && <p className="text-xs text-slate-600 mt-1.5 italic">« {r.comment} »</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════ VEILLES ══════════════ */}
          {tab === 'veilles' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Veilles réglementaires & sectorielles</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Indicateurs 23 & 24 — Traçabilité et exploitation</p>
                </div>
                <button onClick={() => openModal('veille', emptyVeille)} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                  <Plus className="w-3.5 h-3.5" /> Nouvelle veille
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {veilles.map(v => (
                  <div key={v.id} className="px-6 py-5 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{v.type}</span>
                          <span className="text-[10px] text-slate-400">Source : {v.source}</span>
                          <span className="text-[10px] text-slate-400">· {v.date}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mb-2">{v.summary}</p>
                        <div className="flex items-start gap-1.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <ChevronRight className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-emerald-700 font-semibold">{v.exploit}</p>
                        </div>
                      </div>
                      <button onClick={() => delItem('veilles', v.id, setVeilles)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 ml-4 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {veilles.length === 0 && <p className="text-xs text-center text-slate-400 py-12">Aucune veille enregistrée.</p>}
              </div>
            </div>
          )}

          {/* ══════════════ RÉCLAMATIONS ══════════════ */}
          {tab === 'reclamations' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Registre des réclamations</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Indicateurs 30 & 31 — Traitement et suivi</p>
                </div>
                <button onClick={() => openModal('rec', emptyRec)} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                  <Plus className="w-3.5 h-3.5" /> Enregistrer
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {reclamations.map(r => (
                  <div key={r.id} className="px-6 py-5 group">
                    <div className="flex items-start gap-4 justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="text-xs font-extrabold text-slate-900">{r.issuer}</p>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{r.role}</span>
                          <span className={cls('text-[10px] font-bold px-2 py-0.5 rounded border', REC_STATUS[r.status])}>{r.status}</span>
                          <span className="text-[10px] text-slate-400">{r.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{r.desc}</p>
                        {r.reply && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-blue-700">{r.reply}</p>
                          </div>
                        )}
                      </div>
                      <button onClick={() => delItem('reclamations', r.id, setReclamations)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {reclamations.length === 0 && <p className="text-xs text-center text-slate-400 py-12">Aucune réclamation enregistrée.</p>}
              </div>
            </div>
          )}

          {/* ══════════════ PAC ══════════════ */}
          {tab === 'pac' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Plan d'Amélioration Continue (PAC)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Indicateur 32 — Actions correctives et préventives</p>
                </div>
                <button onClick={() => openModal('pac', emptyPac)} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                  <Plus className="w-3.5 h-3.5" /> Nouvelle action
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {pac.map(p => (
                  <div key={p.id} className="px-6 py-4 flex items-start gap-4 group">
                    <div className={cls('w-2 h-2 rounded-full mt-1.5 shrink-0', p.status === 'Terminé' ? 'bg-emerald-500' : p.status === 'En cours' ? 'bg-blue-500' : 'bg-slate-300')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">{p.action}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {p.indicator && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{p.indicator}</span>}
                        <span className={cls('text-[10px] font-bold px-2 py-0.5 rounded border', PAC_STATUS[p.status])}>{p.status}</span>
                        {p.deadline && <span className="text-[10px] text-slate-400">Échéance : {p.deadline}</span>}
                        {p.owner && <span className="text-[10px] text-slate-400">· {p.owner}</span>}
                      </div>
                      {p.trigger && <p className="text-[10px] text-slate-400 mt-1">Déclenché par : {p.trigger}</p>}
                    </div>
                    <button onClick={() => delItem('pac', p.id, setPac)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {pac.length === 0 && <p className="text-xs text-center text-slate-400 py-12">Aucune action enregistrée.</p>}
              </div>
            </div>
          )}

          {/* ══════════════ 32 INDICATEURS ══════════════ */}
          {tab === 'indicateurs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="Conformes" value={indOk} icon={CheckCircle2} color="emerald" sub={`sur 32 indicateurs`} />
                <KpiCard label="À corriger" value={32 - indOk} icon={AlertTriangle} color="amber" />
                <KpiCard label="Taux global" value={`${Math.round(indOk / 32 * 100)}%`} icon={Shield} color="emerald" />
              </div>
              {Object.entries(CRITERES_LABELS).map(([k, clabel]) => {
                const inds = liveInd.filter(i => i.crit === +k);
                const okc = inds.filter(i => i.status === 'conforme').length;
                return (
                  <div key={k} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-extrabold text-slate-900">Critère {k} — {clabel}</p>
                      <span className="text-[10px] font-bold text-slate-500">{okc}/{inds.length} conformes</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {inds.map(ind => (
                        <div key={ind.id} className="px-6 py-3 flex items-start gap-3">
                          <span className={cls('w-2.5 h-2.5 rounded-full mt-1 shrink-0', IND_STATUS[ind.status].dot)} />
                          <span className="text-[10px] font-bold text-slate-500 w-10 shrink-0">Ind. {ind.id}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-700">{ind.label}</p>
                            {ind.evidence.map((e, idx) => <p key={idx} className="text-[10px] text-emerald-600 mt-0.5">✓ {e}</p>)}
                            {ind.gaps.map((g, idx) => <p key={idx} className="text-[10px] text-amber-600 mt-0.5">! {g}</p>)}
                          </div>
                          {ind.auto
                            ? <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100 shrink-0" title="Statut calculé automatiquement depuis vos données">auto</span>
                            : <button onClick={() => cycleStatus(ind.id)} className="text-[9px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-200 shrink-0" title="Cliquer pour changer le statut">manuel</button>}
                          <span className={cls('text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 w-16 text-center', IND_STATUS[ind.status].badge)}>
                            {IND_STATUS[ind.status].label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══════════════ CRM ══════════════ */}
          {tab === 'crm' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">CRM — Clients & Financeurs</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Prescripteurs, OPCO, entreprises clientes</p>
                </div>
                <button onClick={() => openModal('client', emptyClient)} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {clients.map(c => (
                  <div key={c.id} className="px-6 py-4 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4.5 h-4.5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.contact} · {c.email} · {c.phone}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{c.type}</span>
                      <span className="text-xs font-black text-emerald-700">{c.ca?.toLocaleString('fr-FR')} €</span>
                      <button onClick={() => delItem('clients', c.id, setClients)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ FACTURATION ══════════════ */}
          {tab === 'facturation' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="CA total" value={`${(totalCA/1000).toFixed(1)}k€`} icon={Euro} color="emerald" />
                <KpiCard label="Devis acceptés" value={devis.filter(d => d.status === 'Accepté').length} icon={CheckCircle2} color="emerald" />
                <KpiCard label="En attente" value={devis.filter(d => d.status === 'En attente').length} icon={Clock} color="amber" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900">Devis & Factures</h3>
                  <button onClick={() => openModal('devis', emptyDevis)} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                    <Plus className="w-3.5 h-3.5" /> Nouveau devis
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {devis.map(d => (
                    <div key={d.id} className="px-6 py-4 flex items-center gap-4 group">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-slate-900">{d.client}</p>
                        <p className="text-[10px] text-slate-400">{d.session} · {d.date}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-sm font-black text-slate-900">{d.amount?.toLocaleString('fr-FR')} €</p>
                        <span className={cls('text-[10px] font-bold px-2.5 py-1 rounded-lg border',
                          d.status === 'Accepté' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          d.status === 'En attente' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-red-50 text-red-700 border-red-200')}>{d.status}</span>
                        <button className={cls(btn, 'bg-slate-100 text-slate-600 hover:bg-slate-200 py-1 px-2')}>
                          <Download className="w-3 h-3" />
                        </button>
                        <button onClick={() => delItem('devis', d.id, setDevis)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ COPILOTE IA ══════════════ */}
          {tab === 'copilote' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <KpiCard label="Audit-readiness" value={`${readiness}%`} icon={Shield} color="emerald" sub={`${indOk}/32 conformes`} />
                <KpiCard label="Écarts à combler" value={gaps.length} icon={AlertTriangle} color={gaps.length ? 'amber' : 'emerald'} />
                <KpiCard label="Prêt pour l'audit" value={readiness >= 90 ? 'Oui' : 'Bientôt'} icon={CheckCircle2} color={readiness >= 90 ? 'emerald' : 'amber'} />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900">Copilote IA — écarts prioritaires</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Preuves manquantes détectées automatiquement dans vos données</p>
                  </div>
                  <button onClick={exportDossier} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}>
                    <Download className="w-3.5 h-3.5" /> Exporter le dossier
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {gaps.length === 0 && (
                    <p className="text-xs text-center text-emerald-600 py-12 font-semibold">Tous les indicateurs sont conformes. Vous êtes prêt pour l&apos;audit.</p>
                  )}
                  {gaps.map(i => (
                    <div key={i.id} className="px-6 py-4 flex items-start gap-4">
                      <span className={cls('w-2 h-2 rounded-full mt-1.5 shrink-0', IND_STATUS[i.status].dot)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500">Ind. {i.id}</span>
                          <p className="text-xs font-bold text-slate-900">{i.label}</p>
                          <span className={cls('text-[9px] font-bold px-2 py-0.5 rounded border', IND_STATUS[i.status].badge)}>{IND_STATUS[i.status].label}</span>
                          {i.auto && <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100">auto</span>}
                        </div>
                        {i.gaps.map((g, idx) => (
                          <p key={idx} className="text-[11px] text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" /> {g}</p>
                        ))}
                        {i.evidence.map((e, idx) => (
                          <p key={idx} className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" /> {e}</p>
                        ))}
                      </div>
                      <button onClick={() => setTab(IND_TAB[i.id] || 'indicateurs')}
                        className={cls(btn, 'bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0')}>
                        Corriger <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ PREUVES IA ══════════════ */}
          {tab === 'preuves' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Analyse */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Analyser une preuve avec l'IA</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Importez un fichier (ou collez le texte) — l'IA le rattache à l'indicateur Qualiopi concerné.</p>
                </div>
                <label className={cls(btn, 'w-full justify-center border border-dashed border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer')}>
                  <Upload className="w-3.5 h-3.5" /> {extracting ? 'Extraction en cours (OCR si scanné)…' : 'Importer un fichier (PDF, image scannée, DOCX, TXT)'}
                  <input type="file" accept=".pdf,.docx,.txt,.md,.csv,.jpg,.jpeg,.png,.webp,.tif,.tiff" className="hidden" onChange={onFile} disabled={extracting} />
                </label>
                <Field label="Nom du document"><input className={inp} placeholder="ex : Feuille d'émargement session Next.js" value={aiForm.filename} onChange={e => setAiForm(p => ({ ...p, filename: e.target.value }))} /></Field>
                <div>
                  <label className={lbl}>Contenu du document</label>
                  <textarea className={cls(inp, 'resize-none font-mono')} rows={8} placeholder="Collez ici le texte du document (règlement intérieur, émargement, questionnaire de satisfaction, CV formateur, réclamation…)" value={aiForm.text} onChange={e => setAiForm(p => ({ ...p, text: e.target.value }))} />
                </div>
                <button onClick={analyzeDoc} disabled={aiLoading || !aiForm.text.trim()}
                  className={cls(btn, 'w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40')}>
                  <Award className="w-3.5 h-3.5" /> {aiLoading ? 'Analyse en cours…' : 'Analyser avec l\'IA'}
                </button>

                {aiResult && aiResult.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700">{aiResult.error}</div>
                )}
                {aiResult && !aiResult.error && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Résultat</span>
                      <span className={cls('text-[9px] font-bold px-2 py-0.5 rounded border', aiResult.engine === 'ia' ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-600 border-slate-200')}>
                        {aiResult.engine === 'ia' ? 'Moteur IA' : 'Moteur mots-clés'}
                      </span>
                    </div>
                    {aiResult.indicatorId ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500">Ind. {aiResult.indicatorId}</span>
                          <p className="text-xs font-bold text-slate-900">{indLabel(aiResult.indicatorId)}</p>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500 font-semibold">Confiance</span>
                            <span className="font-bold text-emerald-600">{Math.round((aiResult.confidence || 0) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.round((aiResult.confidence || 0) * 100)}%` }} />
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 italic">{aiResult.justification}</p>
                        {aiResult.attendu && (
                          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Attendu Qualiopi</p>
                            <p className="text-[10px] text-emerald-700 mt-0.5">{aiResult.attendu}</p>
                          </div>
                        )}
                        {aiResult.candidates?.length > 1 && (
                          <p className="text-[10px] text-slate-400">Autres pistes : {aiResult.candidates.slice(1).map(c => `Ind. ${c.id}`).join(', ')}</p>
                        )}
                        <button onClick={() => { validateDoc(documents[documents.length - 1], aiResult.indicatorId); setAiResult(null); setAiForm({ filename: '', text: '' }); }}
                          className={cls(btn, 'w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700')}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valider &amp; marquer l'indicateur conforme
                        </button>
                      </>
                    ) : (
                      <p className="text-[11px] text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {aiResult.justification}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Coffre-fort de preuves */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-xs font-extrabold text-slate-900">Coffre-fort de preuves</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{documents.length} document(s) analysé(s)</p>
                </div>
                <div className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
                  {documents.length === 0 && <p className="text-xs text-center text-slate-400 py-12">Aucune preuve analysée pour l'instant.</p>}
                  {[...documents].reverse().map(doc => (
                    <div key={doc.id} className="px-6 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{doc.filename}</p>
                        <p className="text-[10px] text-slate-400">
                          {doc.indicator ? `Ind. ${doc.indicator} — ${indLabel(doc.indicator)}` : 'Non rattaché'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {doc.confidence != null && <span className="text-[10px] text-slate-400">{Math.round(doc.confidence * 100)}%</span>}
                        {doc.status === 'validé'
                          ? <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">validé</span>
                          : <button onClick={() => validateDoc(doc, doc.indicator)} className="text-[9px] font-bold px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700">valider</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ DOCUMENTS TYPES ══════════════ */}
          {tab === 'documents' && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-xs font-extrabold text-slate-900">Bibliothèque de modèles conformes</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{TEMPLATES.length} modèles Qualiopi · {new Set(TEMPLATES.flatMap(t => t.indicators)).size}/32 indicateurs couverts — téléchargeables en PDF et Word.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className={lbl}>Pré-remplir pour la session</label>
                    <select className={inp} value={docSession} onChange={e => setDocSession(e.target.value)}>
                      <option value="">— Modèle vierge —</option>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Pour le stagiaire (attestation, positionnement)</label>
                    <select className={inp} value={docTrainee} onChange={e => setDocTrainee(e.target.value)}>
                      <option value="">— Aucun —</option>
                      {trainees.map(t => <option key={t.id} value={t.id}>{t.first} {t.last}</option>)}
                    </select>
                  </div>
                </div>
                {(docSession || docTrainee) && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-2">Les documents seront pré-remplis avec les données sélectionnées.</p>
                )}
              </div>
              <div className="divide-y divide-slate-50">
                {TEMPLATES.map(tpl => (
                  <div key={tpl.id} className="px-6 py-3.5 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-slate-400" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900">{tpl.title}</p>
                      <p className="text-[10px] text-slate-400">Ind. {tpl.indicators.join(', ')} — {indLabel(tpl.indicators[0])}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={docUrl(tpl.id, 'pdf')} className={cls(btn, 'bg-slate-100 text-slate-600 hover:bg-slate-200')}><Download className="w-3.5 h-3.5" /> PDF</a>
                      <a href={docUrl(tpl.id, 'docx')} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}><Download className="w-3.5 h-3.5" /> Word</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════ MON ORGANISME ══════════════ */}
          {tab === 'organisme' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Profil */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Profil de l&apos;organisme</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ces informations apparaissent en en-tête des documents générés.</p>
                </div>
                <div>
                  <label className={lbl}>Logo (PNG/JPG — apparaît sur les documents générés)</label>
                  <div className="flex items-center gap-3">
                    {profile.logo
                      ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={profile.logo} alt="logo" className="h-10 w-auto max-w-[120px] object-contain rounded border border-slate-100" />
                      : <div className="h-10 w-24 rounded border border-dashed border-slate-200 flex items-center justify-center text-[9px] text-slate-300">aucun</div>}
                    <label className={cls(btn, 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer')}>
                      <Upload className="w-3.5 h-3.5" /> Choisir
                      <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onLogo} />
                    </label>
                    {profile.logo && <button onClick={() => setProfile(p => ({ ...p, logo: '' }))} className="text-[10px] text-red-500 hover:underline">retirer</button>}
                  </div>
                </div>
                <Field label="Nom de l'organisme" full><input className={inp} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></Field>
                <Row2>
                  <Field label="N° de déclaration d'activité"><input className={inp} value={profile.nda} onChange={e => setProfile(p => ({ ...p, nda: e.target.value }))} /></Field>
                  <Field label="Téléphone"><input className={inp} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></Field>
                </Row2>
                <Field label="Adresse" full><input className={inp} value={profile.address} onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} /></Field>
                <Field label="E-mail de contact" full><input className={inp} value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} /></Field>
                <button onClick={saveProfile} className={cls(btn, 'bg-emerald-600 text-white hover:bg-emerald-700')}><Save className="w-3.5 h-3.5" /> Enregistrer</button>
                {orgMsg && <p className="text-[11px] text-emerald-600 font-semibold">{orgMsg}</p>}
              </div>

              {/* Équipe */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Utilisateurs de l&apos;organisme</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Les membres partagent le même espace. Vos données restent isolées de tout autre OF.</p>
                </div>
                <div className="divide-y divide-slate-50 border border-slate-100 rounded-xl">
                  {team.map(u => (
                    <div key={u.id} className="px-3 py-2.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700 shrink-0">{(u.name || u.email || '?').slice(0, 2).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{u.name || u.email}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      <span className={cls('text-[9px] font-bold px-2 py-0.5 rounded border', u.role === 'owner' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200')}>{u.role === 'owner' ? 'Propriétaire' : 'Membre'}</span>
                      {myRole === 'owner' && u.id !== myUserId && u.role !== 'owner' && (
                        <button onClick={() => removeTeamUser(u.id)} className="p-1 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                </div>
                {myRole === 'owner' ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ajouter un utilisateur</p>
                    <Row2>
                      <Field label="Nom"><input className={inp} value={teamForm.name} onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))} /></Field>
                      <Field label="E-mail"><input className={inp} type="email" value={teamForm.email} onChange={e => setTeamForm(p => ({ ...p, email: e.target.value }))} /></Field>
                    </Row2>
                    <Field label="Mot de passe (6 caractères min.)" full><input className={inp} type="password" value={teamForm.password} onChange={e => setTeamForm(p => ({ ...p, password: e.target.value }))} /></Field>
                    <button onClick={addTeamUser} className={cls(btn, 'bg-slate-100 text-slate-600 hover:bg-slate-200')}><Plus className="w-3.5 h-3.5" /> Ajouter le membre</button>
                  </div>
                ) : <p className="text-[11px] text-slate-400">Seul le propriétaire peut ajouter des utilisateurs.</p>}
                {orgMsg && <p className="text-[11px] text-red-600 font-semibold">{orgMsg}</p>}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ══════════════ MODALS ══════════════ */}
      {modal === 'session' && (
        <Modal title="Nouvelle session de formation" onSave={saveSession}>
          <Row2>
            <Field label="Intitulé *" full><input className={inp} placeholder="Titre de la formation" value={form.title||''} onChange={upd('title')} /></Field>
            <Field label="Formateur"><input className={inp} placeholder="Prénom N." value={form.trainer||''} onChange={upd('trainer')} /></Field>
            <Field label="Modalité">
              <select className={inp} value={form.modality||'Présentiel'} onChange={upd('modality')}>
                <option>Présentiel</option><option>Distanciel</option><option>Blended</option>
              </select>
            </Field>
            <Field label="Début"><input type="date" className={inp} value={form.start||''} onChange={upd('start')} /></Field>
            <Field label="Fin"><input type="date" className={inp} value={form.end||''} onChange={upd('end')} /></Field>
            <Field label="Durée"><input className={inp} placeholder="ex: 14h" value={form.duration||''} onChange={upd('duration')} /></Field>
            <Field label="Prix (€)"><input type="number" className={inp} value={form.price||''} onChange={upd('price')} /></Field>
            <Field label="Statut">
              <select className={inp} value={form.status||'Projet'} onChange={upd('status')}>
                <option>Projet</option><option>Actif</option><option>Terminé</option><option>Annulé</option>
              </select>
            </Field>
          </Row2>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="handi" checked={form.handicap||false} onChange={upd('handicap')} className="rounded" />
            <label htmlFor="handi" className="text-xs text-slate-700 font-semibold">Aménagement handicap requis</label>
          </div>
          {form.handicap && <Field label="Note handicap" full><input className={inp} placeholder="Describe les aménagements" value={form.handicapNote||''} onChange={upd('handicapNote')} /></Field>}
        </Modal>
      )}

      {modal === 'trainee' && (
        <Modal title="Nouveau stagiaire" onSave={saveTrainee}>
          <Row2>
            <Field label="Prénom *"><input className={inp} value={form.first||''} onChange={upd('first')} /></Field>
            <Field label="Nom"><input className={inp} value={form.last||''} onChange={upd('last')} /></Field>
            <Field label="Email"><input type="email" className={inp} value={form.email||''} onChange={upd('email')} /></Field>
            <Field label="Téléphone"><input className={inp} value={form.phone||''} onChange={upd('phone')} /></Field>
            <Field label="Situation handicap" full><input className={inp} placeholder="Aucun ou description" value={form.disability||''} onChange={upd('disability')} /></Field>
          </Row2>
        </Modal>
      )}

      {modal === 'veille' && (
        <Modal title="Nouvelle veille" onSave={saveVeille}>
          <Row2>
            <Field label="Type *"><input className={inp} placeholder="Réglementaire, Sectorielle…" value={form.type||''} onChange={upd('type')} /></Field>
            <Field label="Source"><input className={inp} value={form.source||''} onChange={upd('source')} /></Field>
            <Field label="Date"><input type="date" className={inp} value={form.date||''} onChange={upd('date')} /></Field>
            <Field label="Résumé" full><textarea className={cls(inp, 'resize-none')} rows={3} value={form.summary||''} onChange={upd('summary')} /></Field>
            <Field label="Exploitation prévue" full><textarea className={cls(inp, 'resize-none')} rows={2} value={form.exploit||''} onChange={upd('exploit')} /></Field>
          </Row2>
        </Modal>
      )}

      {modal === 'rec' && (
        <Modal title="Nouvelle réclamation" onSave={saveRec}>
          <Row2>
            <Field label="Émetteur *"><input className={inp} value={form.issuer||''} onChange={upd('issuer')} /></Field>
            <Field label="Rôle"><input className={inp} placeholder="Stagiaire, Financeur…" value={form.role||''} onChange={upd('role')} /></Field>
            <Field label="Date"><input type="date" className={inp} value={form.date||''} onChange={upd('date')} /></Field>
            <Field label="Statut">
              <select className={inp} value={form.status||'En cours'} onChange={upd('status')}>
                <option>En cours</option><option>Résolue</option>
              </select>
            </Field>
            <Field label="Description" full><textarea className={cls(inp, 'resize-none')} rows={3} value={form.desc||''} onChange={upd('desc')} /></Field>
            <Field label="Réponse apportée" full><textarea className={cls(inp, 'resize-none')} rows={2} value={form.reply||''} onChange={upd('reply')} /></Field>
          </Row2>
        </Modal>
      )}

      {modal === 'pac' && (
        <Modal title="Nouvelle action d'amélioration" onSave={savePac}>
          <Row2>
            <Field label="Action *" full><input className={inp} placeholder="Description de l'action" value={form.action||''} onChange={upd('action')} /></Field>
            <Field label="Indicateur"><input className={inp} placeholder="Indicateur 31" value={form.indicator||''} onChange={upd('indicator')} /></Field>
            <Field label="Déclencheur"><input className={inp} placeholder="Audit, Réclamation…" value={form.trigger||''} onChange={upd('trigger')} /></Field>
            <Field label="Responsable"><input className={inp} value={form.owner||''} onChange={upd('owner')} /></Field>
            <Field label="Échéance"><input type="date" className={inp} value={form.deadline||''} onChange={upd('deadline')} /></Field>
            <Field label="Statut">
              <select className={inp} value={form.status||'En cours'} onChange={upd('status')}>
                <option>En cours</option><option>Terminé</option><option>En attente</option>
              </select>
            </Field>
          </Row2>
        </Modal>
      )}

      {modal === 'client' && (
        <Modal title="Nouveau client / financeur" onSave={saveClient}>
          <Row2>
            <Field label="Nom *"><input className={inp} value={form.name||''} onChange={upd('name')} /></Field>
            <Field label="Type">
              <select className={inp} value={form.type||'Financeur'} onChange={upd('type')}>
                <option>Financeur</option><option>Prescripteur</option><option>Entreprise cliente</option><option>OPCO</option>
              </select>
            </Field>
            <Field label="Contact"><input className={inp} value={form.contact||''} onChange={upd('contact')} /></Field>
            <Field label="Email"><input type="email" className={inp} value={form.email||''} onChange={upd('email')} /></Field>
            <Field label="Téléphone"><input className={inp} value={form.phone||''} onChange={upd('phone')} /></Field>
            <Field label="CA estimé (€)"><input type="number" className={inp} value={form.ca||''} onChange={upd('ca')} /></Field>
          </Row2>
        </Modal>
      )}

      {modal === 'devis' && (
        <Modal title="Nouveau devis" onSave={saveDevis}>
          <Row2>
            <Field label="Client *"><input className={inp} value={form.client||''} onChange={upd('client')} /></Field>
            <Field label="Session concernée"><input className={inp} value={form.session||''} onChange={upd('session')} /></Field>
            <Field label="Montant HT (€)"><input type="number" className={inp} value={form.amount||''} onChange={upd('amount')} /></Field>
            <Field label="Date"><input type="date" className={inp} value={form.date||''} onChange={upd('date')} /></Field>
            <Field label="Statut">
              <select className={inp} value={form.status||'En attente'} onChange={upd('status')}>
                <option>En attente</option><option>Accepté</option><option>Refusé</option>
              </select>
            </Field>
          </Row2>
        </Modal>
      )}

      {/* ══════════════ Aide & feedback ══════════════ */}
      <button onClick={() => setFeedback({ msg: '', state: 'idle' })}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg hover:bg-emerald-700 transition">
        <MessageSquareWarning className="w-4 h-4" /> Aide &amp; feedback
      </button>

      {feedback && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4" onClick={() => setFeedback(null)}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Aide &amp; feedback</h3>
              <button onClick={() => setFeedback(null)} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            {feedback.state === 'sent' ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                Merci&nbsp;! Votre message a bien été transmis à l&apos;équipe Certivia. Nous vous répondrons par e-mail.
              </div>
            ) : (
              <>
                <p className="text-[11px] text-slate-500 mb-3">Une question, un bug, une idée&nbsp;? Écrivez-nous, on vous répond par e-mail.</p>
                <textarea autoFocus rows={4} className={cls(inp, 'resize-none')} placeholder="Votre message…"
                  value={feedback.msg} onChange={e => setFeedback(f => ({ ...f, msg: e.target.value }))} />
                {feedback.state === 'error' && <p className="text-[11px] text-red-600 mt-2">L&apos;envoi a échoué. Réessayez ou écrivez à contact@certivia.app.</p>}
                <button onClick={sendFeedback} disabled={!feedback.msg.trim() || feedback.state === 'sending'}
                  className="mt-3 w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">
                  {feedback.state === 'sending' ? 'Envoi…' : 'Envoyer'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}