'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GraduationCap, CheckCircle2, PenLine, Star, MessageSquare, ClipboardList } from 'lucide-react';
import { SURVEYS } from '@/lib/survey';
import { NEEDS_QUESTIONS } from '@/lib/positioning';

const cls = (...a) => a.filter(Boolean).join(' ');

function frDate(s) {
  if (!s) return '';
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString('fr-FR');
}

/* Pavé de signature manuscrite (souris + tactile). */
function SignaturePad({ onSave, onCancel, saving }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a';
  }, []);

  const pos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: (p.clientX - r.left) * (c.width / r.width), y: (p.clientY - r.top) * (c.height / r.height) };
  };
  const start = (e) => { e.preventDefault(); drawing.current = true; const ctx = canvasRef.current.getContext('2d'); const { x, y } = pos(e); ctx.beginPath(); ctx.moveTo(x, y); };
  const move = (e) => { if (!drawing.current) return; e.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const { x, y } = pos(e); ctx.lineTo(x, y); ctx.stroke(); setEmpty(false); };
  const end = () => { drawing.current = false; };

  const clear = () => { const c = canvasRef.current; c.getContext('2d').clearRect(0, 0, c.width, c.height); setEmpty(true); };
  const save = () => {
    if (empty) return;
    // Export en JPEG sur fond blanc (opaque) : fiable pour l'incrustation PDF.
    const src = canvasRef.current;
    const flat = document.createElement('canvas');
    flat.width = src.width; flat.height = src.height;
    const fx = flat.getContext('2d');
    fx.fillStyle = '#ffffff'; fx.fillRect(0, 0, flat.width, flat.height);
    fx.drawImage(src, 0, 0);
    onSave(flat.toDataURL('image/jpeg', 0.92));
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-slate-500">Signez dans le cadre ci-dessous avec votre doigt ou votre souris.</p>
      <canvas ref={canvasRef} width={600} height={200}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        className="w-full h-40 bg-white border-2 border-dashed border-slate-300 rounded-xl touch-none" />
      <div className="flex gap-2">
        <button onClick={clear} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Effacer</button>
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Annuler</button>
        <button onClick={save} disabled={empty || saving} className="flex-[2] py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">
          {saving ? 'Enregistrement…' : 'Valider ma signature'}
        </button>
      </div>
    </div>
  );
}

/* Questionnaire de satisfaction (notes 1-5 + commentaire). */
function SurveyForm({ kind, saving, onCancel, onSubmit }) {
  const survey = SURVEYS[kind];
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');
  const complete = survey.questions.every((q) => ratings[q.id]);

  return (
    <div className="mt-3 space-y-3">
      {survey.questions.map((q) => (
        <div key={q.id} className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-600 flex-1">{q.label}</span>
          <div className="flex gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRatings((r) => ({ ...r, [q.id]: n }))}>
                <Star className={cls('w-5 h-5', (ratings[q.id] || 0) >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200')} />
              </button>
            ))}
          </div>
        </div>
      ))}
      <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Un commentaire (facultatif)…"
        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 resize-none" />
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Annuler</button>
        <button onClick={() => onSubmit(ratings, comment)} disabled={!complete || saving}
          className="flex-[2] py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">
          {saving ? 'Envoi…' : 'Envoyer mon évaluation'}
        </button>
      </div>
    </div>
  );
}

