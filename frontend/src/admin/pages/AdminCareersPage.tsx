import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminCareersPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="careers" refreshConfig={refreshConfig} />;
}
