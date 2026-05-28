import fs from "node:fs";
import path from "node:path";
import { SEO_CONFIG, getSEOConfig } from "./src/data/seoConfig.js";
import { getCloudinaryBlogImage } from "./src/data/blogImageManifest.js";
import { getBlogImageUrl } from "./src/data/blogImageManifest.js";
import { getCloudinaryStyleImage } from "./src/data/styleImageManifest.js";

const BASE_URL = "https://wgalmeida.com.br";
const STYLE_BANNERS = [
  "/images/banners/foto-obra-1.jpg",
  "/images/banners/foto-obra-2.jpg",
  "/images/banners/foto-obra-3.jpg",
  "/images/banners/foto-obra-4.jpg",
  "/images/banners/foto-obra-5.jpg",
  "/images/banners/foto-obra-6.jpg",
  "/images/banners/foto-obra-7.jpg",
  "/images/banners/ARQ.webp",
  "/images/banners/ENGENHARIA.webp",
  "/images/banners/MARCENARIA.webp",
];
/** Parse YAML frontmatter from markdown string */
function parseFrontmatterSimple(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result = {};
  for (const line of yaml.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/);
    if (m) result[m[1]] = m[2].trim();
  }
  return result;
}

function getStyleCoverPath(slug) {
  let hash = 0;

  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }

  return STYLE_BANNERS[hash % STYLE_BANNERS.length];
}
/** Get SEO config for a blog article from its markdown file */
function getBlogArticleSEO(slug) {
  const mdPath = path.join(process.cwd(), "src", "content", "blog", `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;
  const raw = fs.readFileSync(mdPath, "utf8");
  const fm = parseFrontmatterSimple(raw);
  const title = fm.title ? `${fm.title} | Grupo WG Almeida` : null;
  const description = fm.excerpt || null;
  const hasSpecificFrontmatterImage = Boolean(fm.image && !fm.image.startsWith("/images/banners/"));
  const slugSpecificManifestImage = getBlogImageUrl({
    slug,
    category: fm.category,
    variant: "seo",
    allowCategoryFallback: false,
  });
  const cloudinaryFallback = getCloudinaryBlogImage({
    slug,
    category: fm.category,
    variant: "seo",
  });
  const image = fm.image
    ? (
      slugSpecificManifestImage ||
      (hasSpecificFrontmatterImage
        ? (fm.image.startsWith("http") ? fm.image : `${BASE_URL}${fm.image}`)
        : (fm.image.startsWith("http") ? fm.image : `${BASE_URL}${fm.image}`))
    )
    : slugSpecificManifestImage || cloudinaryFallback || `${BASE_URL}/og-home-1200x630.jpg`;
  const canonical = `${BASE_URL}/blog/${slug}`;
  if (!title) return null;
  return { title, description, canonical, og: { title, description, image, url: canonical }, twitter: { card: "summary_large_image", title, description, image } };
}

/** Get SEO config for an estilo from its markdown file */
function getEstiloSEO(slug) {
  const mdPath = path.join(process.cwd(), "src", "content", "estilos", `${slug}.md`);
  if (!fs.existsSync(mdPath)) return null;
  const raw = fs.readFileSync(mdPath, "utf8");
  const fm = parseFrontmatterSimple(raw);
  const displayName = slug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  const title = fm.title ? `${fm.title} - Guia Completo de Estilo | WG Almeida` : `${displayName} - Guia Completo de Estilo | WG Almeida`;
  const description = fm.excerpt || `Descubra o estilo ${displayName}: caracteristicas, cores e como aplicar na sua casa com a curadoria do Grupo WG Almeida.`;
  const cloudinaryImage = getCloudinaryStyleImage({ slug, variant: "seo" });
  const image = cloudinaryImage || `${BASE_URL}${getStyleCoverPath(slug)}`;
  const canonical = `${BASE_URL}/estilos/${slug}`;
  return { title, description, canonical, og: { title, description, image, url: canonical }, twitter: { card: "summary_large_image", title, description, image } };
}

/** Resolve SEO config for any route, with rich data for blog/estilos */
function resolveSEO(route) {
  if (route.startsWith('/blog/')) {
    const slug = route.replace('/blog/', '');
    return getBlogArticleSEO(slug) || getSEOConfig(route);
  }
  if (route.startsWith('/estilos/')) {
    const slug = route.replace('/estilos/', '');
    return getEstiloSEO(slug) || getSEOConfig(route);
  }
  return getSEOConfig(route);
}

const root = process.cwd();
const outDirArg = process.argv[2];
const outDir = outDirArg || process.env.BUILD_OUT_DIR || "dist";
const outputRoot = path.join(root, outDir);
const templatePath = path.join(outputRoot, "index.html");

const sitemapPath = path.join(root, "public", "sitemap.xml");

function getBlogRoutes() {
  const blogPath = path.join(root, "src", "content", "blog");
  const routes = [];
  if (fs.existsSync(blogPath)) {
    const files = fs.readdirSync(blogPath).filter(f => f.endsWith('.md'));
    files.forEach(file => {
      const slug = file.replace('.md', '');
      routes.push(`/blog/${slug}`);
    });
    
    // Verificar subpastas de idiomas
    ['en', 'es'].forEach(lang => {
      const langPath = path.join(blogPath, lang);
      if (fs.existsSync(langPath)) {
        const langFiles = fs.readdirSync(langPath).filter(f => f.endsWith('.md'));
        langFiles.forEach(file => {
          const slug = file.replace('.md', '');
          routes.push(`/blog/${slug}`); // O sistema de tradução usa o mesmo slug no roteamento
        });
      }
    });
  }
  return routes;
}

function getRoutesFromSitemap() {
  if (!fs.existsSync(sitemapPath)) return [];

  const xml = fs.readFileSync(sitemapPath, "utf8");
  const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/gim)];
  const routes = [];

  for (const match of locMatches) {
    const loc = match[1]?.trim();
    if (!loc) continue;

    try {
      const url = new URL(loc);
      let route = url.pathname || "/";
      if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);
      routes.push(route);
    } catch {
      // ignore malformed urls
    }
  }

  return routes;
}

const ROUTES = Array.from(
  new Set([
    "/", 
    ...Object.keys(SEO_CONFIG).filter((route) => route !== "/"), 
    ...getBlogRoutes(),
    ...getRoutesFromSitemap()
  ])
);

const GENERATED_HTML_KEEP = new Set([
  "index.html",
  "sitemap.xml",
  ...ROUTES.filter((route) => route !== "/").flatMap((route) => {
    const normalized = route.slice(1);
    return [`${normalized}.html`, path.posix.join(normalized, "index.html")];
  }),
]);

const replaceOne = (html, pattern, value) => {
  if (pattern.test(html)) {
    return html.replace(pattern, value);
  }
  return html;
};

const escapeHtml = (text = "") =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function stripMarkdownInline(text = "") {
  return text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getMarkdownPreviewBlocks(route) {
  let filePath = null;
  if (route.startsWith("/blog/")) {
    const slug = route.replace("/blog/", "");
    filePath = path.join(root, "src", "content", "blog", `${slug}.md`);
  } else if (route.startsWith("/estilos/")) {
    const slug = route.replace("/estilos/", "");
    filePath = path.join(root, "src", "content", "estilos", `${slug}.md`);
  }

  if (!filePath || !fs.existsSync(filePath)) return [];

  const raw = fs.readFileSync(filePath, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---/, "");
  const blocks = [];
  for (const line of raw.split(/\r?\n/)) {
    const clean = stripMarkdownInline(line.replace(/^#{1,3}\s+/, ""));
    if (clean.length < 45) continue;
    blocks.push(clean);
    if (blocks.length >= 5) break;
  }
  return blocks;
}

const CRITICAL_ROUTE_PRELOADS = {
  "/buildtech": [
    '<link rel="preload" as="image" href="/images/banners/PROCESSOS-640.webp" imagesrcset="/images/banners/PROCESSOS-640.webp 640w, /images/banners/PROCESSOS-960.webp 960w, /images/banners/PROCESSOS.webp 1200w" imagesizes="100vw" fetchpriority="high">',
  ],
  "/buildtech/solucoes.html": [
    '<link rel="preload" as="image" href="/images/banners/PROCESSOS-640.webp" imagesrcset="/images/banners/PROCESSOS-640.webp 640w, /images/banners/PROCESSOS-960.webp 960w, /images/banners/PROCESSOS.webp 1200w" imagesizes="100vw" fetchpriority="high">',
  ],
  "/buildtech/metodo.html": [
    '<link rel="preload" as="image" href="/images/banners/PROCESSOS-640.webp" imagesrcset="/images/banners/PROCESSOS-640.webp 640w, /images/banners/PROCESSOS-960.webp 960w, /images/banners/PROCESSOS.webp 1200w" imagesizes="100vw" fetchpriority="high">',
  ],
};

function applyRoutePreloads(html, route) {
  const preloads = CRITICAL_ROUTE_PRELOADS[route];
  if (!preloads?.length) return html;
  const preloadHtml = preloads.join("\n");
  if (html.includes(preloadHtml)) return html;
  return html.replace("</head>", `${preloadHtml}\n</head>`);
}

const routeLabel = (route) => {
  if (route === "/") return "Grupo WG Almeida";
  const raw = route.split("/").filter(Boolean).pop() || "";
  return raw
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const CORE_SEO_LINKS = [
  ["/arquitetura", "Arquitetura"],
  ["/engenharia", "Engenharia"],
  ["/marcenaria", "Marcenaria"],
  ["/obra-turn-key", "Obra Turn Key"],
  ["/arquitetura-corporativa", "Arquitetura Corporativa"],
  ["/construtora-alto-padrao-sp", "Construtora Alto Padrao SP"],
  ["/reforma-apartamento-itaim", "Reforma Apartamento Itaim"],
  ["/revista-estilos", "Revista de Estilos"],
  ["/blog", "Blog"],
  ["/solicite-proposta", "Solicite Proposta"],
  ["/projetos", "Projetos"],
  ["/faq", "FAQ"],
  ["/contato", "Contato"],
];

const ROUTE_SEO_LINKS = {
  "/blog/closet-planejado-organizacao-otimizacao": [
    ["/marcenaria", "Marcenaria sob medida"],
    ["/blog/custo-marcenaria-planejada", "Custo de marcenaria planejada"],
    ["/blog/marcenaria-sob-medida", "Guia de marcenaria sob medida"],
    ["/blog/reforma-cozinha-planejada-guia-completo", "Cozinha planejada"],
  ],
  "/blog/custo-reforma-m2-sao-paulo": [
    ["/iccri", "Indice ICCRI"],
    ["/blog/tabela-precos-reforma-2026-iccri", "Tabela de precos de reforma 2026"],
    ["/blog/quanto-custa-reforma-apartamento-100m2", "Reforma de apartamento de 100m2"],
    ["/blog/como-calcular-custo-de-obra", "Como calcular custo de obra"],
  ],
  "/estilos/neoclassico": [
    ["/revista-estilos", "Indice de estilos"],
    ["/estilos/classico", "Estilo Classico"],
    ["/estilos/mediterraneo", "Estilo Mediterraneo"],
    ["/arquitetura", "Projeto de arquitetura"],
  ],
  "/estilos/southwest": [
    ["/revista-estilos", "Indice de estilos"],
    ["/estilos/rustico", "Estilo Rustico"],
    ["/estilos/boho", "Estilo Boho"],
    ["/arquitetura", "Projeto de arquitetura"],
  ],
};

function buildSeoNavLinks(route) {
  const links = [...(ROUTE_SEO_LINKS[route] || []), ...CORE_SEO_LINKS];
  const seen = new Set();
  return links
    .filter(([href]) => {
      if (seen.has(href)) return false;
      seen.add(href);
      return true;
    })
    .map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`)
    .join(" ·\n    ");
}

