import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminTimelinePage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="timeline" refreshConfig={refreshConfig} />;
}
