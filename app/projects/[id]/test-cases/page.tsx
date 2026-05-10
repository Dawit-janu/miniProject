'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2, X, ArrowUp, Minus, ArrowDown, Save, Check } from 'lucide-react';
import StatusBadge from '../../../components/ui/StatusBadge';

const MODULES = ['Auth', 'Produk', 'Cart', 'Upload', 'Notifikasi', 'Pembayaran', 'Profil', 'Lainnya'];
const PRIORITIES = [
  { key: 'high',   label: 'High',   icon: ArrowUp,   active: 'bg-red-50 border-red-200 text-red-700' },
  { key: 'medium', label: 'Medium', icon: Minus,      active: 'bg-amber-50 border-amber-200 text-amber-700' },
  { key: 'low',    label: 'Low',    icon: ArrowDown,  active: 'bg-green-50 border-green-200 text-green-700' },
];
const STATUSES = ['not_run', 'pass', 'fail', 'blocked', 'skip'];

type TestCase = {
  id: string; title: string; status: string;
  metadata: string; createdAt: string;
};

type Meta = {
  module?: string; priority?: string; precondition?: string;
  steps?: string[]; expected?: string; tags?: string[]; notes?: string;
};

const emptyForm = () => ({
  title: '', module: '', priority: 'medium',
  precondition: '', steps: ['', '', ''],
  expected: '', tags: [] as string[], notes: '',
});

export default function TestCasesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchTestCases = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/test-cases`);
    const data = await res.json();
    setTestCases(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchTestCases(); }, [fetchTestCases]);

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  function addStep() { set('steps', [...form.steps, '']); }
  function removeStep(i: number) { set('steps', form.steps.filter((_, idx) => idx !== i)); }
  function updateStep(i: number, val: string) {
    const s = [...form.steps]; s[i] = val; set('steps', s);
  }

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (!form.tags.includes(t)) set('tags', [...form.tags, t]);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && form.tags.length) set('tags', form.tags.slice(0, -1));
  }

  async function handleSubmit() {
    const errs: Record<string, string> = {};
    if (form.title.trim().length < 3) errs.title = 'Judul wajib diisi (min. 3 karakter)';
    if (!form.module) errs.module = 'Modul wajib dipilih';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    await fetch(`/api/projects/${projectId}/test-cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setForm(emptyForm());
    setTagInput('');
    setShowForm(false);
    fetchTestCases();
  }

  async function updateStatus(tcId: string, status: string) {
    await fetch(`/api/projects/${projectId}/test-cases/${tcId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchTestCases();
  }

  async function deleteTC(tcId: string) {
    if (!confirm('Hapus test case ini?')) return;
    await fetch(`/api/projects/${projectId}/test-cases/${tcId}`, { method: 'DELETE' });
    fetchTestCases();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Test Cases</h1>
          <p className="text-sm text-gray-400 mt-0.5">{testCases.length} test case terdaftar</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setErrors({}); }}
          className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} /> Tambah test case
        </button>
      </div>

      {/* Form tambah */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-xl mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Test case baru</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="px-5 py-5 space-y-4">

            {/* Judul */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Judul <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => { set('title', e.target.value); if (errors.title) setErrors(er => ({...er, title: ''})); }}
                placeholder="Contoh: Login dengan email valid"
                className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Modul + Prioritas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Modul <span className="text-red-400">*</span></label>
                <select
                  value={form.module}
                  onChange={e => { set('module', e.target.value); if (errors.module) setErrors(er => ({...er, module: ''})); }}
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 bg-white ${errors.module ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <option value="">Pilih modul...</option>
                  {MODULES.map(m => <option key={m}>{m}</option>)}
                </select>
                {errors.module && <p className="text-xs text-red-500 mt-1">{errors.module}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Prioritas</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(({ key, label, icon: Icon, active }) => (
                    <button
                      key={key}
                      onClick={() => set('priority', key)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${form.priority === key ? active : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      <Icon size={11} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Precondition */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Precondition</label>
              <input
                type="text"
                value={form.precondition}
                onChange={e => set('precondition', e.target.value)}
                placeholder="Kondisi sebelum test dijalankan..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Steps */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Langkah-langkah</label>
              <div className="space-y-2">
                {form.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                    <input
                      type="text"
                      value={step}
                      onChange={e => updateStep(i, e.target.value)}
                      placeholder={`Langkah ${i + 1}...`}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
                    />
                    <button onClick={() => removeStep(i)} className="text-gray-300 hover:text-red-400"><X size={13} /></button>
                  </div>
                ))}
              </div>
              <button onClick={addStep} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 mt-2">
                <Plus size={12} /> Tambah langkah
              </button>
            </div>

            {/* Expected */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Expected result</label>
              <textarea
                value={form.expected}
                onChange={e => set('expected', e.target.value)}
                placeholder="Hasil yang diharapkan setelah eksekusi..."
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags</label>
              <div
                className="flex flex-wrap gap-1.5 min-h-9 px-3 py-2 border border-gray-200 rounded-lg focus-within:border-blue-400 cursor-text"
                onClick={() => document.getElementById('tag-in')?.focus()}
              >
                {form.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {tag}
                    <button onClick={() => set('tags', form.tags.filter((_, idx) => idx !== i))}><X size={9} /></button>
                  </span>
                ))}
                <input id="tag-in" type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey} placeholder={form.tags.length === 0 ? 'Ketik lalu Enter...' : ''}
                  className="text-xs border-none outline-none bg-transparent min-w-16 flex-1" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Catatan</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Catatan tambahan..." rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
            <button onClick={() => setShowForm(false)} className="text-sm border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50">Batal</button>
            <button onClick={handleSubmit} disabled={saving || saved}
              className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {saved ? <><Check size={13} /> Tersimpan!</> : saving ? 'Menyimpan...' : <><Save size={13} /> Simpan</>}
            </button>
          </div>
        </div>
      )}

      {/* Tabel test case */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Memuat...</div>
        ) : testCases.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            Belum ada test case. Klik "Tambah test case" untuk mulai.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {['Judul', 'Modul', 'Prioritas', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {testCases.map(tc => {
                const meta: Meta = (() => { try { return JSON.parse(tc.metadata); } catch { return {}; } })();
                return (
                  <tr key={tc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{tc.title}</td>
                    <td className="px-4 py-3 text-gray-500">{meta.module ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium capitalize ${
                        meta.priority === 'high' ? 'text-red-600' :
                        meta.priority === 'low' ? 'text-green-600' : 'text-amber-600'
                      }`}>{meta.priority ?? 'medium'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={tc.status}
                        onChange={e => updateStatus(tc.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none bg-white"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteTC(tc.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