function buildSeoFallback(route, config) {
  const heading = escapeHtml(config.og?.title || config.title || routeLabel(route));
  const description = escapeHtml(config.description || "");
  const canonical = `https://wgalmeida.com.br${route}`;
  const previewBlocks = getMarkdownPreviewBlocks(route);
  const previewHtml = previewBlocks.length
    ? previewBlocks.map((block) => `<p style="font-size:16px;margin:0 0 14px 0">${escapeHtml(block)}</p>`).join("\n  ")
    : `<p style="font-size:16px;margin:0 0 18px 0">
    Nesta pagina voce encontra informacoes objetivas sobre escopo, etapas, qualidade de execucao e orientacoes para tomar decisoes com seguranca. O foco e entregar clareza de investimento, previsibilidade de prazo e compatibilizacao entre arquitetura, obra e marcenaria, evitando retrabalho e ruido operacional ao longo de toda a jornada do cliente.
  </p>`;

  return `
<div id="wg-seo-fallback" style="max-width:980px;margin:48px auto;padding:0 20px;font-family:Inter,Arial,sans-serif;color:#222;line-height:1.6">
  <h1 style="font-size:36px;line-height:1.2;margin:0 0 16px 0;font-weight:500">${heading}</h1>
  <p style="font-size:18px;margin:0 0 14px 0">${description}</p>
  <p style="font-size:16px;margin:0 0 18px 0">
    O Grupo WG Almeida atua com arquitetura, engenharia e marcenaria integradas, do projeto a entrega da obra, com padrao tecnico e gestao unificada.
  </p>
  ${previewHtml}
  <nav aria-label="Navegacao interna">
    ${buildSeoNavLinks(route)}
  </nav>
  <p style="margin-top:12px;font-size:13px;color:#666">
    URL canonica: <a href="${canonical}">${canonical}</a>
  </p>
</div>`;
}

