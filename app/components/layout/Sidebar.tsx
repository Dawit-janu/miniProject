'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Play,
  BarChart2,
  FolderKanban,
  Settings,
  ChevronLeft,
} from 'lucide-react';

interface SidebarProps {
  projectId?: string;
  projectName?: string;
}

export default function Sidebar({ projectId, projectName }: SidebarProps) {
  const pathname = usePathname();

  const projectNavItems = [
    { href: `/projects/${projectId}`,              icon: LayoutDashboard, label: 'Dashboard' },
    { href: `/projects/${projectId}/test-cases`,   icon: ClipboardList,   label: 'Test Cases' },
    { href: `/projects/${projectId}/execute`,      icon: Play,            label: 'Eksekusi' },
    { href: `/projects/${projectId}/reports`,      icon: BarChart2,       label: 'Reports' },
  ];

  const isActive = (href: string) => {
    if (href === `/projects/${projectId}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 bg-white h-screen sticky top-0 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">QA Tracker</p>
        {projectName ? (
          <p className="text-sm font-semibold text-gray-900 truncate">{projectName}</p>
        ) : (
          <p className="text-sm font-semibold text-gray-900">Projects</p>
        )}
      </div>

      {/* Back to projects (kalau sedang di dalam project) */}
      {projectId && (
        <div className="px-3 pt-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={13} />
            Semua project
          </Link>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {projectId ? (
          projectNavItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(href)
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))
        ) : (
          <Link
            href="/"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === '/' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FolderKanban size={15} />
            Semua Project
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-100">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Settings size={15} />
          Pengaturan
        </Link>
      </div>
    </aside>
  );
}
