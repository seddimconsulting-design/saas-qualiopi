import {
  GraduationCap, ShieldCheck, Gauge, FileCheck2, Sparkles, Users,
  LayoutDashboard, CheckCircle2, ArrowRight, Clock, FolderCheck, Star,
} from 'lucide-react';

const FEATURES = [
  { icon: LayoutDashboard, title: 'Cockpit des 32 indicateurs', desc: 'Visualisez en temps réel votre conformité au Référentiel National Qualité, indicateur par indicateur, avec le niveau d’attendu de chacun.' },
  { icon: FileCheck2, title: 'Moteur de preuves', desc: 'Certivia relie automatiquement vos sessions, documents et actions aux indicateurs concernés. Plus aucune preuve oubliée le jour de l’audit.' },
  { icon: Gauge, title: 'Score d’audit-readiness', desc: 'Un score clair et déterministe qui vous dit, à tout instant, si vous êtes prêt pour l’audit de surveillance ou de renouvellement.' },
  { icon: FolderCheck, title: 'Bibliothèque de documents', desc: 'Générez conventions, programmes, feuilles d’émargement et certificats pré-remplis (PDF & Word) à votre en-tête, en un clic.' },
  { icon: Sparkles, title: 'Copilote IA', desc: 'Classez vos documents, identifiez les preuves manquantes et recevez des recommandations concrètes pour combler vos écarts.' },
  { icon: Users, title: 'Multi-utilisateurs', desc: 'Invitez votre équipe, chacun avec son rôle. Vos données sont isolées, chiffrées et hébergées en Europe.' },
];

const STEPS = [
  { n: '1', title: 'Créez votre espace', desc: 'Inscription en 30 secondes. Votre organisme, vos sessions, votre en-tête.' },
  { n: '2', title: 'Pilotez au quotidien', desc: 'Sessions, stagiaires, satisfaction, veille, réclamations : tout remonte dans le cockpit.' },
  { n: '3', title: 'Passez l’audit sereinement', desc: 'Exportez votre dossier de preuves complet et abordez l’audit Qualiopi la tête haute.' },
];

function Nav() {
  return (
    <nav className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none">
            <p className="text-base font-black text-slate-900 tracking-tight">Certivia</p>
            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Pilotage Qualiopi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2">Se connecter</a>
          <a href="/login?mode=signup" className="text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition">
            Essai gratuit
          </a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/70 to-transparent" />
      <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> Conçu pour les organismes de formation certifiés Qualiopi
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-3xl mx-auto">
          Votre conformité Qualiopi,<br />
          <span className="text-emerald-600">pilotée en temps réel.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Certivia transforme la contrainte Qualiopi en tableau de bord vivant : 32 indicateurs suivis,
          preuves reliées automatiquement, documents générés en un clic. Passez vos audits sereinement.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/login?mode=signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-3.5 rounded-xl transition shadow-sm">
            Démarrer l’essai gratuit <ArrowRight className="w-4 h-4" />
          </a>
          <a href="/login?demo=1" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold px-6 py-3.5 rounded-xl border border-slate-200 transition">
            Voir la démo en direct
          </a>
        </div>
        <p className="mt-4 text-xs text-slate-400">Sans carte bancaire · Données hébergées en Europe</p>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { v: '32', l: 'indicateurs RNQ suivis' },
    { v: '7', l: 'critères Qualiopi couverts' },
    { v: '1 clic', l: 'pour générer vos documents' },
    { v: '100 %', l: 'de vos preuves reliées' },
  ];
  return (
    <section className="max-w-6xl mx-auto px-5 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((i, k) => (
          <div key={k} className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
            <p className="text-2xl font-black text-emerald-600">{i.v}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{i.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-5 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tout ce qu’il faut pour rester conforme</h2>
        <p className="mt-3 text-slate-500">Un seul outil pour piloter la qualité, réunir vos preuves et affronter l’audit l’esprit tranquille.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, k) => (
          <div key={k} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:border-emerald-100 transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              <f.icon className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section className="bg-slate-50 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Prêt en 3 étapes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center mb-4">{s.n}</div>
              <h3 className="text-lg font-extrabold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-10 sm:p-14 text-center text-white">
        <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5">
          <Star className="w-3.5 h-3.5" /> Démonstration
        </div>
        <h2 className="text-3xl font-black tracking-tight">Explorez un espace déjà rempli</h2>
        <p className="mt-3 text-emerald-50 max-w-xl mx-auto">
          Découvrez Certivia avec un organisme de démonstration : sessions, stagiaires, preuves et documents déjà en place.
        </p>
        <a href="/login?demo=1" className="mt-7 inline-flex items-center justify-center gap-2 bg-white text-emerald-700 text-sm font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-50 transition">
          Ouvrir la démo <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

function FinalCta() {
  const points = ['Mise en place immédiate', 'Vos données isolées et sécurisées', 'Support en français'];
  return (
    <section className="max-w-6xl mx-auto px-5 pb-20">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Prêt à reprendre la main sur votre Qualiopi&nbsp;?</h2>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {points.map((p) => (
            <span key={p} className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {p}
            </span>
          ))}
        </div>
        <a href="/login?mode=signup" className="mt-7 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-7 py-3.5 rounded-xl transition shadow-sm">
          Créer mon espace gratuitement <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-black text-slate-900">Certivia</span>
          <span className="text-xs text-slate-400">— Pilotage Qualiopi</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Hébergé en Europe</span>
          <a href="/login" className="hover:text-slate-700 font-medium">Se connecter</a>
        </div>
      </div>
      <p className="text-center text-[11px] text-slate-300 pb-6">© {new Date().getFullYear()} Certivia. Tous droits réservés.</p>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <Steps />
      <Demo />
      <FinalCta />
      <Footer />
    </div>
  );
}