const COMPANY_PHONE = "+5511984650002";
const COMPANY_EMAIL = "contato@wgalmeida.com.br";

const PERSON_WILLIAM = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://wgalmeida.com.br/sobre#william-almeida",
  "name": "William Almeida",
  "jobTitle": "CEO e Diretor de Arquitetura",
  "url": "https://wgalmeida.com.br/sobre",
  "worksFor": { "@id": "https://wgalmeida.com.br/#organization" },
  "knowsAbout": [
    "Arquitetura de alto padrao",
    "Arquitetura de alto padrão",
    "Engenharia de obras",
    "Marcenaria sob medida",
    "Gestão de obras turn key",
    "Tecnologia aplicada à construção"
  ],
  "sameAs": [
    "https://www.linkedin.com/in/william-almeida-wg",
    "https://www.behance.net/wgalmeida"
  ],
  "image": "https://wgalmeida.com.br/images/about/william-almeida-1200.webp"
};

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://wgalmeida.com.br/#organization",
  "name": "Grupo WG Almeida",
  "url": "https://wgalmeida.com.br",
  "logo": "https://wgalmeida.com.br/images/logo-96.webp",
  "email": COMPANY_EMAIL,
  "telephone": COMPANY_PHONE,
  "founder": { "@id": "https://wgalmeida.com.br/sobre#william-almeida" },
  "hasPart": [
    { "@id": "https://wgalmeida.com.br/buildtech#softwareapplication" },
    { "@id": "https://wgalmeida.com.br/moodboard-generator#softwareapplication" },
    { "@id": "https://wgalmeida.com.br/room-visualizer#softwareapplication" }
  ],
  "makesOffer": [
    { "@id": "https://wgalmeida.com.br/servicos/arquitetura#service" },
    { "@id": "https://wgalmeida.com.br/servicos/engenharia#service" },
    { "@id": "https://wgalmeida.com.br/servicos/marcenaria#service" },
    { "@id": "https://wgalmeida.com.br/servicos/turn-key#service" },
    { "@id": "https://wgalmeida.com.br/servicos/experiencia-visual#service" }
  ]
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://wgalmeida.com.br/#website",
  "url": "https://wgalmeida.com.br",
  "name": "Grupo WG Almeida",
  "publisher": { "@id": "https://wgalmeida.com.br/#organization" },
  "inLanguage": "pt-BR",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://wgalmeida.com.br/blog?busca={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Grupo WG Almeida",
  "url": "https://wgalmeida.com.br",
  "telephone": COMPANY_PHONE,
  "email": COMPANY_EMAIL,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "São Paulo",
    "addressRegion": "SP",
    "addressCountry": "BR"
  },
  "areaServed": {
    "@type": "City",
    "name": "São Paulo"
  }
};

