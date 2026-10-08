import { validateSiteConfig } from './configValidation';
import { resolveApiUrls } from './apiUrls';
import type { PublicContent } from './publicContent';

export interface ProductCategory {
  id: number;
  legacyId?: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  icon: string;
  imageUrl: string;
  external?: boolean;
  externalUrl?: string;
  features: string[];
  applications: string[];
  order: number;
}

export interface Product {
  id: number | string;
  legacyId?: string;
  categoryId: number | string;
  model: string;
  name: string;
  series: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  powerHp: number;
  powerKw: number;
  pressureMin: number;
  pressureMax: number;
  flowRateCfm: string;
  flowRateM3Min: string;
  motorPower?: string;
  motorType?: string;
  coolingMethod?: string;
  voltage?: string;
  frequency?: string;
  noiseLevel?: string;
  dimensions?: string;
  weight?: string;
  categorySlugs?: string[];
  features: string[];
  benefits?: string[];
  imageUrls?: string[];
  specifications: { label: string; value: string }[];
  applications: string[];
  brochureUrl?: string;
  datasheetUrl?: string;
}

export interface Industry {
  id: number;
  legacyId?: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  imageAlt?: string;
  challengeIntro?: string;
  solutionIntro?: string;
  applications: string[];
  benefits?: string[];
  recommendedProducts: string[];
  challenges: { title: string; solution: string }[];
  order?: number;
}

export interface Service {
  id: number;
  legacyId?: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  imageUrl: string;
  imageAlt?: string;
  serviceScope?: string;
  benefits: string[];
  process: { step: number; title: string; description: string }[];
  order?: number;
}

export interface NewsArticle {
  id: number;
  legacyId?: string;
  slug: string;
  title: string;
  category: 'Press' | 'Events' | 'Blog' | 'Announcement';
  date: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  featured: boolean;
}

export interface TimelineEvent {
  id: number;
  legacyId?: string;
  year: number;
  title: string;
  description: string;
}

export interface JobOpening {
  id: number;
  legacyId?: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  requirements: string[];
  postedDate: string;
  status: 'Open' | 'Closed';
}

export interface Distributor {
  id: number;
  legacyId?: string;
  name: string;
  region: 'North' | 'South' | 'East' | 'West' | 'Central';
  contactPerson: string;
  designation: string;
  city: string;
  state: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  authorizedProducts: string[];
  status: 'Active' | 'Inactive';
}

