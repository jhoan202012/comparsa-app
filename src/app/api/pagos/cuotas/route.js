import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    const { 
      title, 
      amount, 
      dueDate, 
      category = 'VESTUARIO', 
      targetGender = 'ALL',
      sizes = 'S, M, L, XL', 
      stock = 50 
    } = await request.json();

    if (!title || !amount) {
      return NextResponse.json({ error: 'Nombre del producto y precio son requeridos' }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: 'El precio debe ser un número mayor a 0' }, { status: 400 });
    }

    const numericStock = parseInt(stock) || 50;

    // Crear el producto / cuota en el catálogo de la tienda
    const fee = await prisma.paymentFee.create({
      data: {
        title: title.trim(),
        amount: numericAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        category,
        targetGender,
        sizes: sizes.trim() || 'Única',
        stock: numericStock
      }
    });

    return NextResponse.json({ success: true, fee });
  } catch (error) {
    console.error('Error al publicar producto en catálogo:', error);
    return NextResponse.json({ error: 'Error al publicar producto en la tienda' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('auth_user_id')?.value;

    if (!adminId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Se requieren permisos de administrador' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const feeId = searchParams.get('id');

    if (!feeId) {
      return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 });
    }

    // Eliminar registros asociados y el producto
    await prisma.paymentRecord.deleteMany({ where: { feeId } });
    await prisma.paymentFee.delete({ where: { id: feeId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json({ error: 'Error al eliminar producto de la tienda' }, { status: 500 });
  }
}
