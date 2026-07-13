'use client';

import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

export default function ResetPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Mot de passe : 6 caractères minimum.'); return; }
    if (password !== confirm) { setError('Les deux mots de passe ne correspondent pas.'); return; }
    setLoading(true);
    try {
      const r = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Une erreur est survenue.'); setLoading(false); return; }
      setDone(true);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const inp = 'w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-slate-800 placeholder-slate-300';
  const lbl = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
          <p className="text-lg font-black text-slate-900 tracking-tight">Certivia</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h1 className="text-sm font-extrabold text-slate-900 mb-4">Nouveau mot de passe</h1>
          {done ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">Mot de passe modifié avec succès.</div>
              <a href="/login" className="block text-center w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">Se connecter</a>
            </div>
          ) : !token ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">Lien invalide (jeton manquant). Refaites une demande depuis la page de connexion.</div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className={lbl}>Nouveau mot de passe</label>
                <input type="password" className={inp} placeholder="6 caractères minimum" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Confirmer</label>
                <input type="password" className={inp} placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">
                {loading ? 'Veuillez patienter…' : 'Réinitialiser le mot de passe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
