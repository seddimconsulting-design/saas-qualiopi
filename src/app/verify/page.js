'use client';

import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

export default function VerifyPage() {
  const [state, setState] = useState('loading'); // 'loading' | 'ok' | 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') || '';
    if (!token) { setState('error'); setError('Lien invalide (jeton manquant).'); return; }
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setState('error'); setError(data.error || 'Lien invalide ou expiré.'); return; }
        setState('ok');
      })
      .catch((e) => { setState('error'); setError(e.message); });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
          <p className="text-lg font-black text-slate-900 tracking-tight">Certivia</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
          {state === 'loading' && <p className="text-sm text-slate-500 py-4">Vérification en cours…</p>}
          {state === 'ok' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
                Votre adresse e-mail est confirmée. Merci&nbsp;!
              </div>
              <a href="/" className="block text-center w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">Accéder à mon espace</a>
            </div>
          )}
          {state === 'error' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{error}</div>
              <a href="/" className="block text-center w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700">Retour à mon espace</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
