import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminIndustriesPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="industries" refreshConfig={refreshConfig} />;
}
