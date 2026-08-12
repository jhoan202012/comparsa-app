import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import BottomNav from '@/components/BottomNav';
import ThemeToggle from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata = {
  title: 'Carnaval Ayacuchano 2027',
  description: 'Gestión inteligente para comparsas del Carnaval de Ayacucho',
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth_user_id')?.value;
  let userRole = null;
  
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      userRole = user.role;
    }
  }

  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <main>{children}</main>
        <ThemeToggle />
        <BottomNav userRole={userRole} />
      </body>
    </html>
  );
}
