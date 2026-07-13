import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminDashboardPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="dashboard" refreshConfig={refreshConfig} />;
}
