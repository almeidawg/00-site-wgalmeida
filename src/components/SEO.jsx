import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { getSEOConfig } from '@/data/seoConfig';
import { COMPANY } from '@/data/company';

const BASE_URL = 'https://wgalmeida.com.br';

function toAbsoluteUrl(value) {
  if (!value || typeof value !== 'string') return value;
  try {
    return new URL(value, BASE_URL).toString();
  } catch {
    return value;
  }
}

function getImageMimeType(image) {
  const source = String(image || '').split('?')[0].toLowerCase();
  if (source.endsWith('.webp')) return 'image/webp';
  if (source.endsWith('.png')) return 'image/png';
  if (source.endsWith('.gif')) return 'image/gif';
  if (source.endsWith('.avif')) return 'image/avif';
  return 'image/jpeg';
}

/**
 * Componente SEO - gerencia meta tags, canonical e JSON-LD por rota.
 * Compatível com o uso antigo (title/description/url) e com a nova
 * configuração centralizada (pathname).
 */

/**
 * Gera BreadcrumbList JSON-LD a partir do pathname.
 * Ex: /blog/etapas-reforma => Home > Blog > Etapas Reforma
 */
function buildBreadcrumbs(pathname) {
  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const items = [{ name: 'Home', url: `${BASE_URL}/` }];

  const labelMap = {
    sobre: 'Sobre', processo: 'Processo', projetos: 'Projetos',
    blog: 'Blog', store: 'Loja', arquitetura: 'Arquitetura',
    engenharia: 'Engenharia', marcenaria: 'Marcenaria', contato: 'Contato',
    depoimentos: 'Depoimentos', faq: 'FAQ', 'a-marca': 'A Marca',
    'solicite-proposta': 'Solicite Proposta',
  };

  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const label = labelMap[seg] || seg.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    items.push({ name: label, url: `${BASE_URL}${path}` });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function SEO({
  pathname = '/',
  schema = null,
  title,
  description,
  keywords,
  url,
  canonical,
  og = {},
  twitter = {},
  robots,
  noindex = false,
  lang = 'pt-BR',
  alternates = []
}) {
  const normalizePathname = (input = '/') => {
    let value = input || '/';
    if (!value.startsWith('/')) value = `/${value}`;
    value = value.replace(/\/{2,}/g, '/');
    if (value.length > 1 && value.endsWith('/')) value = value.slice(0, -1);
    return value;
  };

  const resolvePathname = () => {
    if (pathname && pathname !== '/') return pathname;
    if (!url) return pathname || '/';
    try {
      const parsed = new URL(url);
      return parsed.pathname || '/';
    } catch {
      return pathname || '/';
    }
  };

  const resolvedPathname = normalizePathname(resolvePathname());
  const config = getSEOConfig(resolvedPathname);
  const resolvedCanonical = toAbsoluteUrl(canonical || url || config.canonical || `${BASE_URL}${resolvedPathname}`);
  const resolvedTitle = title || config.title;
  const resolvedDescription = description || config.description;
  const resolvedOgImage = toAbsoluteUrl(og.image || config.og?.image);
  const resolvedTwitterImage = toAbsoluteUrl(twitter.image || resolvedOgImage || config.twitter?.image);

  const meta = {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : (keywords || ''),
    canonical: resolvedCanonical,
    robots: noindex ? 'noindex, nofollow' : robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    og: {
      ...config.og,
      title: resolvedTitle,
      description: resolvedDescription,
      url: resolvedCanonical,
      ...og,
      image: resolvedOgImage,
      type: og.type || config.og?.type || 'website',
    },
    twitter: {
      ...config.twitter,
      title: resolvedTitle,
      description: resolvedDescription,
      ...twitter,
      image: resolvedTwitterImage,
    }
  };

  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : [];

  // Adiciona BreadcrumbList automaticamente se pathname tem segmentos
  if (resolvedPathname !== '/') {
    schemas.push(buildBreadcrumbs(resolvedPathname));
  }

  useEffect(() => {
    const syncMeta = (selector, attributes) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      const target = nodes[0] || document.createElement('meta');
      Object.entries(attributes).forEach(([name, value]) => {
        target.setAttribute(name, value);
      });
      if (!nodes.length) document.head.appendChild(target);
      nodes.slice(1).forEach((node) => node.parentNode?.removeChild(node));
    };

    document.title = meta.title;
    syncMeta('meta[name="description"]', { name: 'description', content: meta.description });
    if (meta.keywords) {
      syncMeta('meta[name="keywords"]', { name: 'keywords', content: meta.keywords });
    }
    syncMeta('meta[property="og:type"]', { property: 'og:type', content: meta.og.type });
    syncMeta('meta[property="og:title"]', { property: 'og:title', content: meta.og.title });
    syncMeta('meta[property="og:description"]', { property: 'og:description', content: meta.og.description });
    syncMeta('meta[property="og:image"]', { property: 'og:image', content: meta.og.image });
    syncMeta('meta[property="og:image:type"]', { property: 'og:image:type', content: getImageMimeType(meta.og.image) });
    syncMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.twitter.title });
    syncMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.twitter.description });
    syncMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: meta.twitter.image });
  }, [
    meta.description,
    meta.keywords,
    meta.og.description,
    meta.og.image,
    meta.og.title,
    meta.og.type,
    meta.title,
    meta.twitter.description,
    meta.twitter.image,
    meta.twitter.title,
  ]);

  return (
    <Helmet>
      <html lang={lang} />

      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {meta.keywords && <meta name="keywords" content={meta.keywords} />}
      <meta name="robots" content={meta.robots} />

      <link rel="canonical" href={meta.canonical} />

      {/* hreflang alternates para conteúdo multilingual */}
      {alternates.map(({ hrefLang, href }) => (
        <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />
      ))}
      {alternates.length > 0 && (
        <link rel="alternate" hrefLang="x-default" href={meta.canonical} />
      )}

      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="language" content="Portuguese" />
      <meta httpEquiv="content-language" content="pt-BR" />
      <meta name="author" content="Grupo WG Almeida" />
      <meta name="contact" content={COMPANY.email} />
      <meta name="theme-color" content="#1a1a1a" />

      {/* Open Graph */}
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:type" content={meta.og.type} />
      <meta property="og:title" content={meta.og.title} />
      <meta property="og:description" content={meta.og.description} />
      <meta property="og:image" content={meta.og.image} />
      <meta property="og:image:alt" content={meta.og.title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content={getImageMimeType(meta.og.image)} />
      <meta property="og:url" content={meta.og.url} />
      <meta property="og:site_name" content="Grupo WG Almeida" />

      {/* Twitter */}
      <meta name="twitter:card" content={meta.twitter.card || 'summary_large_image'} />
      <meta name="twitter:title" content={meta.twitter.title} />
      <meta name="twitter:description" content={meta.twitter.description} />
      <meta name="twitter:image" content={meta.twitter.image} />
      <meta name="twitter:image:alt" content={meta.twitter.title} />

      {/* JSON-LD */}
      {schemas.map((item, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}

      {/* DNS-prefetch para trackers carregados sob demanda */}
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </Helmet>
  );
}

// Mantém compatibilidade com imports default existentes
export default SEO;

// Helpers antigos preservados para compatibilidade com páginas que os utilizam
export const schemas = {
  service: (name, description, url) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    provider: {
      '@type': 'Organization',
      name: 'Grupo WG Almeida',
      url: 'https://wgalmeida.com.br'
    },
    areaServed: {
      '@type': 'City',
      name: 'São Paulo'
    }
  }),

  localBusiness: (neighborhood = 'São Paulo') => {
    const safeNeighborhood = String(neighborhood || 'São Paulo');

    return ({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `Arquitetura Alto Padrão ${safeNeighborhood} - Grupo WG Almeida`,
    description: `Serviços de arquitetura, engenharia e marcenaria de alto padrão em ${safeNeighborhood}, São Paulo.`,
    url: `https://wgalmeida.com.br/${safeNeighborhood
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-')}`,
    telephone: COMPANY.phoneRaw,
    email: COMPANY.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR'
    },
    areaServed: {
      '@type': 'Neighborhood',
      name: safeNeighborhood,
      containedInPlace: {
        '@type': 'City',
        name: 'São Paulo'
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '50'
    }
  });
  },

  article: (title, description, url, datePublished, image) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: toAbsoluteUrl(url),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toAbsoluteUrl(url)
    },
    datePublished,
    dateModified: datePublished,
    image: Array.isArray(image) ? image.filter(Boolean).map(toAbsoluteUrl) : toAbsoluteUrl(image),
    author: {
      '@type': 'Organization',
      name: 'Grupo WG Almeida'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Grupo WG Almeida',
      logo: {
        '@type': 'ImageObject',
        url: 'https://wgalmeida.com.br/images/logo-192.webp'
      }
    }
  }),

  project: (name, description, url, image) => ({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    description,
    url: toAbsoluteUrl(url),
    image: Array.isArray(image) ? image.filter(Boolean).map(toAbsoluteUrl) : toAbsoluteUrl(image),
    creator: {
      '@type': 'Organization',
      name: 'Grupo WG Almeida',
      url: BASE_URL
    },
    publisher: {
      '@type': 'Organization',
      name: 'Grupo WG Almeida',
      url: BASE_URL
    }
  }),

  faq: (questions) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  })
};
