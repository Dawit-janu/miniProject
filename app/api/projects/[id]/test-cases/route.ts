import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const testCases = await prisma.testCase.findMany({
    where: { projectId: params.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(testCases);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { title, module: mod, priority = 'medium', precondition, steps, expected, tags, notes } = body;

  if (!title?.trim()) return NextResponse.json({ error: 'Judul wajib diisi.' }, { status: 400 });

  const metadata = JSON.stringify({ module: mod, priority, precondition, steps, expected, tags, notes });

  const testCase = await prisma.testCase.create({
    data: {
      projectId: params.id,
      title: title.trim(),
      status: 'not_run',
      metadata,
    },
  });

  return NextResponse.json(testCase, { status: 201 });
}
