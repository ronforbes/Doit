import { TaskProvider } from '@/contexts/TaskContext';
import { ObjectiveProvider } from '@/contexts/ObjectiveContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TaskProvider>
      <ObjectiveProvider>
        <div className="h-screen flex overflow-hidden bg-gray-50">
          {/* Sidebar for desktop */}
          <Sidebar />

          {/* Main content */}
          <div className="flex-1 flex flex-col lg:ml-64">
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
              {children}
            </main>
          </div>

          {/* Mobile bottom navigation */}
          <MobileNav />
        </div>
      </ObjectiveProvider>
    </TaskProvider>
  );
}
