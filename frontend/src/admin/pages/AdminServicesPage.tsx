import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminServicesPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="services" refreshConfig={refreshConfig} />;
}
