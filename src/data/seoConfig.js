const BASE_URL = "https://wgalmeida.com.br";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-home-1200x630.jpg`;

const defaultConfig = {
  title: "Grupo WG Almeida | Arquitetura, Engenharia, Marcenaria, Easy Locker e WG_Build.tech",
  description:
    "Grupo WG Almeida integra arquitetura, engenharia, marcenaria, Easy Locker e WG_Build.tech em um ecossistema de execução, tecnologia e soluções de alto padrão.",
  canonical: `${BASE_URL}/`,
  og: {
    title: "Grupo WG Almeida | Arquitetura, Engenharia, Marcenaria, Easy Locker e WG_Build.tech",
    description:
      "Grupo WG Almeida integra arquitetura, engenharia, marcenaria, Easy Locker e WG_Build.tech em um ecossistema de execução, tecnologia e soluções de alto padrão.",
    image: DEFAULT_OG_IMAGE,
    url: `${BASE_URL}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Grupo WG Almeida | Arquitetura, Engenharia, Marcenaria, Easy Locker e WG_Build.tech",
    description:
      "Grupo WG Almeida integra arquitetura, engenharia, marcenaria, Easy Locker e WG_Build.tech em um ecossistema de execução, tecnologia e soluções de alto padrão.",
    image: DEFAULT_OG_IMAGE,
  },
};

function page(path, title, description, image = DEFAULT_OG_IMAGE) {
  const canonical = `${BASE_URL}${path}`;
  return {
    title,
    description,
    canonical,
    og: { title, description, image, url: canonical },
    twitter: { card: "summary_large_image", title, description, image },
  };
}

