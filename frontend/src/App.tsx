import { SiteConfigProvider, useSiteConfig } from '@/lib/siteConfig';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import { RequestProvider, useRequest } from '@/components/RequestModal';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { SiteConfig } from '@/lib/data';
import Navbar from '@/components/NavbarOverlay';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton';
import SeoHead from '@/components/SeoHead';
import HomePage from '@/components/HomePage';
import ProductsPage from '@/components/ProductsPage';
import ProductCategoryPage from '@/components/ProductCategoryPage';
import ProductDetailPage from '@/components/ProductDetailPage';
import AboutPages from '@/components/AboutPages';
import FirstAirInfoPages from '@/components/FirstAirInfoPages';
import IndustriesPage from '@/components/IndustriesPage';
import ServicesPage from '@/components/ServicesPage';
import NewsPage from '@/components/NewsPage';
import DistributorsPage from '@/components/DistributorsPage';
import ContactPage from '@/components/ContactPage';
import FaqPage from '@/components/FaqPage';
import LoginPage from '@/components/LoginPage';

const AdminDashboardPage = lazy(() => import('@/admin/pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/admin/pages/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('@/admin/pages/AdminProductsPage'));
const AdminBrochuresPage = lazy(() => import('@/admin/pages/AdminBrochuresPage'));
const AdminIndustriesPage = lazy(() => import('@/admin/pages/AdminIndustriesPage'));
const AdminServicesPage = lazy(() => import('@/admin/pages/AdminServicesPage'));
const AdminNewsPage = lazy(() => import('@/admin/pages/AdminNewsPage'));
const AdminTimelinePage = lazy(() => import('@/admin/pages/AdminTimelinePage'));
const AdminCareersPage = lazy(() => import('@/admin/pages/AdminCareersPage'));
const AdminDistributorsPage = lazy(() => import('@/admin/pages/AdminDistributorsPage'));
const AdminLeadsPage = lazy(() => import('@/admin/pages/AdminLeadsPage'));
const AdminMediaPage = lazy(() => import('@/admin/pages/AdminMediaPage'));
const AdminSettingsPage = lazy(() => import('@/admin/pages/AdminSettingsPage'));

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
  faq: '/faq',
  login: '/employee/login',
  'employee-login': '/employee/login',
  'admin-login': '/admin/login',
  'dealer-login': '/dealer/login',
  admin: '/admin/dashboard',
  about: '/about/story',
  'about-story': '/about/story',
  'about-timeline': '/about/timeline',
  'about-careers': '/about/careers',
};

function currentPageFromPath(pathname: string) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname === '/products') return 'products';
  if (pathname.startsWith('/products/category/')) return 'product-category';
  if (pathname.startsWith('/products/')) return 'product-detail';
  if (pathname === '/technical-information') return 'technical';
  if (pathname === '/warranty-information') return 'warranty';
  if (pathname === '/about/story') return 'about-story';
  if (pathname === '/about/timeline') return 'about-timeline';
  if (pathname === '/about/careers') return 'about-careers';
  if (pathname === '/industries') return 'industries';
  if (pathname.startsWith('/industries/')) return 'industry-detail';
  if (pathname === '/services') return 'services';
  if (pathname.startsWith('/services/')) return 'service-detail';
  if (pathname === '/news') return 'news';
  if (pathname.startsWith('/news/')) return 'news-detail';
  if (pathname === '/support') return 'support';
  if (pathname === '/distributors') return 'distributors';
  if (pathname === '/contact') return 'contact';
  if (pathname === '/faq') return 'faq';
  if (pathname === '/login' || pathname === '/admin/login' || pathname === '/employee/login' || pathname === '/dealer/login') return 'login';
  return 'home';
}
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        <span className="text-slate-500 font-medium">Loading...</span>
      </div>
    </div>
  );
}

