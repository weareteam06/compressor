import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminDistributorsPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="distributors" refreshConfig={refreshConfig} />;
}