export const SEO_CONFIG = {
  "/": defaultConfig,
  "/sobre": page(
    "/sobre",
    "Grupo WG Almeida: 14 Anos Entregando Arquitetura, Engenharia e Marcenaria em SP",
    "Conheça a metodologia Turn Key do Grupo WG Almeida — projeto, obra e marcenaria integrados, sem ruído operacional. Atendemos residências e corporativos de alto padrão em São Paulo.",
    `${BASE_URL}/og-sobre-1200x630.jpg`
  ),
  "/a-marca": page(
    "/a-marca",
    "A Marca | Grupo WG Almeida",
    "Identidade e posicionamento do Grupo WG Almeida.",
    `${BASE_URL}/og-sobre-1200x630.jpg`
  ),
  "/arquitetura": page(
    "/arquitetura",
    "Arquitetura Residencial e Corporativa em São Paulo | Grupo WG Almeida",
    "Projetos de arquitetura residencial e corporativa em São Paulo com conceito autoral, detalhamento técnico e entrega integrada.",
    `${BASE_URL}/og-arquitetura-1200x630.jpg`
  ),
  "/engenharia": page(
    "/engenharia",
    "Engenharia e Gerenciamento de Obras em São Paulo | Turn Key WG Almeida",
    "Engenharia com planejamento, compatibilização e gerenciamento de obras em São Paulo para reduzir atrasos, retrabalho e risco de custo.",
    `${BASE_URL}/og-engenharia-1200x630.jpg`
  ),
  "/marcenaria": page(
    "/marcenaria",
    "Marcenaria Sob Medida e Móveis Planejados em São Paulo | Grupo WG Almeida",
    "Marcenaria sob medida e móveis planejados com projeto técnico, acabamento premium e instalação integrada para residências e corporativo.",
    `${BASE_URL}/og-marcenaria-1200x630.jpg`
  ),
  "/projetos": page(
    "/projetos",
    "Projetos de Arquitetura e Reformas em São Paulo | Portfólio WG Almeida",
    "Veja projetos residenciais e corporativos executados pela WG Almeida em São Paulo, com arquitetura autoral, engenharia e marcenaria integradas.",
    `${BASE_URL}/og-projetos-1200x630.jpg`
  ),
  "/processo": page(
    "/processo",
    "Processo | Grupo WG Almeida",
    "Conheça o processo integrado do Grupo WG Almeida.",
    `${BASE_URL}/og-processo-1200x630.jpg`
  ),
  "/depoimentos": page(
    "/depoimentos",
    "Depoimentos | Grupo WG Almeida",
    "Avaliações e resultados de clientes do Grupo WG Almeida.",
    `${BASE_URL}/og-sobre-1200x630.jpg`
  ),
  "/contato": page(
    "/contato",
    "Contato WG Almeida | Solicite Orçamento de Arquitetura e Reforma",
    "Fale com a equipe WG Almeida para solicitar orçamento de arquitetura, engenharia e marcenaria em São Paulo.",
    `${BASE_URL}/og-home-1200x630.jpg`
  ),
  "/store": page(
    "/store",
    "Loja de Decoração e Design Premium | Grupo WG Almeida",
    "Compre produtos de decoração e design premium com curadoria WG Almeida para ambientes residenciais e corporativos.",
    `${BASE_URL}/og-loja-1200x630.jpg`
  ),
  "/blog": page(
    "/blog",
    "Blog | Grupo WG Almeida",
    "Conteúdos sobre arquitetura, engenharia, marcenaria e obras.",
    `${BASE_URL}/og-home-1200x630.jpg`
  ),
  "/iccri": page(
    "/iccri",
    "ICCRI 2026 | Índice de Custo de Construção e Reforma Inteligente",
    "Índice proprietário da WG Almeida para estimar custo de reforma por m2 com base em dados reais de obras e variação de mercado.",
    `${BASE_URL}/og-engenharia-1200x630.jpg`
  ),
  "/iccri-para-imobiliarias": page(
    "/iccri-para-imobiliarias",
    "ICCRI para Imobiliarias, Corretores e Bancos | WG Almeida",
    "Use o ICCRI como referência técnica para precificação, análise de viabilidade e apoio comercial no mercado imobiliário.",
    `${BASE_URL}/og-engenharia-1200x630.jpg`
  ),
  "/faq": page(
    "/faq",
    "FAQ | Grupo WG Almeida",
    "Perguntas frequentes sobre o processo e serviços."
  ),
  "/solicite-proposta": page(
    "/solicite-proposta",
    "Solicite Proposta | Grupo WG Almeida",
    "Solicite sua proposta para arquitetura, engenharia, marcenaria e sistema de experiência visual aplicado a briefing, pré-venda e execução."
  ),
  "/obra-turn-key": page(
    "/obra-turn-key",
    "Obra Turn Key SP | Grupo WG Almeida",
    "Sistema Turn Key premium com projeto, execução e entrega integrados."
  ),
  "/arquitetura-corporativa": page(
    "/arquitetura-corporativa",
    "Arquitetura Corporativa SP | Grupo WG Almeida",
    "Projetos corporativos e comerciais em São Paulo com método Turn Key."
  ),
  "/construtora-alto-padrao-sp": page(
    "/construtora-alto-padrao-sp",
    "Construtora Alto Padrão SP | Grupo WG Almeida",
    "Construtora e executora premium em São Paulo para obras de alto padrão."
  ),
  "/reforma-apartamento-sp": page(
    "/reforma-apartamento-sp",
    "Reforma de Apartamento SP | Grupo WG Almeida",
    "Reformas completas de apartamentos em São Paulo com execução integrada."
  ),
  "/reforma-apartamento-itaim": page(
    "/reforma-apartamento-itaim",
    "Reforma Apartamento Itaim Bibi | Grupo WG Almeida",
    "Reforma premium de apartamentos no Itaim com projeto e obra integrados."
  ),
  "/buildtech": page(
    "/buildtech",
    "WG_Build.tech | Sites, sistemas e automação com IA",
    "Conheça a WG_Build.tech para sites, sistemas, agentes, automação e vitrine funcional baseada na metodologia S T A R."
  ),
  "/easylocker": page(
    "/easylocker",
    "Easy Locker | Armários Inteligentes para Condomínios de Luxo",
    "A solução definitiva para gestão de encomendas. Armários inteligentes automatizados com a tecnologia do Grupo WG Almeida."
  ),
  "/obraeasy": page(
    "/obraeasy",
    "ObraEasy | Plataforma de Gestão de Obras com EVF e Cronograma",
    "Conheça o ObraEasy: plataforma para orçamento, EVF, cronograma, contratos e gestão financeira de obras para clientes, corretores e construtoras."
  ),
  "/easy-real-state": page(
    "/easy-real-state",
    "EasyRealState | Calculadora de Valor Imobiliário para Corretores",
    "Use o EasyRealState para ler valor de mercado com base real em São Paulo. AVM comercial, link compartilhável e trial assistido para corretores e imobiliárias."
  "/revista-estilos": page(
    "/revista-estilos",
    "Revista de Estilos 2026: Guia de Decoração e Design de Interiores | WG Almeida",
    "Explore 30+ estilos de decoração para sua casa ou apartamento em SP: Minimalismo, Japandi, Industrial e mais. Encontre a inspiração certa para seu projeto de arquitetura e marcenaria."
  ),
  "/estilos/japandi": page(
    "/estilos/japandi",
    "Estilo Japandi em SP: Zen, Minimalismo e Marcenaria Sob Medida | WG Almeida",
    "Descubra como aplicar o estilo Japandi no seu imóvel em São Paulo. Unimos o minimalismo japonês ao aconchego escandinavo com marcenaria de alto padrão e gestão de obra integrada."
  ),
  "/estilos/minimalismo": page(
    "/estilos/minimalismo",
    "Estilo Minimalista: Arquitetura de Alto Padrão e Decoração "Less is More" | WG Almeida",
    "A estética do essencial para apartamentos e casas de luxo em SP. Conheça nossa abordagem de arquitetura minimalista com foco em luz, espaço e acabamentos premium."
  ),
  "/estilos/industrial": page(
    "/estilos/industrial",
    "Estilo Industrial: Design Urbano, Loft e Arquitetura Contemporânea | WG Almeida",
    "Como aplicar o design industrial com sofisticação em São Paulo. Estruturas aparentes, marcenaria em metal e madeira, e integração de ambientes com gestão de obra completa."
  ),
  "/estilos/boho": page(
    "/estilos/boho",
    "Estilo Boho Chic: Decoração Afetiva, Texturas e Design de Interiores | WG Almeida",
    "Crie ambientes acolhedores com a estética Boho Chic. Unimos texturas naturais, cores quentes e design personalizado para sua residência em São Paulo."
  ),
  };
  "/moodboard": page(
    "/moodboard",
    "Moodboard | Sistema de Experiência Visual | WG Almeida",
    "Organize estilo, referências e decisões visuais em uma jornada de alinhamento estético pronta para briefing, proposta e projeto."
  ),
  "/moodboard-generator": page(
    "/moodboard-generator",
    "Gerador de Moodboard Profissional | WG Almeida",
    "Monte apresentações de moodboard e transforme referências em uma experiência visual clara para clientes, corretores e profissionais."
  ),
  "/room-visualizer": page(
    "/room-visualizer",
    "Visualizador de Ambientes com IA | WG Almeida",
    "Visualize cenários de reforma com IA e use a leitura visual como apoio para alinhamento, proposta e próximo passo comercial."
  ),
};

export function getSEOConfig(pathname = "/") {
  return SEO_CONFIG[pathname] || page(pathname, defaultConfig.title, defaultConfig.description);
}

export default SEO_CONFIG;




