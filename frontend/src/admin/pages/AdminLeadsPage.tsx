import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminLeadsPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="leads" refreshConfig={refreshConfig} />;
}
