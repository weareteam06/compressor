import { useNavigate } from 'react-router-dom';
import AdminPanel, { type AdminTab } from '@/components/AdminPanel';
import LoginPage from '@/components/LoginPage';
import { clearAuthToken, getAuthToken } from '@/lib/data';

const pagePaths: Record<string, string> = {
  home: '/',
  products: '/products',
  technical: '/technical-information',
  warranty: '/warranty-information',
  industries: '/industries',
  services: '/services',
  news: '/news',
  distributors: '/distributors',
  support: '/support',
  contact: '/contact',
  login: '/login',
  admin: '/admin/dashboard',
  about: '/about/story',
  'about-story': '/about/story',
  'about-timeline': '/about/timeline',
  'about-careers': '/about/careers',
};

interface Props {
  tab: AdminTab;
  refreshConfig: () => void;
}

export default function AdminPageRoute({ tab, refreshConfig }: Props) {
  const navigate = useNavigate();

  if (!getAuthToken()) {
    return <LoginPage onLoginSuccess={() => navigate('/admin/dashboard')} onBack={() => navigate('/')} />;
  }

  return (
    <AdminPanel
      activeTab={tab}
      onTabChange={(nextTab) => navigate(`/admin/${nextTab}`)}
      onLogout={() => {
        clearAuthToken();
        refreshConfig();
        navigate('/');
      }}
      onNavigateFrontend={(page) => {
        refreshConfig();
        navigate(pagePaths[page] || '/');
      }}
    />
  );
}
