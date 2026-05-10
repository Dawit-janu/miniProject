'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) { setError('Nama project wajib diisi.'); return; }

    setLoading(true);
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmedName, description: description.trim() || null }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data?.error || 'Gagal membuat project.');
      return;
    }

    setName('');
    setDescription('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="project-name">
          Nama project <span className="text-red-400">*</span>
        </label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: QA Sprint 12"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="project-desc">
          Deskripsi <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <textarea
          id="project-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan tujuan project QA ini..."
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-none bg-white"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600">Project berhasil dibuat!</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full text-sm bg-blue-600 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Menyimpan...' : 'Buat project'}
      </button>
    </form>
  );
}
