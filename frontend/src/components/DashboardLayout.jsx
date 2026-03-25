import { Sidebar } from './Dashboard';

export default function DashboardLayout({ children, active }) {
  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar active={active} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
