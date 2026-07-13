import AdminPageRoute from '@/admin/AdminPageRoute';

export default function AdminSettingsPage({ refreshConfig }: { refreshConfig: () => void }) {
  return <AdminPageRoute tab="settings" refreshConfig={refreshConfig} />;
}
