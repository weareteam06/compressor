import { Navigate, useNavigate } from 'react-router-dom';
import AdminPanel, { type AdminTab } from '@/components/AdminPanel';
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
  login: '/employee/login',
  'employee-login': '/employee/login',
  'dealer-login': '/dealer/login',
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
  const savedLoginPath = localStorage.getItem('compressor_login_path');
  const loginPath = savedLoginPath && ['/admin/login', '/employee/login', '/dealer/login'].includes(savedLoginPath)
    ? savedLoginPath : '/admin/login';

  if (!getAuthToken()) {
    return <Navigate to={loginPath} replace />;
  }

  return (
    <AdminPanel
      activeTab={tab}
      onTabChange={(nextTab) => navigate(`/admin/${nextTab}`)}
      onLogout={() => {
        clearAuthToken();
        refreshConfig();
        navigate(loginPath, { replace: true });
      }}
      onNavigateFrontend={(page) => {
        refreshConfig();
        navigate(pagePaths[page] || '/');
      }}
    />
  );
}
