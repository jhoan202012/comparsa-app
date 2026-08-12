import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  const { title, lyrics } = await request.json();
  const cookieStore = await cookies();
  const adminId = cookieStore.get('auth_user_id')?.value;
  
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.song.create({
    data: { title, lyrics }
  });

  return NextResponse.json({ success: true });
}
