import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('auth_user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { newPin } = await request.json();

    if (!newPin || newPin.trim().length === 0) {
      return NextResponse.json({ error: 'Ingresa una contraseña o PIN válido' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { pin: newPin.trim() }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    return NextResponse.json({ error: 'No se pudo actualizar la contraseña' }, { status: 500 });
  }
}
