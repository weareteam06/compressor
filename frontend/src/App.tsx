import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { SiteConfig } from '@/lib/data';
import { getSiteConfig } from '@/lib/data';
import Navbar from '@/components/Navbar';
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
import LoginPage from '@/components/LoginPage';

const AdminDashboardPage = lazy(() => import('@/admin/pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/admin/pages/AdminUsersPage'));
const AdminCategoriesPage = lazy(() => import('@/admin/pages/AdminCategoriesPage'));
const AdminProductsPage = lazy(() => import('@/admin/pages/AdminProductsPage'));
const AdminIndustriesPage = lazy(() => import('@/admin/pages/AdminIndustriesPage'));
const AdminServicesPage = lazy(() => import('@/admin/pages/AdminServicesPage'));
const AdminNewsPage = lazy(() => import('@/admin/pages/AdminNewsPage'));
const AdminTimelinePage = lazy(() => import('@/admin/pages/AdminTimelinePage'));
const AdminCareersPage = lazy(() => import('@/admin/pages/AdminCareersPage'));
const AdminDistributorsPage = lazy(() => import('@/admin/pages/AdminDistributorsPage'));
const AdminLeadsPage = lazy(() => import('@/admin/pages/AdminLeadsPage'));
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
  login: '/login',
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
  if (pathname === '/login') return 'login';
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
  const location = useLocation();
  const currentPage = currentPageFromPath(location.pathname);

  const navigatePage = (page: string, param?: string) => {
    let path = pagePaths[page];
    if (page === 'product-category') path = `/products/category/${encodeURIComponent(param || '')}`;
    if (page === 'product-detail') path = `/products/${encodeURIComponent(param || '')}`;
    if (page === 'industry-detail') path = `/industries/${encodeURIComponent(param || '')}`;
    if (page === 'service-detail') path = `/services/${encodeURIComponent(param || '')}`;
    if (page === 'news-detail') path = `/news/${encodeURIComponent(param || '')}`;
    navigate(path || '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SeoHead config={config} />
      <Navbar onNavigate={navigatePage} currentPage={currentPage} salesPhone={config.contact.salesPhone} />
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

export default function App() {
  const navigate = useNavigate();
  const [quoteProduct, setQuoteProduct] = useState<string>('');
  const [config, setConfig] = useState<SiteConfig | null>(null);

  const refreshConfig = useCallback(() => {
    getSiteConfig().then(setConfig);
  }, []);

  useEffect(() => { refreshConfig(); }, [refreshConfig]);

  const navigatePage = (page: string, param?: string) => {
    let path = pagePaths[page];
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
    setQuoteProduct(productModel);
    navigatePage('contact');
  };

  if (!config) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLoginSuccess={() => navigate('/admin/dashboard')} onBack={() => navigate('/')} />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<Suspense fallback={<LoadingScreen />}><AdminDashboardPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/users" element={<Suspense fallback={<LoadingScreen />}><AdminUsersPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/categories" element={<Suspense fallback={<LoadingScreen />}><AdminCategoriesPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/products" element={<Suspense fallback={<LoadingScreen />}><AdminProductsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/industries" element={<Suspense fallback={<LoadingScreen />}><AdminIndustriesPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/services" element={<Suspense fallback={<LoadingScreen />}><AdminServicesPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/news" element={<Suspense fallback={<LoadingScreen />}><AdminNewsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/timeline" element={<Suspense fallback={<LoadingScreen />}><AdminTimelinePage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/careers" element={<Suspense fallback={<LoadingScreen />}><AdminCareersPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/distributors" element={<Suspense fallback={<LoadingScreen />}><AdminDistributorsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/leads" element={<Suspense fallback={<LoadingScreen />}><AdminLeadsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/settings" element={<Suspense fallback={<LoadingScreen />}><AdminSettingsPage refreshConfig={refreshConfig} /></Suspense>} />
      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="*" element={
        <WebsiteLayout config={config}>
          <Routes>
            <Route path="/" element={<HomePage onNavigate={navigatePage} onViewProduct={handleViewProduct} />} />
            <Route path="/products" element={<ProductsPage onNavigate={navigatePage} />} />
            <Route path="/products/category/:slug" element={<ProductCategoryRoute onNavigate={navigatePage} onViewProduct={handleViewProduct} />} />
            <Route path="/products/:id" element={<ProductDetailRoute onNavigate={navigatePage} onContact={handleQuoteFromProduct} />} />
            <Route path="/about" element={<Navigate to="/about/story" replace />} />
            <Route path="/about/story" element={<FirstAirInfoPages page="about" config={config} onNavigate={navigatePage} />} />
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
            <Route path="/contact" element={<ContactPage config={config} preselectedProduct={quoteProduct} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WebsiteLayout>
      } />
    </Routes>
  );
}
