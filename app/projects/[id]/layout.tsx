import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import Sidebar from '../../components/layout/Sidebar';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar projectId={project.id} projectName={project.name} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
