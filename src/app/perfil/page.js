import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import FormPerfil from './FormPerfil';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;

  if (!userId) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');

  // Galería de fotos oficiales de la comparsa para elegir como avatar
  const defaultAvatars = [
    '/images/634041989_1346800734148847_7655715541676484146_n.jpg',
    '/images/634076865_1346800880815499_5762101862002171797_n.jpg',
    '/images/634378036_1346802200815367_7429235445478519296_n.jpg',
    '/images/637900571_1346802750815312_4641331560730932914_n.jpg',
  ];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
        <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>← Volver</Link>
        <h2 style={{ fontSize: '1.5rem', margin: '0 auto', fontFamily: 'var(--font-playfair)', color: 'var(--text-primary)' }}>Mi Perfil</h2>
        <div style={{ width: '50px' }}></div>
      </div>

      <div className="glass-panel animate-fade-in">
        <FormPerfil user={user} defaultAvatars={defaultAvatars} />
      </div>
    </div>
  );
}
