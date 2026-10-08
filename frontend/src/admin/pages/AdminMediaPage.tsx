import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminMediaPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="media" refreshConfig={refreshConfig} />;
}