/* Positionnement : analyse du besoin + test de niveau (QCM). */
function PositioningForm({ quiz, saving, onCancel, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const needsOk = NEEDS_QUESTIONS.filter((q) => q.required).every((q) => answers[q.id]);
  const quizOk = (quiz || []).every((_, i) => quizAnswers[i] !== undefined);
  const inp = 'w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700';

  return (
    <div className="mt-3 space-y-3">
      {NEEDS_QUESTIONS.map((q) => (
        <div key={q.id}>
          <label className="text-[11px] font-semibold text-slate-600">{q.label}{q.required && ' *'}</label>
          {q.type === 'choice' ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {q.options.map((opt) => (
                <button key={opt} type="button" onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                  className={cls('px-3 py-1.5 rounded-lg text-[11px] font-bold border', answers[q.id] === opt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200')}>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea rows={2} value={answers[q.id] || ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              className={cls(inp, 'mt-1 resize-none')} />
          )}
        </div>
      ))}

      {(quiz || []).length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Test de niveau</p>
          <div className="space-y-3">
            {quiz.map((item, i) => (
              <div key={i}>
                <p className="text-[11px] font-semibold text-slate-700">{i + 1}. {item.q}</p>
                <div className="mt-1 space-y-1">
                  {item.options.map((opt, j) => (
                    <button key={j} type="button" onClick={() => setQuizAnswers((a) => ({ ...a, [i]: j }))}
                      className={cls('w-full text-left px-3 py-1.5 rounded-lg text-[11px] border', quizAnswers[i] === j ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold' : 'bg-white border-slate-200 text-slate-600')}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">Annuler</button>
        <button onClick={() => onSubmit(answers, quiz.map((_, i) => quizAnswers[i]))} disabled={!needsOk || !quizOk || saving}
          className="flex-[2] py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">
          {saving ? 'Envoi…' : 'Valider mon positionnement'}
        </button>
      </div>
    </div>
  );
}

export default function PortailPage() {
  const [token, setToken] = useState('');
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [signing, setSigning] = useState(null); // { sessionId, slot } en cours de signature
  const [saving, setSaving] = useState(false);
  const [survey, setSurvey] = useState(null); // { sessionId, kind } en cours
  const [savingSurvey, setSavingSurvey] = useState(false);
  const [posOpen, setPosOpen] = useState(null); // sessionId dont le positionnement est ouvert
  const [savingPos, setSavingPos] = useState(false);

  const load = useCallback(async (tok) => {
    try {
      const r = await fetch(`/api/portal?token=${encodeURIComponent(tok)}`);
      const d = await r.json();
      if (!r.ok) { setStatus('error'); setError(d.error || 'Lien invalide.'); return; }
      setData(d); setStatus('ready');
    } catch (e) { setStatus('error'); setError(e.message); }
  }, []);

  useEffect(() => {
    const tok = new URLSearchParams(window.location.search).get('token') || '';
    if (!tok) { setStatus('error'); setError('Lien invalide (jeton manquant).'); return; }
    setToken(tok); load(tok);
  }, [load]);

  const submitSignature = async (sessionId, slot, signature) => {
    setSaving(true);
    try {
      const r = await fetch('/api/portal/sign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, sessionId, slot, signature }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error || 'Erreur lors de l’enregistrement.'); setSaving(false); return; }
      setSigning(null); setSaving(false);
      load(token);
    } catch (e) { alert(e.message); setSaving(false); }
  };

  const submitSurvey = async (sessionId, kind, ratings, comment) => {
    setSavingSurvey(true);
    try {
      const r = await fetch('/api/portal/survey', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, sessionId, kind, ratings, comment }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error || 'Erreur lors de l’enregistrement.'); setSavingSurvey(false); return; }
      setSurvey(null); setSavingSurvey(false);
      load(token);
    } catch (e) { alert(e.message); setSavingSurvey(false); }
  };

  const submitPositioning = async (sessionId, answers, quizAnswers) => {
    setSavingPos(true);
    try {
      const r = await fetch('/api/portal/positioning', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, sessionId, answers, quizAnswers }),
      });
      const d = await r.json();
      if (!r.ok) { alert(d.error || 'Erreur lors de l’enregistrement.'); setSavingPos(false); return; }
      setPosOpen(null); setSavingPos(false);
      load(token);
    } catch (e) { alert(e.message); setSavingPos(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-white" /></div>
          <div className="leading-none">
            <p className="text-base font-black text-slate-900 tracking-tight">Espace stagiaire</p>
            {data?.ofName && <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">{data.ofName}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {status === 'loading' && <p className="text-sm text-slate-400 text-center py-16">Chargement…</p>}
        {status === 'error' && (
          <div className="bg-white rounded-2xl border border-red-100 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-slate-400 mt-2">Contactez votre organisme de formation pour obtenir un nouveau lien.</p>
          </div>
        )}
        {status === 'ready' && data && (
          <>
            <h1 className="text-lg font-black text-slate-900">Bonjour {data.trainee?.first} 👋</h1>
            <p className="text-xs text-slate-500 mt-1 mb-5">Signez votre présence pour chaque formation ci-dessous.</p>

            {data.sessions.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-sm text-slate-400">
                Aucune formation ne vous est encore rattachée.
              </div>
            )}

            <div className="space-y-4">
              {data.sessions.map((s) => {
                const allSigned = s.total > 0 && s.signedCount >= s.total;
                return (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{s.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {[s.trainer, s.duration, s.modality].filter(Boolean).join(' · ')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {frDate(s.start_date)}{s.end_date && s.end_date !== s.start_date ? ` → ${frDate(s.end_date)}` : ''}
                      </p>
                    </div>
                    <span className={cls('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full shrink-0 border',
                      allSigned ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-50 border-slate-200')}>
                      {allSigned && <CheckCircle2 className="w-3.5 h-3.5" />} {s.signedCount}/{s.total} signée{s.total > 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2">Positionnement</p>
                  <div className={cls('rounded-xl border p-3', s.positioning && s.positioning.done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100')}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ClipboardList className={cls('w-4 h-4 shrink-0', s.positioning && s.positioning.done ? 'text-emerald-500' : 'text-slate-400')} />
                        <div className="min-w-0">
                          <p className={cls('text-xs font-semibold', s.positioning && s.positioning.done ? 'text-emerald-700' : 'text-slate-700')}>
                            Analyse du besoin{s.positioning && (s.positioning.quiz || []).length > 0 ? ' + test de niveau' : ''}
                          </p>
                          <p className="text-[10px] text-slate-400">À remplir avant la formation</p>
                        </div>
                      </div>
                      {s.positioning && s.positioning.done ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /> Rempli</span>
                      ) : posOpen !== s.id ? (
                        <button onClick={() => setPosOpen(s.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 shrink-0">Remplir</button>
                      ) : null}
                    </div>
                    {posOpen === s.id && (
                      <PositioningForm quiz={s.positioning ? s.positioning.quiz : []} saving={savingPos} onCancel={() => setPosOpen(null)} onSubmit={(a, qa) => submitPositioning(s.id, a, qa)} />
                    )}
                  </div>

                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-2">Émargement par demi-journée</p>
                  <div className="space-y-2">
                    {s.slots.map((sl) => (
                      <div key={sl.key} className={cls('rounded-xl border p-3', sl.signed ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100')}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={cls('text-xs font-semibold', sl.signed ? 'text-emerald-700' : 'text-slate-700')}>{sl.label}</span>
                          {sl.signed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> Signé</span>
                          ) : !(signing && signing.sessionId === s.id && signing.slot === sl.key) ? (
                            <button onClick={() => setSigning({ sessionId: s.id, slot: sl.key })}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700">
                              <PenLine className="w-3.5 h-3.5" /> Signer
                            </button>
                          ) : null}
                        </div>
                        {signing && signing.sessionId === s.id && signing.slot === sl.key && (
                          <div className="mt-3">
                            <SignaturePad saving={saving} onCancel={() => setSigning(null)} onSave={(sig) => submitSignature(s.id, sl.key, sig)} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-5 mb-2">Votre satisfaction</p>
                  <div className="space-y-2">
                    {['chaud', 'froid'].map((kind) => {
                      const done = s.surveys && s.surveys[kind];
                      const open = survey && survey.sessionId === s.id && survey.kind === kind;
                      return (
                        <div key={kind} className={cls('rounded-xl border p-3', done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100')}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <MessageSquare className={cls('w-4 h-4 shrink-0', done ? 'text-emerald-500' : 'text-slate-400')} />
                              <div className="min-w-0">
                                <p className={cls('text-xs font-semibold', done ? 'text-emerald-700' : 'text-slate-700')}>{SURVEYS[kind].title}</p>
                                <p className="text-[10px] text-slate-400">{SURVEYS[kind].subtitle}</p>
                              </div>
                            </div>
                            {done ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /> Répondu</span>
                            ) : !open ? (
                              <button onClick={() => setSurvey({ sessionId: s.id, kind })}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 shrink-0">Répondre</button>
                            ) : null}
                          </div>
                          {open && (
                            <SurveyForm kind={kind} saving={savingSurvey} onCancel={() => setSurvey(null)} onSubmit={(r, c) => submitSurvey(s.id, kind, r, c)} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-5 mb-2">Mes documents</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={`/api/portal/document?token=${encodeURIComponent(token)}&sessionId=${s.id}&tpl=attestation-fin&format=pdf`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700">
                      Certificat de réalisation (PDF)
                    </a>
                    <a href={`/api/portal/document?token=${encodeURIComponent(token)}&sessionId=${s.id}&tpl=programme&format=pdf`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold hover:border-emerald-300 hover:text-emerald-700">
                      Programme (PDF)
                    </a>
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
