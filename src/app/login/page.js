'use client';

import { useState } from 'react';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ofName, setOfName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body = mode === 'login' ? { email, password } : { email, password, ofName };
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Une erreur est survenue.'); setLoading(false); return; }
      window.location.href = '/';
    } catch (err) {
      setError(err.message); setLoading(false);
    }
  };

  const inp = 'w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white text-slate-800 placeholder-slate-300';
  const lbl = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 tracking-tight">QualiSaaS</p>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Pilotage Qualiopi</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex gap-2 mb-5 bg-slate-100 rounded-xl p-1">
            <button onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              Se connecter
            </button>
            <button onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mode === 'signup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              Créer un compte
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className={lbl}>Nom de l&apos;organisme de formation</label>
                <input className={inp} placeholder="Mon Organisme de Formation" value={ofName} onChange={e => setOfName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className={lbl}>E-mail</label>
              <input type="email" className={inp} placeholder="vous@organisme.fr" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>Mot de passe</label>
              <input type="password" className={inp} placeholder={mode === 'signup' ? '6 caractères minimum' : '••••••••'} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition">
              {loading ? 'Veuillez patienter…' : mode === 'login' ? 'Se connecter' : 'Créer mon espace'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          {mode === 'login' ? "Pas encore de compte ? Cliquez sur « Créer un compte »." : 'Votre espace est isolé et sécurisé.'}
        </p>
      </div>
    </div>
  );
}
