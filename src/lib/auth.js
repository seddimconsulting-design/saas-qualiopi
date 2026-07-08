import { SignJWT, jwtVerify } from 'jose';

export const COOKIE = 'session';
const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'dev-secret-change-me-in-prod'
);

export const genId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1e6)}`;

/* Signe un jeton de session (7 jours). */
export async function createToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

/* Lit la session depuis les cookies de la requête (route handlers). */
export async function getSession(req) {
  const token = req.cookies.get(COOKIE)?.value;
  return verifyToken(token);
}

/* Options du cookie de session (secure en prod uniquement). */
export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}
