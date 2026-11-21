import { AdminDashboard } from '@/components/AdminDashboard';

export function AdminDashboardShell({ isOwner }: { isOwner: boolean }) {
  return <main className="admin"><AdminDashboard isOwner={isOwner}/></main>;
}
