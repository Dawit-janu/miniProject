import Link from 'next/link';
import { prisma } from '../lib/prisma';
import Sidebar from './components/layout/Sidebar';
import CreateProjectForm from './components/create-project-form';
import { FolderKanban, Plus, ClipboardList } from 'lucide-react';

async function getProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { testCases: true, runs: true } } },
  });
}

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Semua Project</h1>
              <p className="text-sm text-gray-500 mt-0.5">{projects.length} project terdaftar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Project list */}
            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <FolderKanban size={32} className="text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">Belum ada project.</p>
                  <p className="text-xs text-gray-400 mt-1">Buat project baru dengan form di samping.</p>
                </div>
              ) : (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {project.name}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {project.description ?? 'Tidak ada deskripsi.'}
                        </p>
                      </div>
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 shrink-0">
                        Draft
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <ClipboardList size={12} />
                        {project._count.testCases} test case
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        {project._count.runs} run
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Create form */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 h-fit">
              <div className="flex items-center gap-2 mb-4">
                <Plus size={15} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">Tambah project baru</h2>
              </div>
              <CreateProjectForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
