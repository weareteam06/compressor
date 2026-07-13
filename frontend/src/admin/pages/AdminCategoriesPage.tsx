import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminCategoriesPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="categories" refreshConfig={refreshConfig} />;
}
