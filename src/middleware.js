import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'dev-secret-change-me-in-prod'
);

async function isAuthed(token) {
  if (!token) return false;
  try { await jwtVerify(token, secret); return true; } catch { return false; }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('session')?.value;
  const authed = await isAuthed(token);

  // Routes d'auth + page de réinitialisation + portail stagiaire : toujours ouvertes
  if (pathname.startsWith('/api/auth')) return NextResponse.next();
  if (pathname.startsWith('/api/portal')) return NextResponse.next();
  if (pathname.startsWith('/api/cron')) return NextResponse.next();
  if (pathname === '/api/billing/webhook') return NextResponse.next();
  if (pathname === '/reset') return NextResponse.next();

  // Autres API : authentification requise
  if (pathname.startsWith('/api')) {
    return authed ? NextResponse.next() : NextResponse.json({ error: 'non authentifié' }, { status: 401 });
  }

  // Page de connexion : rediriger vers l'app si déjà connecté
  if (pathname === '/login') {
    return authed ? NextResponse.redirect(new URL('/', req.url)) : NextResponse.next();
  }

  // Page racine : publique. Le composant serveur affiche la landing (visiteur)
  // ou l'application (utilisateur connecté).
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/reset', '/api/:path*'],
};