const KNOWLEDGE_GRAPH_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    ORGANIZATION_SCHEMA,
    PERSON_WILLIAM,
    {
      "@type": "Service",
      "@id": "https://wgalmeida.com.br/servicos/arquitetura#service",
      "name": "Arquitetura de Alto Padrão",
      "serviceType": "Arquitetura",
      "url": "https://wgalmeida.com.br/arquitetura",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    {
      "@type": "Service",
      "@id": "https://wgalmeida.com.br/servicos/engenharia#service",
      "name": "Engenharia Integrada",
      "serviceType": "Engenharia",
      "url": "https://wgalmeida.com.br/engenharia",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    {
      "@type": "Service",
      "@id": "https://wgalmeida.com.br/servicos/marcenaria#service",
      "name": "Marcenaria Sob Medida",
      "serviceType": "Marcenaria",
      "url": "https://wgalmeida.com.br/marcenaria",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    {
      "@type": "Service",
      "@id": "https://wgalmeida.com.br/servicos/turn-key#service",
      "name": "Obra Turn Key",
      "serviceType": "Execucao turn key",
      "url": "https://wgalmeida.com.br/obra-turn-key",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    {
      "@type": "Service",
      "@id": "https://wgalmeida.com.br/servicos/experiencia-visual#service",
      "name": "Sistema de Experiência Visual",
      "serviceType": "Experiência visual aplicada a projeto e pré-venda",
      "url": "https://wgalmeida.com.br/moodboard",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://wgalmeida.com.br/buildtech#softwareapplication",
      "name": "WG_Build.tech",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://wgalmeida.com.br/buildtech",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://wgalmeida.com.br/moodboard-generator#softwareapplication",
      "name": "WG Moodboard Generator",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "url": "https://wgalmeida.com.br/moodboard-generator",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://wgalmeida.com.br/room-visualizer#softwareapplication",
      "name": "WG Room Visualizer",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "url": "https://wgalmeida.com.br/room-visualizer",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    {
      "@type": "CreativeWorkSeries",
      "@id": "https://wgalmeida.com.br/projetos#creativework-series",
      "name": "Projetos Grupo WG Almeida",
      "url": "https://wgalmeida.com.br/projetos",
      "creator": { "@id": "https://wgalmeida.com.br/#organization" }
    },
    WEBSITE_SCHEMA
  ]
};

const HOME_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "O que e o Grupo WG Almeida?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O Grupo WG Almeida e um ecossistema unificado que integra arquitetura de alto padrao, engenharia de obras com controle de custos e marcenaria sob medida premium em Sao Paulo."
      }
    },
    {
      "@type": "Question",
      "name": "Como funciona o orcamento integrado?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trabalhamos com metodologia de orcamento fechado e transparente, compatibilizando o projeto de arquitetura, o planejamento de engenharia e a marcenaria sob medida antes de iniciar a execucao."
      }
    },
    {
      "@type": "Question",
      "name": "O que e o indice ICCRI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O Indice de Custo de Construcao e Reforma Inteligente (ICCRI) e o motor proprietario do Grupo WG Almeida para precificacao e simulacao de custos reais de obra por m2."
      }
    }
  ]
};

