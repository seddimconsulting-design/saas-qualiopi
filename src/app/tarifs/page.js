'use client';

import { useState } from 'react';
import { GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import { PLANS } from '@/lib/billing';

const cls = (...a) => a.filter(Boolean).join(' ');

export default function TarifsPage() {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const subscribe = async (planId) => {
    setError(''); setLoading(planId);
    try {
      const r = await fetch('/api/billing/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      if (r.status === 401) { window.location.href = '/login?mode=signup'; return; }
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Impossible de démarrer la souscription.'); setLoading(null); return; }
      window.location.href = d.url;
    } catch (e) { setError(e.message); setLoading(null); }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
            <span className="text-base font-black tracking-tight">Certivia</span>
          </a>
          <a href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">Se connecter</a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-5 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-black tracking-tight">Des tarifs simples et transparents</h1>
          <p className="mt-3 text-slate-500">Sans engagement. Essai gratuit pour découvrir l’outil, puis l’offre qui vous correspond.</p>
        </div>

        {error && <div className="max-w-md mx-auto mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 text-center">{error}</div>}

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((p) => (
            <div key={p.id} className={cls('rounded-2xl border p-7 flex flex-col', p.highlight ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200')}>
              {p.highlight && <span className="self-start text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full mb-3">Le plus choisi</span>}
              <h2 className="text-xl font-black">{p.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{p.tagline}</p>
              <div className="mt-4 mb-5">
                <span className="text-4xl font-black">{p.price}</span>
                <span className="text-sm text-slate-400 font-medium"> {p.period}</span>
              </div>
              <ul className="space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => subscribe(p.id)} disabled={loading === p.id}
                className={cls('mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50',
                  p.highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800')}>
                {loading === p.id ? 'Redirection…' : 'Choisir cette offre'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-10">
          Vous n’avez pas encore de compte ? <a href="/login?mode=signup" className="text-emerald-600 font-bold hover:underline">Démarrez l’essai gratuit</a>.
        </p>
      </main>

      <footer className="border-t border-slate-100 mt-8">
        <div className="max-w-5xl mx-auto px-5 py-6 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
          <a href="/legal/mentions-legales" className="hover:text-slate-700">Mentions légales</a>
          <a href="/legal/confidentialite" className="hover:text-slate-700">Confidentialité</a>
          <a href="/legal/cgu" className="hover:text-slate-700">CGU</a>
        </div>
      </footer>
    </div>
  );
}
