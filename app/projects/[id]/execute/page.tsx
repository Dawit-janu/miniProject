'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Check, Filter } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';

type TestCase = {
  id: string;
  title: string;
  status: string;
  metadata: string;
};

type Meta = { module?: string; priority?: string };

const STATUSES = ['not_run', 'pass', 'fail', 'blocked', 'skip'];
const STATUS_LABEL: Record<string, string> = {
  not_run: 'Not Run', pass: 'Pass', fail: 'Fail', blocked: 'Blocked', skip: 'Skip',
};

export default function ExecutePage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [filterStatus, setFilterStatus] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTestCases = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/test-cases`);
    const data = await res.json();
    setTestCases(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchTestCases(); }, [fetchTestCases]);

  async function saveStatus(tcId: string) {
    const status = pending[tcId];
    if (!status) return;
    setSaving(s => ({ ...s, [tcId]: true }));
    await fetch(`/api/projects/${projectId}/test-cases/${tcId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setSaving(s => ({ ...s, [tcId]: false }));
    setSaved(s => ({ ...s, [tcId]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [tcId]: false })), 2000);
    setTestCases(tc => tc.map(t => t.id === tcId ? { ...t, status } : t));
    setPending(p => { const n = { ...p }; delete n[tcId]; return n; });
  }

  async function bulkSave() {
    const ids = Object.keys(pending);
    if (ids.length === 0) return;
    await Promise.all(ids.map(id => saveStatus(id)));
    fetchTestCases();
  }

  const modules = [...new Set(testCases.map(tc => {
    try { return JSON.parse(tc.metadata)?.module; } catch { return null; }
  }).filter(Boolean))] as string[];

  const filtered = testCases.filter(tc => {
    const meta: Meta = (() => { try { return JSON.parse(tc.metadata); } catch { return {}; } })();
    const matchStatus = filterStatus === '' || tc.status === filterStatus;
    const matchModule = filterModule === '' || meta.module === filterModule;
    return matchStatus && matchModule;
  });

  const pendingCount = Object.keys(pending).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Eksekusi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Update status test case satu per satu</p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={bulkSave}
            className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check size={14} /> Simpan semua ({pendingCount})
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-5 p-3 bg-white border border-gray-100 rounded-xl">
        <Filter size={14} className="text-gray-400 shrink-0" />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white"
        >
          <option value="">Semua status</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select
          value={filterModule}
          onChange={e => setFilterModule(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white"
        >
          <option value="">Semua modul</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} test case</span>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-12">Memuat...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-12 bg-white border border-gray-100 rounded-xl">
          Tidak ada test case yang sesuai filter.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tc => {
            const meta: Meta = (() => { try { return JSON.parse(tc.metadata); } catch { return {}; } })();
            const currentStatus = pending[tc.id] ?? tc.status;
            const isDirty = pending[tc.id] !== undefined;
            const isSaving = saving[tc.id];
            const isSaved = saved[tc.id];

            return (
              <div
                key={tc.id}
                className={`flex items-center gap-4 p-4 bg-white border rounded-xl transition-all ${isDirty ? 'border-blue-200 shadow-sm' : 'border-gray-100'}`}
              >
                {/* Status indicator */}
                <div className="shrink-0">
                  <StatusBadge status={tc.status} />
                </div>

                {/* Title + module */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tc.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{meta.module ?? '-'} · {meta.priority ?? 'medium'}</p>
                </div>

                {/* Status selector */}
                <select
                  value={currentStatus}
                  onChange={e => setPending(p => ({ ...p, [tc.id]: e.target.value }))}
                  className={`text-sm border rounded-lg px-3 py-1.5 focus:outline-none bg-white transition-colors ${isDirty ? 'border-blue-400 text-blue-700' : 'border-gray-200'}`}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>

                {/* Save button */}
                <button
                  onClick={() => saveStatus(tc.id)}
                  disabled={!isDirty || isSaving}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                    isSaved ? 'bg-green-50 border-green-200 text-green-600' :
                    isDirty ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' :
                    'border-gray-200 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {isSaved ? <Check size={14} /> : isSaving ? '...' : 'Simpan'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
