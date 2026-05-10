import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string; tcId: string } }) {
  const body = await request.json();
  const { status } = body;
  const VALID = ['not_run', 'pass', 'fail', 'blocked', 'skip'];
  if (!VALID.includes(status)) return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });

  const testCase = await prisma.testCase.update({
    where: { id: params.tcId },
    data: { status },
  });
  return NextResponse.json(testCase);
}

export async function DELETE(_req: Request, { params }: { params: { id: string; tcId: string } }) {
  await prisma.testCase.delete({ where: { id: params.tcId } });
  return NextResponse.json({ ok: true });
}