export interface Lead {
  id: number;
  leadNumber?: string;
  date: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  productOfInterest?: string;
  industry?: string;
  type: 'Quote Request' | 'Service Request' | 'General Inquiry' | 'Distributor Inquiry' | 'Career';
  source?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  message: string;
  status: 'New' | 'Assigned' | 'Contacted' | 'Quoted' | 'Qualified' | 'Won' | 'Lost' | 'Closed';
  followUpDate?: string;
  assignedUserId?: number;
  assignedDistributorId?: number;
  notes: string;
  assignedTo?: string;
  requiredPressure?: string;
  requiredFad?: string;
  operatingHours?: string;
  currentCompressor?: string;
  application?: string;
  location?: string;
  requirementDetails?: string;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'DEALER' | 'DISTRIBUTOR';

export interface UserAccount {
  id: number;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  distributorId?: number;
  active: boolean;
}

export type UserPayload = Omit<UserAccount, 'id'> & { password?: string };

export interface MediaAsset {
  id: number;
  url: string;
  storageKey: string;
  fileName: string;
  contentType: string;
  mediaType: 'image' | 'video' | 'document';
  sizeBytes: number;
  altText: string;
  usageType: string;
}

export interface SiteConfig {
  publicContent: PublicContent;
  pageContent?: Record<string, Record<string, unknown>>;
  seo?: Record<string, { title: string; description: string; keywords?: string; imageUrl?: string; canonicalPath?: string; noIndex?: boolean }>;
  navigation?: {
    logoUrl: string;
    logoAlt: string;
    languageLabel: string;
    menuLabel: string;
    loginLabel: string;
    searchLabel: string;
    callLabel: string;
    requestQuoteLabel: string;
    requestQuotePage: string;
    items: NavigationItem[];
  };
  company: {
    name: string;
    tagline: string;
    foundedYear: number;
    yearsOfExcellence: number;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    secondaryCta: string;
  };
  home?: {
    heroVideoUrl: string;
    heroShowcaseImageUrl: string;
    heroShowcaseAlt: string;
    heroEyebrow: string;
    heroFeatures: string[];
    powerRange: string;
    pressureRange: string;
    rangeTitle: string;
    rangeIntro: string;
    whyTitle: string;
    whyIntro: string;
    industriesTitle: string;
    industriesIntro: string;
    serviceTitle: string;
    serviceIntro: string;
    serviceCardTitle: string;
    serviceCardText: string;
    aboutTitle: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    heroMetricLabels: string[];
    showcaseEyebrow: string;
    showcaseTitle: string;
    familyCards: { series: string; label: string; title: string; description: string }[];
    rangeEyebrow: string;
    modelsLabel: string;
    viewSeriesLabel: string;
    viewAllProductsLabel: string;
    whyEyebrow: string;
    benefits: { title: string; description: string }[];
    industriesEyebrow: string;
    industryLinkLabel: string;
    serviceEyebrow: string;
    serviceItems: string[];
    servicesButton: string;
    callSalesButton: string;
    aboutEyebrow: string;
    yearsLabel: string;
    motorValue: string;
    motorLabel: string;
    industryValue: string;
    industryText: string;
    aboutButton: string;
    solutionCards: { id: string; title: string; description: string; imageUrl: string; imageAlt: string; page?: string; param?: string; url?: string; external?: boolean; active?: boolean }[];
    energyEyebrow: string;
    energyTitle: string;
    energyIntro: string;
    energyText: string;
    energyHighlights: string[];
    energyCta: string;
    recommendationEyebrow: string;
    recommendationTitle: string;
    recommendationText: string;
    recommendationButton: string;
    recommendationSuccessTitle: string;
    recommendationSuccessText: string;
    recommendationLabels: Record<string, string>;
    serviceSectionCta: string;
    serviceCards: { title: string; description: string }[];
    statistics: { value: string; label: string; verified: boolean; active?: boolean }[];
    customerLogosEyebrow: string;
    customerLogosTitle: string;
    customerLogos: { name: string; imageUrl: string; imageAlt: string; url?: string; approved: boolean; active?: boolean }[];
    industriesLimit: number;
  };
  about: {
    storyShort: string;
    storyLong: string;
    mission: string;
    vision: string;
    heroEyebrow?: string;
    heroTitle?: string;
    heroIntro?: string;
    heroImageUrl?: string;
    heroImageAlt?: string;
    highlights?: { title: string; description: string; active?: boolean }[];
    statistics?: { value: string; label: string; verified: boolean; active?: boolean }[];
  };
  contact: {
    factoryPhone: string;
    salesPhone: string;
    email: string;
    headquarters: {
      name: string;
      address: string;
    };
    regionalOffices: {
      region: string;
      address: string;
      contactPerson: string;
      designation: string;
      phone: string;
      email: string;
    }[];
  };
  social: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
  };
  pages?: {
    technical?: {
      eyebrow: string;
      title: string;
      intro: string;
      points: string[];
    };
    warranty?: {
      eyebrow: string;
      title: string;
      intro: string;
      points: string[];
    };
  };
}

export interface NavigationItem {
  id: string;
  label: string;
  page?: string;
  param?: string;
  url?: string;
  external?: boolean;
  active?: boolean;
  children?: NavigationItem[];
}

export interface LoginResult {
  success: boolean;
  token: string;
  userId: number;
  username: string;
  displayName: string;
  role: UserRole;
  distributorId?: number;
}

export interface ChatbotLink {
  label: string;
  page: string;
  param?: string;
}

export interface ChatbotAnswer {
  answer: string;
  links: ChatbotLink[];
}

export interface ChatbotHistoryItem {
  role: 'bot' | 'user';
  text: string;
}

export interface ChatbotStatus {
  configured: boolean;
  model: string;
}

