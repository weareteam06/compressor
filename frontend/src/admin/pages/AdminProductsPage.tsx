import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminProductsPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="products" refreshConfig={refreshConfig} />;
}