function WebsiteLayout({ config, children }: { config: SiteConfig; children: React.ReactNode }) {
  const navigate = useNavigate();
  const openRequest = useRequest();
  const location = useLocation();
  const currentPage = currentPageFromPath(location.pathname);

  const navigatePage = (page: string, param?: string) => {
    if (page === 'request') { openRequest({ title: param || 'Request a Quote', type: param?.toLowerCase().includes('service') ? 'Service Request' : 'Quote Request' }); return; }
    let path = pagePaths[page];
    if (page === 'search') path = `/products?q=${encodeURIComponent(param || '')}`;
    if (page === 'products' && param) path = `/products?series=${encodeURIComponent(param)}`;
    if (page === 'product-category') path = `/products/category/${encodeURIComponent(param || '')}`;
    if (page === 'product-detail') path = `/products/${encodeURIComponent(param || '')}`;
    if (page === 'industry-detail') path = `/industries/${encodeURIComponent(param || '')}`;
    if (page === 'service-detail') path = `/services/${encodeURIComponent(param || '')}`;
    if (page === 'news-detail') path = `/news/${encodeURIComponent(param || '')}`;
    navigate(path || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-white flex flex-col ${currentPage === 'home' ? 'home-theme' : 'interior-theme'}`}>
      <SeoHead config={config} />
      <Navbar onNavigate={navigatePage} currentPage={currentPage} config={config} />
      <main className="flex-1">{children}</main>
      <Footer config={config} onNavigate={navigatePage} />
      <FloatingWhatsAppButton config={config} />
      <Chatbot config={config} onNavigate={navigatePage} />
    </div>
  );
}

function ProductCategoryRoute({ onNavigate, onViewProduct }: { onNavigate: (page: string, param?: string) => void; onViewProduct: (id: number | string) => void }) {
  const { slug = '' } = useParams();
  return <ProductCategoryPage slug={slug} onNavigate={onNavigate} onViewProduct={onViewProduct} />;
}

function ProductDetailRoute({ onNavigate, onContact }: { onNavigate: (page: string, param?: string) => void; onContact: (productModel: string) => void }) {
  const { id = '' } = useParams();
  return <ProductDetailPage productId={id} onNavigate={onNavigate} onContact={onContact} />;
}

function IndustryRoute({ onNavigate }: { onNavigate: (page: string, param?: string) => void }) {
  const { slug } = useParams();
  return <IndustriesPage slug={slug} onNavigate={onNavigate} />;
}

function ServiceRoute({ onNavigate }: { onNavigate: (page: string, param?: string) => void }) {
  const { slug } = useParams();
  return <ServicesPage slug={slug} onNavigate={onNavigate} />;
}

function NewsRoute({ onNavigate }: { onNavigate: (page: string, param?: string) => void }) {
  const { slug } = useParams();
  return <NewsPage slug={slug} onNavigate={onNavigate} />;
}

function AppRoutes() {
  const navigate = useNavigate();
  const openRequest = useRequest();
  const { config, refreshConfig } = useSiteConfig();

  const navigatePage = (page: string, param?: string) => {
    if (page === 'request') { openRequest({ title: param || 'Request a Quote', type: param?.toLowerCase().includes('service') ? 'Service Request' : 'Quote Request' }); return; }
    let path = pagePaths[page];
    if (page === 'search') path = `/products?q=${encodeURIComponent(param || '')}`;
    if (page === 'products' && param) path = `/products?series=${encodeURIComponent(param)}`;
    if (page === 'product-category') path = `/products/category/${encodeURIComponent(param || '')}`;
    if (page === 'product-detail') path = `/products/${encodeURIComponent(param || '')}`;
    if (page === 'industry-detail') path = `/industries/${encodeURIComponent(param || '')}`;
    if (page === 'service-detail') path = `/services/${encodeURIComponent(param || '')}`;
    if (page === 'news-detail') path = `/news/${encodeURIComponent(param || '')}`;
    navigate(path || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProduct = (id: number | string) => navigatePage('product-detail', String(id));
  const handleQuoteFromProduct = (productModel: string) => {
    openRequest({ product: productModel, source: 'Product Detail Quote' });
  };

  if (!config) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/employee/login" replace />} />
      <Route path="/admin/login" element={<LoginPage key="admin" portal="admin" onLoginSuccess={() => navigate('/admin/dashboard', { replace: true })} onBack={() => navigate('/')} />} />
      <Route path="/employee/login" element={<LoginPage key="employee" portal="employee" onLoginSuccess={() => navigate('/admin/dashboard', { replace: true })} onBack={() => navigate('/')} />} />
      <Route path="/dealer/login" element={<LoginPage key="dealer" portal="dealer" onLoginSuccess={() => navigate('/admin/leads', { replace: true })} onBack={() => navigate('/')} />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<Suspense fallback={<LoadingScreen />}><AdminDashboardPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/users" element={<Suspense fallback={<LoadingScreen />}><AdminUsersPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/categories" element={<Navigate to="/admin/products" replace />} />
      <Route path="/admin/products" element={<Suspense fallback={<LoadingScreen />}><AdminProductsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/brochures" element={<Suspense fallback={<LoadingScreen />}><AdminBrochuresPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/industries" element={<Suspense fallback={<LoadingScreen />}><AdminIndustriesPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/services" element={<Suspense fallback={<LoadingScreen />}><AdminServicesPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/news" element={<Suspense fallback={<LoadingScreen />}><AdminNewsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/timeline" element={<Suspense fallback={<LoadingScreen />}><AdminTimelinePage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/careers" element={<Suspense fallback={<LoadingScreen />}><AdminCareersPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/distributors" element={<Suspense fallback={<LoadingScreen />}><AdminDistributorsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/leads" element={<Suspense fallback={<LoadingScreen />}><AdminLeadsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/media" element={<Suspense fallback={<LoadingScreen />}><AdminMediaPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/settings" element={<Suspense fallback={<LoadingScreen />}><AdminSettingsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="*" element={
        <WebsiteLayout config={config}>
          <Routes>
            <Route path="/" element={<HomePage onNavigate={navigatePage} />} />
            <Route path="/products" element={<ProductsPage onNavigate={navigatePage} />} />
            <Route path="/products/category/:slug" element={<ProductCategoryRoute onNavigate={navigatePage} onViewProduct={handleViewProduct} />} />
            <Route path="/products/:id" element={<ProductDetailRoute onNavigate={navigatePage} onContact={handleQuoteFromProduct} />} />
            <Route path="/about" element={<Navigate to="/about/story" replace />} />
            <Route path="/about/story" element={<AboutPages config={config} page="about-story" onNavigate={navigatePage} />} />
            <Route path="/about/timeline" element={<AboutPages config={config} page="about-timeline" onNavigate={navigatePage} />} />
            <Route path="/about/careers" element={<AboutPages config={config} page="about-careers" onNavigate={navigatePage} />} />
            <Route path="/technical-information" element={<FirstAirInfoPages page="technical" config={config} onNavigate={navigatePage} />} />
            <Route path="/warranty-information" element={<FirstAirInfoPages page="warranty" config={config} onNavigate={navigatePage} />} />
            <Route path="/industries" element={<IndustriesPage onNavigate={navigatePage} />} />
            <Route path="/industries/:slug" element={<IndustryRoute onNavigate={navigatePage} />} />
            <Route path="/services" element={<ServicesPage onNavigate={navigatePage} />} />
            <Route path="/services/:slug" element={<ServiceRoute onNavigate={navigatePage} />} />
            <Route path="/news" element={<NewsPage onNavigate={navigatePage} />} />
            <Route path="/news/:slug" element={<NewsRoute onNavigate={navigatePage} />} />
            <Route path="/distributors" element={<DistributorsPage onNavigate={navigatePage} />} />
            <Route path="/support" element={<DistributorsPage onNavigate={navigatePage} />} />
            <Route path="/contact" element={<ContactPage config={config} />} />
            <Route path="/faq" element={<FaqPage onNavigate={navigatePage} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WebsiteLayout>
      } />
    </Routes>
  );
}

export default function App() { return <SiteConfigProvider><RequestProvider><AppRoutes /><CookieConsentBanner /></RequestProvider></SiteConfigProvider>; }
