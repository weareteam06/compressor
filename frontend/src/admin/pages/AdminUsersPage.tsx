import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminUsersPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="users" refreshConfig={refreshConfig} />;
}
