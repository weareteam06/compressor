import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminNewsPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="news" refreshConfig={refreshConfig} />;
}
