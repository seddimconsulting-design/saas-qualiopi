'use client';

import React, { useState, useMemo } from 'react';
import {
  GraduationCap, LayoutDashboard, Users, Rss, MessageSquareWarning,
  CheckSquare, Plus, FileText, Trash2, AlertTriangle, CheckCircle2,
  Save, ChevronRight, TrendingUp, BarChart3, Euro, Calendar,
  Clock, Star, Building2, CreditCard, ClipboardList, Bell,
  BookOpen, Shield, Award, X, Filter, Search, Download,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

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

/* ─── KPI card ─── */
function KpiCard({ label, value, sub, icon: Icon, color = 'indigo', trend }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
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

/* ──────────── APP ──────────── */
export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [search, setSearch] = useState('');

  /* modals */
  const [modal, setModal] = useState(null); // 'session'|'trainee'|'veille'|'rec'|'pac'|'client'|'devis'|'satisfaction'

  /* data */
  const [sessions, setSessions] = useState([
    { id: 's1', title: 'Développement Web Next.js', trainer: 'Guillaume S.', start: '2026-07-10', end: '2026-07-12', duration: '14h', status: 'Projet', trainees: 5, handicap: true, handicapNote: 'Supports en gros caractères pour Laurence Martin.', price: 2800, modality: 'Présentiel', docs: { convention: false, positioning: false, attendance: false, certificate: false } },
    { id: 's2', title: "S&apos;installer et pérenniser son OF", trainer: 'Thomas M.', start: '2026-06-15', end: '2026-06-18', duration: '21h', status: 'Actif', trainees: 8, handicap: false, handicapNote: '', price: 4200, modality: 'Présentiel', docs: { convention: true, positioning: true, attendance: false, certificate: false } },
    { id: 's3', title: 'RGPD & Gestion des données', trainer: 'Marie D.', start: '2026-05-01', end: '2026-05-02', duration: '7h', status: 'Terminé', trainees: 4, handicap: false, handicapNote: '', price: 1400, modality: 'Distanciel', docs: { convention: true, positioning: true, attendance: true, certificate: true } },
  ]);

  const [trainees, setTrainees] = useState([
    { id: 't1', first: 'Laurence', last: 'Martin', email: 'l.martin@test.fr', phone: '06 12 34 56 78', disability: 'Déficience visuelle légère', score: '85%', satHot: 4, satCold: null },
    { id: 't2', first: 'Julien', last: 'Dupont', email: 'j.dupont@test.fr', phone: '06 98 76 54 32', disability: '', score: 'Non fait', satHot: 5, satCold: 4 },
    { id: 't3', first: 'Sarah', last: 'Alami', email: 's.alami@test.fr', phone: '07 11 22 33 44', disability: '', score: '90%', satHot: 5, satCold: 5 },
  ]);

  const [veilles, setVeilles] = useState([
    { id: 'v1', type: 'Réglementaire (Ind. 23)', source: 'Décret JO de la formation', summary: 'Obligations de transparence renforcées sur le CPF dès juillet 2026.', exploit: 'Mise à jour des CGV et mention sur le devis standard.', date: '2026-06-01' },
  ]);

  const [reclamations, setReclamations] = useState([
    { id: 'r1', issuer: 'OPCO Atlas', role: 'Financeur', desc: "Délai trop long pour la réception du certificat de réalisation.", status: 'Résolue', reply: 'Certificat généré et renvoyé en 5 min. Action préventive intégrée dans le PAC.', date: '2026-05-10' },
  ]);

  const [pac, setPac] = useState([
    { id: 'p1', action: "Automatiser l'envoi du certificat de réalisation", indicator: 'Indicateur 31', trigger: 'Réclamation OPCO', owner: 'Resp. Qualité', deadline: '2026-06-30', status: 'Terminé' },
  ]);

  const [clients, setClients] = useState([
    { id: 'c1', name: 'OPCO Atlas', type: 'Financeur', contact: 'Marie Leblanc', email: 'm.leblanc@opco.fr', phone: '01 23 45 67 89', ca: 4200 },
    { id: 'c2', name: 'BTP Formation', type: 'Prescripteur', contact: 'Jacques Morin', email: 'j.morin@btp.fr', phone: '01 98 76 54 32', ca: 2800 },
  ]);

  const [devis, setDevis] = useState([
    { id: 'd1', client: 'BTP Formation', session: 'Développement Web Next.js', amount: 2800, status: 'Accepté', date: '2026-06-10' },
    { id: 'd2', client: 'OPCO Atlas', session: "S'installer et pérenniser son OF", amount: 4200, status: 'En attente', date: '2026-06-15' },
  ]);

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
  const indOk       = INDICATEURS.filter(i => i.ok).length;
  const satScores   = trainees.filter(t => t.satHot).map(t => t.satHot);
  const avgSat      = satScores.length ? (satScores.reduce((a,b) => a+b, 0) / satScores.length).toFixed(1) : '–';

  const filteredSessions = useMemo(() =>
    sessions.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.trainer.toLowerCase().includes(search.toLowerCase())),
    [sessions, search]
  );

  /* actions */
  const toggleDoc = (docKey) => {
    if (!selectedSessionId) return;
    setSessions(p => p.map(s => s.id === selectedSessionId ? { ...s, docs: { ...s.docs, [docKey]: !s.docs[docKey] } } : s));
  };

  const saveSession = () => {
    if (!form.title?.trim()) return;
    setSessions(p => [...p, { ...emptySession, ...form, id: `s${Date.now()}`, docs: { convention: false, positioning: false, attendance: false, certificate: false } }]);
    closeModal();
  };
  const saveTrainee = () => {
    if (!form.first?.trim()) return;
    setTrainees(p => [...p, { ...emptyTrainee, ...form, id: `t${Date.now()}` }]);
    closeModal();
  };
  const saveVeille = () => {
    if (!form.type?.trim()) return;
    setVeilles(p => [...p, { ...emptyVeille, ...form, id: `v${Date.now()}` }]);
    closeModal();
  };
  const saveRec = () => {
    if (!form.issuer?.trim()) return;
    setReclamations(p => [...p, { ...emptyRec, ...form, id: `r${Date.now()}` }]);
    closeModal();
  };
  const savePac = () => {
    if (!form.action?.trim()) return;
    setPac(p => [...p, { ...emptyPac, ...form, id: `p${Date.now()}` }]);
    closeModal();
  };
  const saveClient = () => {
    if (!form.name?.trim()) return;
    setClients(p => [...p, { ...emptyClient, ...form, id: `c${Date.now()}` }]);
    closeModal();
  };
  const saveDevis = () => {
    if (!form.client?.trim()) return;
    setDevis(p => [...p, { ...emptyDevis, ...form, id: `d${Date.now()}` }]);
    closeModal();
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
    { key: 'crm',          icon: Building2,       label: 'CRM' },
    { key: 'facturation',  icon: Euro,            label: 'Devis & Facturation' },
  ];

  /* ── shared styles ── */
  const inp = "w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-slate-800 placeholder-slate-300";
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
          <button onClick={onSave} className={cls(btn, 'bg-indigo-600 text-white hover:bg-indigo-700')}><Save className="w-3.5 h-3.5" /> Enregistrer</button>
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
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">QualiSaaS</p>
              <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">Qualiopi</p>
            </div>
          </div>

          {/* Conformité pill */}
          <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-500">Conformité dossier</span>
              <span className="text-xs font-black text-indigo-600">{conformRate}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${conformRate}%` }} />
            </div>
          </div>

          {/* Nav */}
          <nav className="p-2 space-y-0.5 mt-1">
            {navItems.map(({ key, icon: Icon, label, badge }) => (
              <button key={key} onClick={() => setTab(key)}
                className={cls('w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition',
                  tab === key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge > 0 && <span className="w-4 h-4 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center">{badge}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-800">Sokai Formation</p>
          <p className="text-[10px] text-slate-400">NDA : 93123456789</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Certifié Qualiopi</p>
        </div>
      </aside>

      {/* ── Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">{navItems.find(n => n.key === tab)?.label}</h2>
            <p className="text-[11px] text-slate-400">Sokai Formation · 32 indicateurs Qualiopi</p>
          </div>
          <div className="flex items-center gap-2">
            {openRec > 0 && (
              <button onClick={() => setTab('reclamations')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-bold animate-pulse">
                <Bell className="w-3 h-3" /> {openRec} réclamation{openRec > 1 ? 's' : ''} ouverte{openRec > 1 ? 's' : ''}
              </button>
            )}
            <div className={cls('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border',
              conformRate === 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : conformRate >= 70 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-200')}>
              <span className={cls('w-2 h-2 rounded-full', conformRate === 100 ? 'bg-emerald-500 animate-pulse' : conformRate >= 70 ? 'bg-amber-500' : 'bg-red-500')} />
              {conformRate}% conforme
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ══════════════ DASHBOARD ══════════════ */}
          {tab === 'dashboard' && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <KpiCard label="Conformité" value={`${conformRate}%`} icon={Shield} color="indigo" sub={`${totalDocs}/${maxDocs} docs`} trend={5} />
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
                    <button onClick={() => setTab('sessions')} className="text-[10px] text-indigo-600 font-bold hover:underline">Tout voir →</button>
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
                      const inds = INDICATEURS.filter(i => i.crit === +k);
                      const okCount = inds.filter(i => i.ok).length;
                      const pct = Math.round((okCount / inds.length) * 100);
                      return (
                        <div key={k}>
                          <div className="flex justify-between mb-1">
                            <p className="text-[10px] font-semibold text-slate-600 truncate max-w-[160px]">C{k} · {label}</p>
                            <p className="text-[10px] font-bold text-slate-500">{okCount}/{inds.length}</p>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className={cls('h-1.5 rounded-full', pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-indigo-500' : 'bg-amber-400')}
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
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-700 shrink-0">{t.first[0]}{t.last[0]}</div>
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
                  <button onClick={() => openModal('session', emptySession)} className={cls(btn, 'bg-indigo-600 text-white hover:bg-indigo-700')}>
                    <Plus className="w-3.5 h-3.5" /> Nouvelle
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {filteredSessions.map(s => {
                    const done = Object.values(s.docs).filter(Boolean).length;
                    return (
                      <div key={s.id} onClick={() => setSelectedSessionId(s.id === selectedSessionId ? null : s.id)}
                        className={cls('px-6 py-4 flex items-center gap-4 cursor-pointer transition group',
                          selectedSessionId === s.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent hover:bg-slate-50')}>
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
                        <button onClick={e => { e.stopPropagation(); setSessions(p => p.filter(x => x.id !== s.id)); if (selectedSessionId === s.id) setSelectedSessionId(null); }}
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
                      <p className="text-[11px] font-bold text-indigo-600 mt-0.5">{selectedSession.price?.toLocaleString('fr-FR')} €</p>
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
                        <button key={k} onClick={() => toggleDoc(k)}
                          className={cls('w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition',
                            v ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50')}>
                          {v ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                             : <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />}
                          <span className={cls('text-xs font-semibold flex-1', v ? 'text-emerald-700' : 'text-slate-600')}>{DOC_LABELS[k]}</span>
                          {v && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">OK</span>}
                        </button>
                      ))}
                    </div>
                    <button className={cls(btn, 'w-full justify-center bg-slate-100 text-slate-600 hover:bg-slate-200')}>
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
                <button onClick={() => openModal('trainee', emptyTrainee)} className={cls(btn, 'bg-indigo-600 text-white hover:bg-indigo-700')}>
                  <Plus className="w-3.5 h-3.5" /> Ajouter
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {trainees.map(t => (
                  <div key={t.id} className="px-6 py-4 flex items-center gap-4 group">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-black text-indigo-700 shrink-0">{t.first[0]}{t.last[0]}</div>
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
                      <button onClick={() => setTrainees(p => p.filter(x => x.id !== t.id))}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                <KpiCard label="Taux de réponse" value={`${Math.round((trainees.filter(t => t.satHot).length / trainees.length) * 100)}%`} icon={BarChart3} color="indigo" />
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
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-700 shrink-0">{t.first[0]}{t.last[0]}</div>
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
                              ? <Star key={n} className={cls('w-3.5 h-3.5', t.satCold >= n ? 'text-indigo-400 fill-indigo-400' : 'text-slate-200 fill-slate-200')} />
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
                <button onClick={() => openModal('veille', emptyVeille)} className={cls(btn, 'bg-indigo-600 text-white hover:bg-indigo-700')}>
                  <Plus className="w-3.5 h-3.5" /> Nouvelle veille
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {veilles.map(v => (
                  <div key={v.id} className="px-6 py-5 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{v.type}</span>
                          <span className="text-[10px] text-slate-400">Source : {v.source}</span>
                          <span className="text-[10px] text-slate-400">· {v.date}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mb-2">{v.summary}</p>
                        <div className="flex items-start gap-1.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <ChevronRight className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-emerald-700 font-semibold">{v.exploit}</p>
                        </div>
                      </div>
                      <button onClick={() => setVeilles(p => p.filter(x => x.id !== v.id))}
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
                <button onClick={() => openModal('rec', emptyRec)} className={cls(btn, 'bg-indigo-600 text-white hover:bg-indigo-700')}>
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
                      <button onClick={() => setReclamations(p => p.filter(x => x.id !== r.id))}
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
                <button onClick={() => openModal('pac', emptyPac)} className={cls(btn, 'bg-indigo-600 text-white hover:bg-indigo-700')}>
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
                        {p.indicator && <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{p.indicator}</span>}
                        <span className={cls('text-[10px] font-bold px-2 py-0.5 rounded border', PAC_STATUS[p.status])}>{p.status}</span>
                        {p.deadline && <span className="text-[10px] text-slate-400">Échéance : {p.deadline}</span>}
                        {p.owner && <span className="text-[10px] text-slate-400">· {p.owner}</span>}
                      </div>
                      {p.trigger && <p className="text-[10px] text-slate-400 mt-1">Déclenché par : {p.trigger}</p>}
                    </div>
                    <button onClick={() => setPac(prev => prev.filter(x => x.id !== p.id))}
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
                <KpiCard label="Taux global" value={`${Math.round(indOk / 32 * 100)}%`} icon={Shield} color="indigo" />
              </div>
              {Object.entries(CRITERES_LABELS).map(([k, clabel]) => {
                const inds = INDICATEURS.filter(i => i.crit === +k);
                return (
                  <div key={k} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-extrabold text-slate-900">Critère {k} — {clabel}</p>
                      <span className="text-[10px] font-bold text-slate-500">{inds.filter(i => i.ok).length}/{inds.length} OK</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {inds.map(ind => (
                        <div key={ind.id} className="px-6 py-3 flex items-center gap-3">
                          {ind.ok
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                          <span className="text-[10px] font-bold text-slate-500 w-8">Ind. {ind.id}</span>
                          <p className="text-xs text-slate-700 flex-1">{ind.label}</p>
                          <span className={cls('text-[9px] font-bold px-2 py-0.5 rounded border', ind.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-100')}>
                            {ind.ok ? 'Conforme' : 'À compléter'}
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
                <button onClick={() => openModal('client', emptyClient)} className={cls(btn, 'bg-indigo-600 text-white hover:bg-indigo-700')}>
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
                      <button onClick={() => setClients(p => p.filter(x => x.id !== c.id))}
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
                <KpiCard label="Devis acceptés" value={devis.filter(d => d.status === 'Accepté').length} icon={CheckCircle2} color="indigo" />
                <KpiCard label="En attente" value={devis.filter(d => d.status === 'En attente').length} icon={Clock} color="amber" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900">Devis & Factures</h3>
                  <button onClick={() => openModal('devis', emptyDevis)} className={cls(btn, 'bg-indigo-600 text-white hover:bg-indigo-700')}>
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
                        <button onClick={() => setDevis(p => p.filter(x => x.id !== d.id))}
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

    </div>
  );
}