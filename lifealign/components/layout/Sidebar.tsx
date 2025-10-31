'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useObjectiveContext } from '@/contexts/ObjectiveContext';

export function Sidebar() {
  const pathname = usePathname();
  const { objectives } = useObjectiveContext();

  const activeObjectives = objectives.filter((obj) => obj.status === 'ACTIVE');

  const isActive = (path: string) => pathname === path;

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">LifeAlign</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          <Link
            href="/today"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive('/today')
                ? 'bg-blue-50 text-brand-blue'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-3">📅</span>
            Today
            {isActive('/today') && (
              <span className="ml-auto bg-brand-blue text-white px-2 py-1 rounded-full text-xs">
                6
              </span>
            )}
          </Link>

          <Link
            href="/all"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive('/all') ? 'bg-blue-50 text-brand-blue' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-3">📋</span>
            All Tasks
          </Link>

          <Link
            href="/inbox"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive('/inbox')
                ? 'bg-blue-50 text-brand-blue'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-3">📥</span>
            Inbox
            <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
              3
            </span>
          </Link>
        </div>

        {/* Objectives Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Objectives
            </h3>
            <Link
              href="/objectives"
              className="text-brand-blue hover:text-blue-700 text-lg font-bold"
            >
              +
            </Link>
          </div>

          <div className="space-y-1">
            {activeObjectives.map((objective) => (
              <Link
                key={objective.id}
                href={`/objectives/${objective.id}`}
                className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                  pathname === `/objectives/${objective.id}`
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-sm mr-3"
                  style={{ backgroundColor: objective.color }}
                />
                <span className="flex-1 text-gray-700 truncate">{objective.title}</span>
                <span className="text-xs text-gray-500">{objective.taskCount || 0}</span>
              </Link>
            ))}

            {activeObjectives.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 italic">
                No active objectives
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue font-semibold">
              JD
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-700">John Doe</p>
            <Link href="/settings" className="text-xs text-gray-500 hover:text-gray-700">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
