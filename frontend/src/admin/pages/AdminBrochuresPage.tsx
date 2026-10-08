import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminBrochuresPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="brochures" refreshConfig={refreshConfig} />;
}
