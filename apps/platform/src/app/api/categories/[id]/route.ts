import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateCategorySchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/categories/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryData = await prisma.category.findUnique({
      where: { id },
    });

    if (!categoryData) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }


    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

// PATCH /api/categories/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const data = updateCategorySchema.parse(body);

    const updateData: any = { ...data };
    

    const categoryData = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

