import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';
import MetricCard from '../../components/ui/MetricCard';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';

async function getProjectData(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      testCases: true,
      runs: { include: { results: true }, orderBy: { executedAt: 'desc' }, take: 5 },
    },
  });
  if (!project) notFound();
  return project;
}

function calcMetrics(testCases: { status: string }[]) {
  const total = testCases.length;
  const executed = testCases.filter((tc) => tc.status !== 'not_run' && tc.status !== 'draft').length;
  const passed = testCases.filter((tc) => tc.status === 'pass').length;
  const failed = testCases.filter((tc) => tc.status === 'fail').length;
  const blocked = testCases.filter((tc) => tc.status === 'blocked').length;
  const coverage = total > 0 ? Math.round((executed / total) * 100) : 0;
  const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;
  return { total, executed, passed, failed, blocked, coverage, passRate };
}

export default async function ProjectDashboard({ params }: { params: { id: string } }) {
  const project = await getProjectData(params.id);
  const m = calcMetrics(project.testCases);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{project.description ?? 'Tidak ada deskripsi.'}</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Total test case" value={m.total} />
        <MetricCard label="Coverage" value={`${m.coverage}%`} valueClass="text-blue-600" sub={`${m.executed} dieksekusi`} />
        <MetricCard label="Pass rate" value={`${m.passRate}%`} valueClass="text-green-600" sub={`${m.passed} passed`} />
        <MetricCard label="Failed" value={m.failed} valueClass="text-red-600" sub={`${m.blocked} blocked`} />
      </div>

      {/* Progress bars */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 space-y-4">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progress eksekusi</h2>
        {m.total === 0 ? (
          <p className="text-sm text-gray-400">Belum ada test case. Tambahkan test case terlebih dahulu.</p>
        ) : (
          <>
            <ProgressBar value={m.coverage} color="bg-blue-500" label="Coverage (executed / total)" />
            <ProgressBar value={m.passRate} color="bg-green-500" label="Pass rate (passed / executed)" />
            <ProgressBar
              value={m.total > 0 ? Math.round((m.failed / m.total) * 100) : 0}
              color="bg-red-400"
              label="Fail rate (failed / total)"
            />
          </>
        )}
      </div>

      {/* Recent runs */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Execution run terbaru</h2>
        {project.runs.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada eksekusi yang dijalankan.</p>
        ) : (
          <div className="space-y-2">
            {project.runs.map((run) => {
              const total = run.results.length;
              const passed = run.results.filter((r) => r.outcome === 'pass').length;
              return (
                <div key={run.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{run.runName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{total} test · {passed} passed</p>
                  </div>
                  <StatusBadge status={passed === total && total > 0 ? 'pass' : 'fail'} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
