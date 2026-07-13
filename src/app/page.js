import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import AppClient from './AppClient';
import Landing from './Landing';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const token = cookies().get('session')?.value;
  const session = await verifyToken(token);
  // Visiteur non connecté : page d'accueil marketing. Connecté : l'application.
  if (!session) return <Landing />;
  return <AppClient />;
}