export interface CmsAudit {
  siteSections: { sectionKey: string; active: boolean; displayOrder: number; updatedBy: string; updatedAt?: string; fieldCount: number }[];
  inactive: Record<string, number>;
  mediaMissingAltText: number;
  generatedAt: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const AUTH_TOKEN_KEY = 'compressor_auth_token';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  // An expired admin session must not prevent public content from loading.
  const token = path.startsWith('/admin/') || path === '/auth/me' ? getAuthToken() : null;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (options.signal?.aborted) abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  const timeout = window.setTimeout(abort, path === '/site-config' ? 15000 : 60000);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (response.status === 404 && /^\/(products|product-categories|industries|services|news)\/[^/]+$/.test(path)) return undefined as T;
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `API request failed: ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return resolveApiUrls(await response.json() as T, API_BASE_URL);
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

const jsonBody = (body: unknown) => JSON.stringify(body);

export async function getSiteConfig(signal?: AbortSignal): Promise<SiteConfig> {
  const config = await api<SiteConfig>('/site-config', { signal });
  validateSiteConfig(config);
  return config;
}

export function getMediaAssets(): Promise<MediaAsset[]> {
  return api<MediaAsset[]>('/images');
}

export function getProductCategories(): Promise<ProductCategory[]> {
  return api('/product-categories');
}

export function getProductCategoryBySlug(slug: string): Promise<ProductCategory | undefined> {
  return api(`/product-categories/${encodeURIComponent(slug)}`);
}

export function getProducts(categoryId?: number | string): Promise<Product[]> {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return api<Product[]>(`/products${query}`);
}

export function getProductById(id: number | string): Promise<Product | undefined> {
  return api<Product | undefined>(`/products/${encodeURIComponent(id)}`);
}

export async function getIndustries(): Promise<Industry[]> {
  const [industries, media] = await Promise.all([
    api<Industry[]>('/industries'),
    api<MediaAsset[]>('/images'),
  ]);
  return industries.map(industry => withIndustryMedia(industry, media));
}

export async function getIndustryBySlug(slug: string): Promise<Industry | undefined> {
  const [stored, media] = await Promise.all([
    api<Industry | undefined>(`/industries/${encodeURIComponent(slug)}`),
    api<MediaAsset[]>('/images'),
  ]);
  return stored ? withIndustryMedia(stored, media) : undefined;
}

function withIndustryMedia(industry: Industry, media: MediaAsset[]): Industry {
  const mediaSlug = industry.slug === 'manufacturing' ? 'general-manufacturing' : industry.slug;
  const expectedKey = `industry-${mediaSlug}.`;
  const asset = media.find(item => item.usageType === 'industries' && item.storageKey?.startsWith(expectedKey));
  return asset ? { ...industry, imageUrl: asset.url } : industry;
}

export function getServices(): Promise<Service[]> {
  return api('/services');
}

export function getServiceBySlug(slug: string): Promise<Service | undefined> {
  return api(`/services/${encodeURIComponent(slug)}`);
}

export function getNewsArticles(): Promise<NewsArticle[]> {
  return api('/news');
}

export function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  return api(`/news/${encodeURIComponent(slug)}`);
}

export function getTimeline(): Promise<TimelineEvent[]> {
  return api('/timeline');
}

export function getJobOpenings(): Promise<JobOpening[]> {
  return api('/jobs');
}

export function getDistributors(): Promise<Distributor[]> {
  return api('/distributors');
}

export function submitLead(leadData: Omit<Lead, 'id' | 'date' | 'status' | 'notes'>): Promise<Lead> {
  return api('/leads', { method: 'POST', body: jsonBody(leadData) });
}

export function askChatbot(question: string, history: ChatbotHistoryItem[]): Promise<ChatbotAnswer> {
  return api('/chatbot', { method: 'POST', body: jsonBody({ question, history }) });
}

export function getChatbotStatus(): Promise<ChatbotStatus> {
  return api('/chatbot/status');
}

export function loginAdmin(username: string, password: string): Promise<LoginResult> {
  return api('/auth/login', { method: 'POST', body: jsonBody({ username, password }) });
}

export function getCurrentUser(): Promise<UserAccount> {
  return api('/auth/me');
}

export function adminGetCategories() {
  return api<ProductCategory[]>('/admin/categories');
}

export function adminCreateCategory(data: Omit<ProductCategory, 'id'>) {
  return api<ProductCategory>('/admin/categories', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateCategory(id: number | string, updates: Partial<ProductCategory>) {
  return api<ProductCategory | undefined>(`/admin/categories/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteCategory(id: number | string) {
  return api<{ success: boolean }>(`/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetProducts() {
  return api<Product[]>('/admin/products');
}

export function adminCreateProduct(data: Omit<Product, 'id'>) {
  return api<Product>('/admin/products', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateProduct(id: number | string, updates: Partial<Product>) {
  return api<Product | undefined>(`/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteProduct(id: number | string) {
  return api<{ success: boolean }>(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetMedia() {
  return api<MediaAsset[]>('/admin/images');
}

export async function adminUploadMedia(file: File, altText = '', usageType = 'general') {
  const body = new FormData();
  body.append('file', file);
  body.append('altText', altText);
  body.append('usageType', usageType);
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/admin/media/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  if (!response.ok) throw new Error(await response.text() || `Upload failed: ${response.status}`);
  return response.json() as Promise<MediaAsset>;
}

export function adminDeleteMedia(id: number | string) {
  return api<{ success: boolean }>(`/admin/images/${id}`, { method: 'DELETE' }).then(result => result.success);
}

export function adminGetIndustries() {
  return api<Industry[]>('/admin/industries');
}

export function adminCreateIndustry(data: Omit<Industry, 'id'>) {
  return api<Industry>('/admin/industries', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateIndustry(id: number | string, updates: Partial<Industry>) {
  return api<Industry | undefined>(`/admin/industries/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteIndustry(id: number | string) {
  return api<{ success: boolean }>(`/admin/industries/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetServices() {
  return api<Service[]>('/admin/services');
}

export function adminCreateService(data: Omit<Service, 'id'>) {
  return api<Service>('/admin/services', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateService(id: number | string, updates: Partial<Service>) {
  return api<Service | undefined>(`/admin/services/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteService(id: number | string) {
  return api<{ success: boolean }>(`/admin/services/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetNews() {
  return api<NewsArticle[]>('/admin/news');
}

export function adminCreateNews(data: Omit<NewsArticle, 'id'>) {
  return api<NewsArticle>('/admin/news', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateNews(id: number | string, updates: Partial<NewsArticle>) {
  return api<NewsArticle | undefined>(`/admin/news/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteNews(id: number | string) {
  return api<{ success: boolean }>(`/admin/news/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetTimeline() {
  return api<TimelineEvent[]>('/admin/timeline');
}

export function adminCreateTimelineEvent(data: Omit<TimelineEvent, 'id'>) {
  return api<TimelineEvent>('/admin/timeline', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateTimelineEvent(id: number | string, updates: Partial<TimelineEvent>) {
  return api<TimelineEvent | undefined>(`/admin/timeline/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteTimelineEvent(id: number | string) {
  return api<{ success: boolean }>(`/admin/timeline/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetJobs() {
  return api<JobOpening[]>('/admin/jobs');
}

export function adminCreateJob(data: Omit<JobOpening, 'id'>) {
  return api<JobOpening>('/admin/jobs', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateJob(id: number | string, updates: Partial<JobOpening>) {
  return api<JobOpening | undefined>(`/admin/jobs/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteJob(id: number | string) {
  return api<{ success: boolean }>(`/admin/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetDistributors() {
  return api<Distributor[]>('/admin/distributors');
}

export function adminCreateDistributor(data: Omit<Distributor, 'id'>) {
  return api<Distributor>('/admin/distributors', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateDistributor(id: number | string, updates: Partial<Distributor>) {
  return api<Distributor | undefined>(`/admin/distributors/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteDistributor(id: number | string) {
  return api<{ success: boolean }>(`/admin/distributors/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetLeads() {
  return api<Lead[]>('/admin/leads');
}

export function adminUpdateLead(id: number | string, updates: Partial<Lead>) {
  return api<Lead | undefined>(`/admin/leads/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteLead(id: number | string) {
  return api<{ success: boolean }>(`/admin/leads/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminGetUsers() {
  return api<UserAccount[]>('/admin/users');
}

export function adminCreateUser(data: UserPayload) {
  return api<UserAccount>('/admin/users', { method: 'POST', body: jsonBody(data) });
}

export function adminUpdateUser(id: number | string, updates: Partial<UserPayload>) {
  return api<UserAccount>(`/admin/users/${encodeURIComponent(id)}`, { method: 'PUT', body: jsonBody(updates) });
}

export function adminDeleteUser(id: number | string) {
  return api<{ success: boolean }>(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(r => r.success);
}

export function adminUpdateSiteConfig(updates: Partial<SiteConfig>) {
  return api<SiteConfig>('/admin/site-config', { method: 'PUT', body: jsonBody(updates) });
}

export function adminGetCmsAudit() {
  return api<CmsAudit>('/admin/cms-audit');
}
