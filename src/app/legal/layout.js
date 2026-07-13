import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { COMPANY } from './company';

export const metadata = {
  title: 'Informations légales — Certivia',
};

const LINKS = [
  { href: '/legal/mentions-legales', label: 'Mentions légales' },
  { href: '/legal/confidentialite', label: 'Confidentialité' },
  { href: '/legal/cgu', label: 'CGU' },
];

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      <header className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-black text-slate-900 tracking-tight">Certivia</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">← Retour au site</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full px-5 py-4 flex flex-wrap gap-2 border-b border-slate-50">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition">
            {l.label}
          </Link>
        ))}
      </div>

      <main className="max-w-3xl mx-auto w-full px-5 py-10 flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Certivia</span>
          <span>Dernière mise à jour : {COMPANY.updatedAt}</span>
        </div>
      </footer>
    </div>
  );
}
