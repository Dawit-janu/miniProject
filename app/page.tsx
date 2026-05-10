import { prisma } from '../lib/prisma';
import CreateProjectForm from './components/create-project-form';

async function getProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">QA Reporting</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">Project List</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Halaman awal untuk melihat daftar proyek dan membuat project baru.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-10 xl:grid-cols-[1.6fr_1fr]">
          <section className="space-y-4">
            {projects.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-600">
                Belum ada project. Buat project baru dengan form di samping.
              </div>
            ) : (
              projects.map((project) => (
                <article key={project.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">{project.name}</h2>
                      <p className="mt-2 text-slate-600">{project.description ?? 'Tidak ada deskripsi.'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      Draft
                    </span>
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="mb-6 border-b border-slate-200 pb-4">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Create Project</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Tambah Project Baru</h2>
            </div>
            <CreateProjectForm />
          </aside>
        </div>
      </div>
    </main>
  );
}
