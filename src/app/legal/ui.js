/* Petits composants de mise en forme pour les pages légales (style homogène). */
export const H1 = ({ children }) => (
  <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">{children}</h1>
);
export const Lead = ({ children }) => (
  <p className="text-sm text-slate-400 mb-8">{children}</p>
);
export const H2 = ({ children }) => (
  <h2 className="text-lg font-extrabold text-slate-900 mt-8 mb-3">{children}</h2>
);
export const P = ({ children }) => (
  <p className="text-sm text-slate-600 leading-relaxed mb-3">{children}</p>
);
export const UL = ({ children }) => (
  <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 leading-relaxed mb-3">{children}</ul>
);
export const Note = ({ children }) => (
  <div className="my-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">{children}</div>
);
