import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { avatarUrl } = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado en la base de datos' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