function buildBreadcrumbsSchema(route) {
  if (route === "/") return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://wgalmeida.com.br/"
      }
    ]
  };

  const segments = route.split("/").filter(Boolean);
  const items = [{ name: "Home", url: "https://wgalmeida.com.br/" }];

  const labelMap = {
    sobre: "Sobre", processo: "Processo", projetos: "Projetos",
    blog: "Blog", store: "Loja", arquitetura: "Arquitetura",
    engenharia: "Engenharia", marcenaria: "Marcenaria", contato: "Contato",
    depoimentos: "Depoimentos", faq: "FAQ", "a-marca": "A Marca",
    "solicite-proposta": "Solicite Proposta",
  };

  let pathStr = "";
  for (const seg of segments) {
    pathStr += `/${seg}`;
    const label = labelMap[seg] || seg.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    items.push({ name: label, url: `https://wgalmeida.com.br${pathStr}` });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

function getRouteSchemas(route) {
  const schemas = [];

  // Adiciona Breadcrumbs para todas as rotas
  schemas.push(buildBreadcrumbsSchema(route));

  if (route === "/") {
    schemas.push(KNOWLEDGE_GRAPH_SCHEMA);
    schemas.push(LOCAL_BUSINESS_SCHEMA);
    schemas.push(PERSON_WILLIAM);
    schemas.push(ORGANIZATION_SCHEMA);
    schemas.push(HOME_FAQ_SCHEMA);
  } else if (route === "/sobre") {
    schemas.push(KNOWLEDGE_GRAPH_SCHEMA);
    schemas.push(PERSON_WILLIAM);
  } else if (route === "/arquitetura") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Arquitetura de Alto Padrão em São Paulo",
      "description": "Projetos de arquitetura residencial e corporativa com execução integrada.",
      "url": "https://wgalmeida.com.br/arquitetura",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    });
  } else if (route === "/engenharia") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Engenharia Integrada em São Paulo",
      "description": "Engenharia para obras com planejamento, controle e previsibilidade.",
      "url": "https://wgalmeida.com.br/engenharia",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    });
  } else if (route === "/marcenaria") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Marcenaria Sob Medida em São Paulo",
      "description": "Marcenaria premium integrada ao projeto arquitetônico.",
      "url": "https://wgalmeida.com.br/marcenaria",
      "provider": { "@id": "https://wgalmeida.com.br/#organization" }
    });
  } else if (route === "/faq") {
    schemas.push(HOME_FAQ_SCHEMA);
  }

  return schemas;
}

