import { prisma } from '../../../../lib/prisma';
import { notFound } from 'next/navigation';
import ProgressBar from '../../../components/ui/ProgressBar';

async function getReportData(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { testCases: true },
  });
  if (!project) notFound();
  return project;
}

type Meta = { module?: string; priority?: string };

function calcMetrics(testCases: { status: string; metadata: string }[]) {
  const total = testCases.length;
  const executed = testCases.filter(tc => tc.status !== 'not_run').length;
  const passed   = testCases.filter(tc => tc.status === 'pass').length;
  const failed   = testCases.filter(tc => tc.status === 'fail').length;
  const blocked  = testCases.filter(tc => tc.status === 'blocked').length;
  const skipped  = testCases.filter(tc => tc.status === 'skip').length;
  const coverage = total > 0 ? Math.round((executed / total) * 100) : 0;
  const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;
  return { total, executed, passed, failed, blocked, skipped, coverage, passRate };
}

function calcByModule(testCases: { status: string; metadata: string }[]) {
  const map: Record<string, { status: string }[]> = {};
  testCases.forEach(tc => {
    const meta: Meta = (() => { try { return JSON.parse(tc.metadata); } catch { return {}; } })();
    const mod = meta.module ?? 'Lainnya';
    if (!map[mod]) map[mod] = [];
    map[mod].push(tc);
  });
  return Object.entries(map).map(([module, tcs]) => ({
    module,
    ...calcMetrics(tcs as { status: string; metadata: string }[]),
  }));
}

const coverageColor = (v: number) =>
  v >= 80 ? 'text-green-600' : v >= 50 ? 'text-amber-600' : 'text-red-600';

export default async function ReportsPage({ params }: { params: { id: string } }) {
  const project = await getReportData(params.id);
  const m = calcMetrics(project.testCases);
  const byModule = calcByModule(project.testCases);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-400 mt-0.5">Summary untuk dibagikan ke stakeholder</p>
        </div>
        {/* Export buttons — akan diimplementasi berikutnya */}
        <div className="flex gap-2">
          <button className="text-sm border border-gray-200 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-50 transition-colors">
            Export Excel
          </button>
          <button className="text-sm border border-gray-200 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-50 transition-colors">
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Ringkasan project</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {[
                { label: 'Total test case',  value: m.total,                     cls: 'text-gray-900 font-semibold' },
                { label: 'Executed',         value: `${m.executed} (${m.coverage}%)`, cls: 'text-blue-600 font-medium' },
                { label: 'Passed',           value: `${m.passed} (${m.passRate}%)`,   cls: 'text-green-600 font-medium' },
                { label: 'Failed',           value: m.failed,                    cls: 'text-red-600 font-medium' },
                { label: 'Blocked',          value: m.blocked,                   cls: 'text-orange-600 font-medium' },
                { label: 'Skipped',          value: m.skipped,                   cls: 'text-yellow-600 font-medium' },
                { label: 'Not run',          value: m.total - m.executed,        cls: 'text-gray-500 font-medium' },
              ].map(row => (
                <tr key={row.label}>
                  <td className="py-2.5 text-gray-400 text-xs">{row.label}</td>
                  <td className={`py-2.5 text-right text-sm ${row.cls}`}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Progress */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Progress eksekusi</h2>
          {m.total === 0 ? (
            <p className="text-sm text-gray-400">Belum ada test case.</p>
          ) : (
            <div className="space-y-4">
              <ProgressBar value={m.coverage} color="bg-blue-500" label="Coverage (executed / total)" />
              <ProgressBar value={m.passRate} color="bg-green-500" label="Pass rate (passed / executed)" />
              <ProgressBar
                value={m.total > 0 ? Math.round((m.failed / m.total) * 100) : 0}
                color="bg-red-400"
                label="Fail rate (failed / total)"
              />
              <ProgressBar
                value={m.total > 0 ? Math.round((m.blocked / m.total) * 100) : 0}
                color="bg-orange-400"
                label="Blocked rate"
              />
            </div>
          )}
        </div>
      </div>

      {/* Breakdown per modul */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Breakdown per modul</h2>
        </div>
        {byModule.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">Belum ada test case dengan modul.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {['Modul', 'Total', 'Executed', 'Pass', 'Fail', 'Blocked', 'Coverage', 'Pass rate'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byModule.map(row => (
                <tr key={row.module} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.module}</td>
                  <td className="px-4 py-3 text-gray-600">{row.total}</td>
                  <td className="px-4 py-3 text-gray-600">{row.executed}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{row.passed}</td>
                  <td className="px-4 py-3 text-red-600 font-medium">{row.failed}</td>
                  <td className="px-4 py-3 text-orange-600 font-medium">{row.blocked}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${coverageColor(row.coverage)}`}>{row.coverage}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${coverageColor(row.passRate)}`}>{row.passRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
