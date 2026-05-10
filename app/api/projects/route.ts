import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : null;

  if (!name) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: null,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