function applySeo(template, route, config) {
  const title = escapeHtml(config.title);
  const desc = escapeHtml(config.description);
  const canonical = `https://wgalmeida.com.br${route}`;
  const ogTitle = escapeHtml(config.og?.title || config.title);
  const ogDesc = escapeHtml(config.og?.description || config.description);
  const ogImage = config.og?.image || "https://wgalmeida.com.br/og-home-1200x630.jpg";
  const ogUrl = canonical;
  const twTitle = escapeHtml(config.twitter?.title || config.og?.title || config.title);
  const twDesc = escapeHtml(config.twitter?.description || config.og?.description || config.description);
  const twImage = config.twitter?.image || ogImage;

  let html = template;
  html = replaceOne(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceOne(html, /<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${desc}" />`);
  html = replaceOne(html, /<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOne(html, /<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${ogTitle}" />`);
  html = replaceOne(html, /<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${ogDesc}" />`);
  html = replaceOne(html, /<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${ogImage}" />`);
  html = replaceOne(html, /<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${ogUrl}" />`);
  html = replaceOne(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${twTitle}" />`);
  html = replaceOne(html, /<meta name="twitter:url" content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${ogUrl}" />`);
  html = replaceOne(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${twDesc}" />`);
  html = replaceOne(html, /<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${twImage}" />`);
  html = applyRoutePreloads(html, route);
  html = replaceOne(
    html,
    /<script>\s*\(function\(\)\s*\{[\s\S]*?dynamic-canonical[\s\S]*?<\/script>/i,
    `<script>(function(){var canonical=document.querySelector('link[rel="canonical"]');if(canonical){canonical.href='${canonical}';}})();</script>`
  );

  const routeSchemas = getRouteSchemas(route);
  if (routeSchemas.length > 0) {
    const schemaHtml = routeSchemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n");
    html = html.replace("</head>", `${schemaHtml}\n</head>`);
  }

  if (route === "/") {
    html = replaceOne(
      html,
      /<div id="root">[\s\S]*?<\/div>/i,
      `<div id="root">${buildSeoFallback(route, config)}</div>`
    );
  } else {
    html = replaceOne(
      html,
      /<div id="root">\s*<\/div>/i,
      `<div id="root">${buildSeoFallback(route, config)}</div>`
    );
  }
  return html;
}

async function removeOrphanGeneratedHtml(currentRoot, currentDir = currentRoot) {
  const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = path.relative(currentRoot, absolutePath).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      if (entry.name === "assets" || entry.name === "images") continue;
      await removeOrphanGeneratedHtml(currentRoot, absolutePath);

      const remaining = await fs.promises.readdir(absolutePath);
      if (remaining.length === 0) {
        await fs.promises.rmdir(absolutePath);
      }
      continue;
    }

    if (!entry.isFile()) continue;
    if (!relativePath.endsWith(".html")) continue;
    if (GENERATED_HTML_KEEP.has(relativePath)) continue;

    await fs.promises.unlink(absolutePath);
  }
}

async function run() {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  const rootTemplate = await fs.promises.readFile(templatePath, "utf8");
  await removeOrphanGeneratedHtml(outputRoot);

  for (const route of ROUTES) {
    const seo = resolveSEO(route);
    const routeDir = route === "/" ? outputRoot : path.join(outputRoot, route.slice(1));
    const routeIndexPath = path.join(routeDir, "index.html");
    const sourceHtml = fs.existsSync(routeIndexPath)
      ? await fs.promises.readFile(routeIndexPath, "utf8")
      : rootTemplate;
    const html = applySeo(sourceHtml, route, seo);

    await fs.promises.mkdir(routeDir, { recursive: true });
    await fs.promises.writeFile(routeIndexPath, html);
    console.log(`ok: ${path.join(outDir, route === "/" ? "index.html" : `${route.slice(1)}/index.html`)}`);

    // Create extensionless aliases for static preview servers that resolve
    // `/foo/bar` to `/foo/bar.html` (without requiring a trailing slash).
    if (route !== "/") {
      const routeHtmlAliasPath = path.join(outputRoot, `${route.slice(1)}.html`);
      await fs.promises.mkdir(path.dirname(routeHtmlAliasPath), { recursive: true });
      await fs.promises.writeFile(routeHtmlAliasPath, html);
      console.log(`ok: ${path.join(outDir, `${route.slice(1)}.html`)}`);
    }
  }

  // Geração do Sitemap dinâmico
  console.log("Generating dynamic sitemap.xml...");
  const today = new Date().toISOString().split('T')[0];
  const sitemapEntries = ROUTES.map(route => {
    let priority = "0.8";
    if (route === "/") priority = "1.0";
    else if (["/arquitetura", "/engenharia", "/marcenaria", "/projetos"].includes(route)) priority = "0.9";
    else if (route.startsWith("/blog/")) priority = "0.7";

    return `  <url>
    <loc>https://wgalmeida.com.br${route === "/" ? "" : route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.startsWith("/blog/") ? "monthly" : "weekly"}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;

  const finalSitemapPath = path.join(outputRoot, "sitemap.xml");
  await fs.promises.writeFile(finalSitemapPath, sitemapXml);
  
  // Também atualizar na pasta public para o próximo build
  await fs.promises.writeFile(sitemapPath, sitemapXml);
  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://wgalmeida.com.br/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://wgalmeida.com.br/video-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
  await fs.promises.writeFile(path.join(outputRoot, "sitemap-index.xml"), sitemapIndexXml);
  await fs.promises.writeFile(path.join(root, "public", "sitemap-index.xml"), sitemapIndexXml);
  console.log(`Sitemap updated with ${ROUTES.length} routes.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});





