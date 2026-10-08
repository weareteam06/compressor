import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { SiteConfig } from '@/lib/data';

interface SeoHeadProps {
  config: SiteConfig;
}

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.firstaircompressor.com').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/catalogs/FAS-15-250KW-cover.jpg`;

function humanize(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
    .trim();
}

function metaForPath(pathname: string, routeMeta: Record<string, { title: string; description: string; keywords: string }>) {
  if (routeMeta[pathname]) return routeMeta[pathname];

  if (pathname.startsWith('/products/category/')) {
    const category = humanize(decodeURIComponent(pathname.replace('/products/category/', '')));
    return {
      title: `${category} Compressors | firstAir Compressor`,
      description: `Explore ${category} compressor models from firstAir with product details, pressure, CFM, kW ratings, and brochures.`,
      keywords: `${category} compressor, firstAir ${category}, screw compressor category`,
    };
  }

  if (pathname.startsWith('/products/')) {
    const model = humanize(decodeURIComponent(pathname.replace('/products/', '')));
    return {
      title: `${model} Air Compressor | firstAir Compressor`,
      description: `View ${model} compressor details, technical specifications, product features, and brochure download from firstAir Compressor.`,
      keywords: `${model} compressor, ${model} brochure, firstAir ${model}, air compressor specifications`,
    };
  }

  if (pathname.startsWith('/industries/')) {
    const industry = humanize(decodeURIComponent(pathname.replace('/industries/', '')));
    return {
      title: `${industry} Air Compressor Solutions | firstAir Compressor`,
      description: `Review firstAir compressor solutions for ${industry} applications and industrial air requirements.`,
      keywords: `${industry} compressor, industrial air compressor, firstAir applications`,
    };
  }

  if (pathname.startsWith('/services/')) {
    const service = humanize(decodeURIComponent(pathname.replace('/services/', '')));
    return {
      title: `${service} | firstAir Compressor`,
      description: `Get firstAir support for ${service}, compressor maintenance, service planning, and product assistance.`,
      keywords: `${service}, compressor service, firstAir service support`,
    };
  }

  if (pathname.startsWith('/news/')) {
    const article = humanize(decodeURIComponent(pathname.replace('/news/', '')));
    return {
      title: `${article} | firstAir Compressor News`,
      description: `Read ${article} from firstAir Compressor news and updates.`,
      keywords: `firstAir news, compressor updates, ${article}`,
    };
  }

  return routeMeta['/'];
}

function setMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value));
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function setJsonLd(id: string, data: unknown) {
  let element = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

export default function SeoHead({ config }: SeoHeadProps) {
  const routeMeta = config.publicContent.routeMeta as Record<string, { title: string; description: string; keywords: string }>;
  const location = useLocation();

  const meta = useMemo(() => ({ ...metaForPath(location.pathname, routeMeta), ...(config.seo?.[location.pathname] || {}) }), [config.seo, routeMeta, location.pathname]);
  const canonicalPath = meta.canonicalPath || (location.pathname === '/' ? '/' : location.pathname);
  const canonical = `${SITE_URL}${canonicalPath}`;

  useEffect(() => {
    document.title = meta.title;
    setMeta('meta[name="description"]', { name: 'description', content: meta.description });
    setMeta('meta[name="keywords"]', { name: 'keywords', content: meta.keywords });
    setMeta('meta[name="robots"]', { name: 'robots', content: meta.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' });
    setMeta('meta[name="author"]', { name: 'author', content: config.company.name });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: config.company.name });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: meta.imageUrl || DEFAULT_IMAGE });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: meta.imageUrl || DEFAULT_IMAGE });
    setLink('canonical', canonical);

    setJsonLd('organization-schema', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: config.company.name,
      url: SITE_URL,
      logo: config.navigation?.logoUrl,
      description: config.about.storyShort,
      email: config.contact.email,
      telephone: config.contact.salesPhone,
      sameAs: Object.values(config.social || {}).filter(Boolean),
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: config.contact.salesPhone,
          contactType: 'sales',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi'],
        },
        {
          '@type': 'ContactPoint',
          telephone: config.contact.factoryPhone,
          contactType: 'customer support',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi'],
        },
      ],
    });

    setJsonLd('website-schema', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.company.name,
      url: SITE_URL,
      description: meta.description,
      inLanguage: 'en',
    });

    setJsonLd('faq-schema', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What products does firstAir Compressor offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'firstAir Compressor offers air cooled single stage rotary screw compressors, including FAS and FSG model ranges for industrial compressed air requirements.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can I get a compressor quote?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Use the contact form, WhatsApp contact button, or call ${config.contact.salesPhone} for product enquiries and quotations.`,
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download compressor brochures?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Product detail pages include brochure download forms. Submitted details are stored as CRM leads before the brochure opens.',
          },
        },
      ],
    });
  }, [canonical, config, meta]);

  return null;
}
