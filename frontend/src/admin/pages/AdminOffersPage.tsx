import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminOffersPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="offers" refreshConfig={refreshConfig} />;
}
