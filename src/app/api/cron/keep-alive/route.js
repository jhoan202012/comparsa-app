import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Consulta ligera a Supabase para reiniciar el contador de inactividad de 7 días
    const count = await prisma.user.count();
    return NextResponse.json({
      success: true,
      message: 'Supabase ping exitoso para mantener la BD activa',
      timestamp: new Date().toISOString(),
      userCount: count
    });
  } catch (error) {
    console.error('Error en keep-alive cron:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
