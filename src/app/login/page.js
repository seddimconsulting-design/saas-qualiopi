'use client';

import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ofName, setOfName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Paramètres d'URL : ?mode=signup (créer un compte) ou ?demo=1 (pré-remplir la démo)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('mode') === 'signup') setMode('signup');
    if (q.get('demo') === '1') {
      setMode('login');
      setEmail('demo@certivia.app');
      setPassword('DemoCertivia2026');
      setIsDemo(true);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup' && !acceptTerms) {
      setError('Vous devez accepter les CGU et la politique de confidentialité.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'forgot') {
        await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
        setForgotSent(true); setLoading(false); return;
      }
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

  const inp = 'w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white text-slate-800 placeholder-slate-300';
  const lbl = 'block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 tracking-tight">Certivia</p>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Pilotage Qualiopi</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {isDemo && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
              <span className="font-bold">Mode démonstration.</span> Identifiants pré-remplis&nbsp;: cliquez sur «&nbsp;Se connecter&nbsp;» pour explorer un espace déjà rempli.
            </div>
          )}
          {mode !== 'forgot' ? (
            <div className="flex gap-2 mb-5 bg-slate-100 rounded-xl p-1">
              <button onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mode === 'login' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
                Se connecter
              </button>
              <button onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${mode === 'signup' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>
                Créer un compte
              </button>
            </div>
          ) : (
            <div className="mb-5">
              <h1 className="text-sm font-extrabold text-slate-900">Mot de passe oublié</h1>
              <button onClick={() => { setMode('login'); setError(''); setForgotSent(false); }} className="text-[11px] text-emerald-600 font-bold hover:underline">← Retour à la connexion</button>
            </div>
          )}

          {mode === 'forgot' && forgotSent ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
              Si un compte existe pour cette adresse, un e-mail contenant un lien de réinitialisation vient d&apos;être envoyé. Pensez à vérifier vos spams.
            </div>
          ) : (
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
              {mode !== 'forgot' && (
                <div>
                  <label className={lbl}>Mot de passe</label>
                  <input type="password" className={inp} placeholder={mode === 'signup' ? '6 caractères minimum' : '••••••••'} value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              )}

              {mode === 'signup' && (
                <label className="flex items-start gap-2.5 text-[11px] text-slate-500 leading-snug cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-emerald-600 w-4 h-4 shrink-0"
                    checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} />
                  <span>
                    J&apos;accepte les{' '}
                    <a href="/legal/cgu" target="_blank" className="text-emerald-600 font-bold hover:underline">CGU</a>{' '}et la{' '}
                    <a href="/legal/confidentialite" target="_blank" className="text-emerald-600 font-bold hover:underline">politique de confidentialité</a>.
                  </span>
                </label>
              )}

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition">
                {loading ? 'Veuillez patienter…' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon espace' : 'Envoyer le lien'}
              </button>

              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('forgot'); setError(''); setForgotSent(false); }}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-600">Mot de passe oublié ?</button>
              )}
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          {mode === 'login' ? "Pas encore de compte ? Cliquez sur « Créer un compte »." : mode === 'signup' ? 'Votre espace est isolé et sécurisé.' : 'Vous recevrez un lien valable 1 heure.'}
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-300">
          <a href="/legal/mentions-legales" className="hover:text-slate-500">Mentions légales</a>
          <a href="/legal/confidentialite" className="hover:text-slate-500">Confidentialité</a>
          <a href="/legal/cgu" className="hover:text-slate-500">CGU</a>
        </div>
      </div>
    </div>
  );
}
