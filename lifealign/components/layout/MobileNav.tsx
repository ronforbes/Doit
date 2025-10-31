'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/today"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/today') ? 'text-brand-blue' : 'text-gray-500'
          }`}
        >
          <span className="text-xl mb-1">📅</span>
          <span className="text-xs font-semibold">Today</span>
        </Link>

        <Link
          href="/all"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/all') ? 'text-brand-blue' : 'text-gray-500'
          }`}
        >
          <span className="text-xl mb-1">📋</span>
          <span className="text-xs">All</span>
        </Link>

        <Link
          href="/objectives"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/objectives') || pathname.startsWith('/objectives/')
              ? 'text-brand-blue'
              : 'text-gray-500'
          }`}
        >
          <span className="text-xl mb-1">🎯</span>
          <span className="text-xs">Goals</span>
        </Link>

        <Link
          href="/inbox"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive('/inbox') ? 'text-brand-blue' : 'text-gray-500'
          }`}
        >
          <span className="text-xl mb-1">📥</span>
          <span className="text-xs">Inbox</span>
        </Link>
      </div>
    </div>
  );
}
