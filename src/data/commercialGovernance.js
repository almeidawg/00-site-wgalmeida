import COMMERCIAL_GOVERNANCE_GENERATED from './commercialGovernance.generated.js';
import { OBRAEASY_PRECOS } from './companyPublic.js';

const COMMERCIAL_PACKAGE_ORDER = ['essencial', 'equilibrado', 'superior', 'exclusivo'];

const COMMERCIAL_PACKAGE_LABELS = {
  essencial: 'Essencial',
  equilibrado: 'Equilibrado',
  superior: 'Superior',
  exclusivo: 'Exclusivo',
};

const packageEntry = ({
  minValue = null,
  maxValue = null,
  rangeLabel,
  summary,
  includes = [],
  excludes = [],
  idealFor = '',
  timelineBase = '',
  timelineTypical = '',
  timelineDependencies = [],
  timelineFactors = [],
  variation = '',
  conditions = [],
}) => ({
  minValue,
  maxValue,
  rangeLabel,
  summary,
  includes,
  excludes,
  idealFor,
  timelineBase,
  timelineTypical,
  timelineDependencies,
  timelineFactors,
  variation,
  conditions,
});

const COMMERCIAL_SERVICE_REGISTRY_BASE = {
  'iccri-reforma-civil-sp': {
    id: 'iccri-reforma-civil-sp',
    label: 'ICCRI 2026 · Reforma civil completa em Sao Paulo',
    nucleus: 'construcao-obra',
    status: 'active',
    measurementLabel: 'por m2',
    sourceOfTruth: 'ICCRI 2026 · registry v2026.05.10',
    sourceReference: '/blog/tabela-precos-reforma-2026-iccri',
    articleBindings: ['tabela-precos-reforma-2026-iccri', 'custo-reforma-m2-sao-paulo', 'como-calcular-custo-de-obra', 'custo-construcao-reforma-2026-guia-tecnico-completo'],
    variationFactors: [
      'bairro, acesso e regras de condominio',
      'infraestrutura existente e idade do imovel',
      'nivel de personalizacao, producao sob medida e compras paralelas',
      'janela de prazo e necessidade de aceleracao de frentes',
    ],
    observations: [
      'Faixa editorial de referencia. Contrato real exige levantamento, memorial e cronograma fisico-financeiro.',
      'Valores muito abaixo da faixa costumam sinalizar omissao de escopo, material inferior ou retrabalho futuro.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: 'R$ 900 a R$ 1.400 por m2',
        summary: 'Reforma civil de entrada, com especificacao funcional e menor nivel de customizacao.',
        includes: ['demolicao controlada', 'infraestrutura basica', 'revestimentos nacionais', 'pintura e acabamento funcional'],
        excludes: ['marcenaria sob medida', 'automacao', 'pedras e ferragens especiais'],
        idealFor: 'reformas com foco em base funcional, atualizacao objetiva e controle inicial de caixa.',
        timelineBase: '90 a 120 dias para 60m2',
        timelineTypical: '90 a 120 dias',
        timelineDependencies: ['aprovacoes de condominio', 'levantamento tecnico', 'compras basicas'],
        timelineFactors: ['restricoes de horario', 'imovel antigo', 'infraestrutura nao mapeada'],
        variation: 'Pode subir quando a obra exige readequacao eletrica/hidraulica mais pesada ou logistica de acesso restrita.',
      }),
      equilibrado: packageEntry({
        rangeLabel: 'R$ 1.600 a R$ 2.500 por m2',
        summary: 'Leitura intermediaria homologada para reformas com melhor especificacao, compatibilizacao e acabamento.',
        includes: ['revestimentos e metais mais consistentes', 'melhor detalhamento de instalacoes', 'compatibilizacao mais cuidadosa'],
        excludes: ['automacao completa', 'curadoria de materiais importados', 'execucao com cronograma premium comprimido'],
        idealFor: 'apartamentos e casas que pedem mais precisao de obra sem entrar em pacote superior completo.',
        timelineBase: '75 a 100 dias para 60m2',
        timelineTypical: '75 a 100 dias',
        timelineDependencies: ['memorial descritivo', 'janela de compras organizada', 'medicoes no tempo correto'],
        timelineFactors: ['troca de layout', 'itens sob medida', 'condominio com operacao restrita'],
        variation: 'Sobe com producao sob medida, pedras especiais e atraso em decisoes criticas.',
      }),
      superior: packageEntry({
        rangeLabel: 'R$ 3.000 a R$ 5.500 por m2',
        summary: 'Faixa homologada para reforma premium com especificacao elevada e coordenacao mais exigente.',
        includes: ['infraestrutura mais robusta', 'acabamentos premium', 'coordenacao com marcenaria e marmoraria', 'compatibilizacao mais fina'],
        excludes: ['automacao integral high-end', 'escopo ultra exclusivo com materiais raros'],
        idealFor: 'reformas de alto padrao em que custo, prazo e acabamento precisam andar juntos.',
        timelineBase: '60 a 90 dias para 60m2',
        timelineTypical: '60 a 90 dias',
        timelineDependencies: ['projeto executivo validado', 'fornecedores homologados', 'compras antecipadas'],
        timelineFactors: ['marcenaria integrada', 'pedras especiais', 'prazo comprimido', 'obra ocupada'],
        variation: 'Pode subir com automacao, integracoes estruturais e elevacao do nivel de curadoria.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'R$ 6.000+ por m2',
        summary: 'Escopo sob curadoria dedicada, com leitura tecnica individual e pacote executivo sob consulta.',
        includes: ['gestao premium de fornecedores', 'acabamentos especiais', 'alta personalizacao', 'interface fina entre projeto, obra e producao'],
        excludes: ['faixa fechada sem visita e sem escopo validado'],
        idealFor: 'ativos com desenho autoral, especificacao rara e operacao executiva sob medida.',
        timelineBase: '45 a 75 dias para 60m2 em operacao muito bem preparada',
        timelineTypical: 'sob cronograma dedicado',
        timelineDependencies: ['visita tecnica', 'escopo congelado', 'supply chain homologado'],
        timelineFactors: ['importacao', 'obra com regras severas', 'interface com sistemas especiais'],
        variation: 'Nao publicar numero fechado sem levantamento. A faixa depende da combinacao entre especificacao e operacao.',
      }),
    },
  },
  'marcenaria-sob-medida': {
    id: 'marcenaria-sob-medida',
    label: 'Marcenaria sob medida 2026',
    nucleus: 'marcenaria',
    status: 'active',
    measurementLabel: 'por m2 linear',
    sourceOfTruth: 'Registry editorial/comercial WG · v2026.05.10',
    sourceReference: '/blog/custo-marcenaria-planejada',
    articleBindings: ['custo-marcenaria-planejada', 'marcenaria-sob-medida', 'marcenaria-sob-medida-tendencias-2026', 'closet-planejado-organizacao-otimizacao'],
    variationFactors: [
      'tipo de MDF, folha natural, laca ou madeira',
      'ferragens, internos especiais e usinagem',
      'integracao com eletrica, iluminacao, pedra e automacao',
      'janela real de medicao, producao e montagem',
    ],
    observations: [
      'Marcenaria deve ser lida como frente de producao, nao apenas como acabamento.',
      'O valor final depende da interface com obra, medicao correta e aprovacao no tempo certo.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: 'R$ 1.500 a R$ 2.200 por m2 linear',
        summary: 'Modulos mais simples, ferragens de entrada e menor grau de customizacao.',
        includes: ['modulos base', 'acabamentos funcionais', 'ferragens de entrada', 'montagem padrao'],
        excludes: ['internos especiais', 'madeira nobre', 'automacao integrada'],
        idealFor: 'ambientes funcionais em que a prioridade e organizar uso e custo inicial.',
        timelineBase: '3 a 5 semanas de producao e instalacao apos medicao aprovada',
        timelineTypical: '3 a 5 semanas',
        timelineDependencies: ['projeto definido', 'medicao liberada', 'base civil pronta'],
        timelineFactors: ['fila de fabrica', 'revisoes de ferragens', 'ajustes na obra'],
        variation: 'Pode subir com modulos fora do padrao, ferragens melhores e alteracoes de layout.',
      }),
      equilibrado: packageEntry({
        rangeLabel: 'R$ 2.200 a R$ 3.500 por m2 linear',
        summary: 'Melhor composicao de materiais, detalhamento mais preciso e integracao parcial com outras frentes.',
        includes: ['melhor composicao de MDF e acabamento', 'internos mais completos', 'ferragens de nivel intermediario', 'detalhamento mais fino'],
        excludes: ['madeira rara', 'ferragens importadas premium', 'usinagem ultra especial'],
        idealFor: 'projetos residenciais em que funcionalidade, acabamento e durabilidade precisam subir juntos.',
        timelineBase: '4 a 7 semanas',
        timelineTypical: '4 a 7 semanas',
        timelineDependencies: ['medicao fina', 'compatibilizacao com pedra e eletrica', 'aprovacao final de detalhamento'],
        timelineFactors: ['itens especiais', 'muitas revisoes', 'montagem fracionada'],
        variation: 'Sobe com desenho autoral, ferragens melhores e integracoes tecnicas adicionais.',
      }),
      superior: packageEntry({
        rangeLabel: 'R$ 3.500 a R$ 5.000 por m2 linear',
        summary: 'Desenho sob medida com maior precisao, ferragens superiores e integracao mais sofisticada com a obra.',
        includes: ['acabamentos especiais', 'ferragens premium', 'internos sofisticados', 'interface mais fina com obra e iluminacao'],
        excludes: ['pacotes com madeira rara e importacao especial sob curadoria exclusiva'],
        idealFor: 'apartamentos e casas com exigencia alta de acabamento e desempenho de uso.',
        timelineBase: '6 a 9 semanas',
        timelineTypical: '6 a 9 semanas',
        timelineDependencies: ['medicao sem retrabalho', 'escopo congelado', 'fornecedores homologados'],
        timelineFactors: ['laca, folha natural, pedra integrada, automacao e montagem delicada'],
        variation: 'Pode subir conforme a combinacao entre marcenaria, marmoraria, iluminacao e automacao.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'Sob consulta, normalmente acima de R$ 5.000 por m2 linear',
        summary: 'Pacote autoral com curadoria dedicada, madeira nobre, ferragens especiais e execucao sob medida.',
        includes: ['curadoria premium', 'ferragens especiais', 'desenho sob medida de alta complexidade', 'coordenação executiva dedicada'],
        excludes: ['fechamento sem medicao real e sem validacao de interface com obra'],
        idealFor: 'ativos com marcenaria assinada, materiais raros e alto nivel de personalizacao.',
        timelineBase: 'sob cronograma dedicado de fabrica',
        timelineTypical: 'sob cronograma dedicado',
        timelineDependencies: ['escopo executivo fechado', 'materiais confirmados', 'janela de producao reservada'],
        timelineFactors: ['importacao, madeira especial, prototipos e revisoes de desenho'],
        variation: 'Nao publicar numero fechado sem detalhamento de projeto, ferragens e condicoes de medicao.',
      }),
    },
  },
  'reforma-cozinha-planejada': {
    id: 'reforma-cozinha-planejada',
    label: 'Reforma de cozinha planejada 2026',
    nucleus: 'construcao-obra',
    status: 'active',
    measurementLabel: 'por ambiente',
    sourceOfTruth: 'Registry editorial/comercial WG · v2026.05.10',
    sourceReference: '/blog/reforma-cozinha-planejada-guia-completo',
    articleBindings: ['reforma-cozinha-planejada-guia-completo'],
    materialReferences: {
      granito: { label: 'Granito', rangeLabel: 'R$ 200 a R$ 600 por m2' },
      quartzo: { label: 'Quartzo', rangeLabel: 'R$ 600 a R$ 1.500 por m2' },
      marmore: { label: 'Marmore', rangeLabel: 'R$ 400 a R$ 2.000 por m2' },
      porcelanato: { label: 'Porcelanato', rangeLabel: 'R$ 150 a R$ 500 por m2' },
    },
    variationFactors: [
      'troca de infraestrutura eletrica e hidraulica',
      'marcenaria sob medida e bancada especial',
      'ilha, eletrodomesticos embutidos e exaustao',
      'janela de medicao, marcenaria, marmoraria e aprovacao de condominio',
    ],
    observations: [
      'Cozinha deve ser lida como micro-obra com sequencia propria.',
      'O valor real sobe quando marcenaria, pedra e infraestrutura atrasam ou mudam no meio da execucao.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: 'R$ 15.000 a R$ 25.000',
        summary: 'Cozinha funcional com marcenaria de entrada e materiais nacionais de boa leitura.',
        includes: ['armarios padrao', 'bancada nacional', 'revestimentos funcionais', 'instalacoes essenciais'],
        excludes: ['ilha completa', 'automacao', 'pedras importadas'],
        idealFor: 'atualizacao objetiva sem alto grau de personalizacao.',
        timelineBase: '6 a 8 semanas',
        timelineTypical: '6 a 8 semanas',
        timelineDependencies: ['projeto fechado', 'compras basicas', 'condominio liberado'],
        timelineFactors: ['troca de infraestrutura', 'ajustes de pontos tecnicos'],
        variation: 'Pode subir com marcenaria mais sofisticada e bancada especial.',
      }),
      equilibrado: packageEntry({
        rangeLabel: 'R$ 25.000 a R$ 50.000',
        summary: 'Melhor equilibrio entre infraestrutura, marcenaria, bancada e eletrodomesticos.',
        includes: ['marcenaria mais completa', 'bancada de quartzo ou similar', 'revestimento diferenciado', 'ilha pequena quando aplicavel'],
        excludes: ['curadoria premium integral', 'automacao completa'],
        idealFor: 'cozinhas em que uso diario e acabamento precisam subir sem entrar em pacote exclusivo.',
        timelineBase: '8 a 10 semanas',
        timelineTypical: '8 a 10 semanas',
        timelineDependencies: ['medicoes corretas', 'eletrodomesticos definidos', 'aprovacao final de layout'],
        timelineFactors: ['marcenaria integrada', 'marmoraria e eletros especiais'],
        variation: 'Sobe quando ilha, eletros premium e ajustes de exaustao entram no escopo.',
      }),
      superior: packageEntry({
        rangeLabel: 'R$ 50.000 a R$ 90.000',
        summary: 'Pacote com acabamento premium, melhor desenho de marcenaria e infraestrutura mais refinada.',
        includes: ['marcenaria premium', 'pedra superior', 'ilha completa', 'melhor detalhamento de iluminacao e ferragens'],
        excludes: ['curadoria exclusiva com importacao e equipamentos especiais'],
        idealFor: 'cozinhas premium em que a frente de obra precisa conversar com producao sob medida.',
        timelineBase: '10 a 12 semanas',
        timelineTypical: '10 a 12 semanas',
        timelineDependencies: ['escopo congelado', 'fornecedores homologados', 'producao paralela organizada'],
        timelineFactors: ['marmoraria especial', 'eletrodomesticos importados', 'integracoes tecnicas'],
        variation: 'Pode subir com automacao, adega climatizada e marcenaria de maior complexidade.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'Sob consulta, normalmente acima de R$ 90.000',
        summary: 'Curadoria dedicada para cozinhas autorais, com tecnologia e materiais especiais.',
        includes: ['eletrodomesticos premium', 'curadoria de materiais especiais', 'desenho autoral', 'coordenacao executiva dedicada'],
        excludes: ['numero fechado sem projeto e memorial executivo'],
        idealFor: 'clientes que tratam a cozinha como protagonista do projeto.',
        timelineBase: 'sob cronograma dedicado',
        timelineTypical: 'sob cronograma dedicado',
        timelineDependencies: ['layout executivo aprovado', 'fornecedores especiais', 'janela de producao reservada'],
        timelineFactors: ['importacao, automacao, pedras especiais e customizacao elevada'],
        variation: 'Nao publicar fechamento sem leitura executiva e cronograma real de producao.',
      }),
    },
  },
  'reforma-banheiro-moderno': {
    id: 'reforma-banheiro-moderno',
    label: 'Reforma de banheiro moderno 2026',
    nucleus: 'construcao-obra',
    status: 'active',
    measurementLabel: 'por ambiente',
    sourceOfTruth: 'Registry editorial/comercial WG · v2026.05.10',
    sourceReference: '/blog/reforma-banheiro-moderno-2026',
    articleBindings: ['reforma-banheiro-moderno-2026', 'reforma-banheiro-pequeno-otimizacao'],
    variationFactors: [
      'impermeabilizacao e condicoes da infraestrutura existente',
      'nivel de loucas, metais, pedras e iluminacao',
      'presenca de banheira, aquecimento e automacao',
      'restricoes de acesso, descarte e logistica do condominio',
    ],
    observations: [
      'Banheiro exige governanca de impermeabilizacao, ventilacao e sequencia de instalacao.',
      'O barato costuma sair caro quando loucas, metais e infraestrutura sao tratados sem compatibilizacao.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: 'R$ 8.000 a R$ 15.000',
        summary: 'Atualizacao funcional com loucas padrao e materiais de manutencao mais simples.',
        includes: ['revestimento funcional', 'loucas padrao', 'metais simples', 'box e iluminacao basica'],
        excludes: ['banheira, aquecimento e automacao'],
        idealFor: 'lavabos e banheiros compactos com foco em renovacao objetiva.',
        timelineBase: '3 a 4 semanas',
        timelineTypical: '3 a 4 semanas',
        timelineDependencies: ['infraestrutura em bom estado', 'materiais definidos cedo'],
        timelineFactors: ['impermeabilizacao extra', 'ajuste de pontos hidraulicos'],
        variation: 'Pode subir com troca maior de infraestrutura ou pedra especial.',
      }),
      equilibrado: packageEntry({
        rangeLabel: 'R$ 15.000 a R$ 35.000',
        summary: 'Melhor composicao entre revestimento, bancada, iluminacao e metais.',
        includes: ['porcelanato retificado', 'loucas de design', 'nicho embutido', 'bancada mais refinada'],
        excludes: ['banheira premium', 'automacao completa'],
        idealFor: 'banheiros sociais e suites que pedem acabamento acima do basico sem pacote extremo.',
        timelineBase: '4 a 5 semanas',
        timelineTypical: '4 a 5 semanas',
        timelineDependencies: ['layout validado', 'pedra e metais fechados', 'sequencia de instalacao organizada'],
        timelineFactors: ['troca de layout, nichos, marcenaria e ventilacao'],
        variation: 'Sobe com pedra nobre, metais especiais e adequacao estrutural.',
      }),
      superior: packageEntry({
        rangeLabel: 'R$ 35.000 a R$ 55.000',
        summary: 'Pacote premium com pedra nobre, melhores metais e leitura de conforto mais sofisticada.',
        includes: ['pedras nobres', 'metais premium', 'iluminacao em camadas', 'melhor integracao de bancada e box'],
        excludes: ['banheira especial, automacao total e itens importados raros'],
        idealFor: 'suites premium em que conforto, durabilidade e acabamento precisam subir juntos.',
        timelineBase: '5 a 6 semanas',
        timelineTypical: '5 a 6 semanas',
        timelineDependencies: ['impermeabilizacao validada', 'loucas e metais definidos', 'pedra reservada'],
        timelineFactors: ['banho duplo, bancada especial, marcenaria e iluminacao tecnica'],
        variation: 'Pode subir com ducha dupla, pedra importada e ajustes de infraestrutura.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'Sob consulta, normalmente acima de R$ 55.000',
        summary: 'Banheiro autoral com tecnologia, pedras especiais e leitura de spa privado.',
        includes: ['banheira, automacao, metais especiais', 'curadoria dedicada de materiais', 'execucao premium'],
        excludes: ['fechamento sem levantamento tecnico e sem memorial validado'],
        idealFor: 'banheiros master com leitura cenica, conforto elevado e detalhamento raro.',
        timelineBase: 'sob cronograma dedicado',
        timelineTypical: 'sob cronograma dedicado',
        timelineDependencies: ['escopo executivo fechado', 'fornecedores especiais', 'compatibilizacao fina'],
        timelineFactors: ['banheira, aquecimento, automacao e importacao'],
        variation: 'Nao publicar numero fechado sem visita, especificacao e cronograma real.',
      }),
    },
  },
  'reforma-apartamento-turn-key-sp': {
    id: 'reforma-apartamento-turn-key-sp',
    label: 'Reforma de apartamento SP · Turn Key',
    nucleus: 'projetos-engenharia',
    status: 'active',
    measurementLabel: 'por m2',
    sourceOfTruth: 'Registry comercial WG · paginas de servico v2026.05.10',
    sourceReference: '/reforma-apartamento-sp',
    pageBindings: ['/reforma-apartamento-sp'],
    variationFactors: [
      'metragem, tipologia e bairro',
      'nivel de marcenaria, automacao e pedra',
      'integração entre projeto, obra e compras',
      'prazo exigido e regras do condominio',
    ],
    observations: [
      'Pagina de servico trabalha com leitura de pacote Turn Key, nao apenas com ICCRI generico.',
      'Valor final depende de visita, escopo congelado e cronograma executivo.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: 'R$ 2.500 a R$ 4.000 por m2',
        summary: 'Pacote de entrada para reforma guiada com boa base funcional e marcenaria planejada essencial.',
        includes: ['projeto arquitetonico', 'reforma civil', 'marcenaria planejada essencial'],
        excludes: ['automacao completa', 'curadoria premium extensa'],
        idealFor: 'apartamentos que precisam sair do padrao construtora com leitura organizada de custo e obra.',
        timelineBase: '12 a 16 semanas',
        timelineTypical: '12 a 16 semanas',
        timelineDependencies: ['briefing aprovado', 'escopo inicial definido', 'condominio liberado'],
        timelineFactors: ['troca de layout, compras e marcenaria'],
        variation: 'Pode subir com melhor nivel de marcenaria, pedra e infraestrutura.',
      }),
      equilibrado: packageEntry({
        rangeLabel: 'R$ 4.000 a R$ 6.500 por m2',
        summary: 'Leitura equilibrada entre projeto, obra, acabamento e producao sob medida.',
        includes: ['projeto mais completo', 'melhores acabamentos', 'marcenaria sob medida', 'automacao basica'],
        excludes: ['curadoria ultra premium e importacao especial'],
        idealFor: 'apartamentos em que funcionalidade, acabamento e leitura de valorizacao precisam subir juntos.',
        timelineBase: '14 a 20 semanas',
        timelineTypical: '14 a 20 semanas',
        timelineDependencies: ['projeto executivo, compras, fornecedores e medicao coordenados'],
        timelineFactors: ['marmoraria, automacao, integracoes sob medida'],
        variation: 'Sobe com maior personalizacao, integracoes e condominio mais restritivo.',
      }),
      superior: packageEntry({
        rangeLabel: 'R$ 6.500 a R$ 9.000 por m2',
        summary: 'Pacote premium com acabamento elevado, tecnologia e curadoria mais fina.',
        includes: ['acabamentos premium', 'tecnologia completa', 'curadoria personalizada', 'coordenacao executiva mais intensa'],
        excludes: ['escopo autoral raro com importacao especial sob consulta exclusiva'],
        idealFor: 'apartamentos premium em que a experiencia final depende de execucao altamente coordenada.',
        timelineBase: '18 a 24 semanas',
        timelineTypical: '18 a 24 semanas',
        timelineDependencies: ['escopo congelado', 'fornecedores homologados', 'compras antecipadas'],
        timelineFactors: ['importacao, marcenaria complexa, automacao e pedra especial'],
        variation: 'Pode subir com itens raros, desenho autoral e obra com logistica delicada.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'Sob consulta, com leitura executiva dedicada',
        summary: 'Escopo de alto nivel com configuracao autoral, cronograma premium e equipe dedicada.',
        includes: ['curadoria integral', 'projeto + obra + entrega premium', 'interface fina entre todas as frentes'],
        excludes: ['orcamento fechado sem visita e sem memorial executivo'],
        idealFor: 'ativos de alto valor em que design, obra, marcenaria e tecnologia precisam operar como sistema unico.',
        timelineBase: 'sob cronograma dedicado',
        timelineTypical: 'sob cronograma dedicado',
        timelineDependencies: ['visita, escopo, cronograma e supply chain dedicados'],
        timelineFactors: ['importacao, automacao avançada, materiais raros e regras de condominio'],
        variation: 'Nao publicar faixa fechada sem leitura executiva validada.',
      }),
    },
  },
  'varanda-gourmet-planejada': {
    id: 'varanda-gourmet-planejada',
    label: 'Varanda gourmet planejada',
    nucleus: 'projetos-engenharia',
    status: 'active',
    measurementLabel: 'por ambiente',
    sourceOfTruth: 'Governanca editorial/comercial WG · varanda gourmet v2026.05.10',
    sourceReference: '/blog/varanda-gourmet-planejamento',
    articleBindings: ['varanda-gourmet-planejamento'],
    variationFactors: [
      'tipo de churrasqueira, bancada e marcenaria externa',
      'cobertura, fechamento em vidro e climatizacao',
      'infraestrutura eletrica, hidraulica e exaustao',
      'metragem util, condominio e nivel de acabamento',
    ],
    observations: [
      'Varanda gourmet deve ser tratada como ambiente integrado, nao como soma solta de itens de lazer.',
      'Valor final depende da interface com cozinha, area tecnica, exaustao e marcenaria externa.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: 'R$ 15.000 a R$ 30.000',
        summary: 'Configuracao mais enxuta com churrasqueira objetiva, bancada funcional e mobiliario de entrada.',
        includes: ['churrasqueira simples', 'bancada funcional', 'iluminacao basica', 'acabamento externo de boa manutencao'],
        excludes: ['fechamento completo em vidro', 'automacao', 'cozinha externa mais complexa'],
        idealFor: 'apartamentos e casas que querem ativar a varanda sem transformar o ambiente em mini cozinha completa.',
        timelineBase: '4 a 6 semanas',
        timelineTypical: '4 a 6 semanas',
        timelineDependencies: ['infraestrutura existente aprovada', 'layout definido', 'condominio liberado'],
        timelineFactors: ['ajustes de ponto, cobertura leve e mobiliario sob medida'],
        variation: 'Pode subir quando a varanda exige nova infraestrutura, marcenaria externa ou fechamento adicional.',
      }),
      equilibrado: packageEntry({
        rangeLabel: 'R$ 40.000 a R$ 80.000',
        summary: 'Melhor equilibrio entre bancada, cobertura, iluminacao, mobiliario e apoio de cozinha externa.',
        includes: ['bancada maior', 'apoio de eletros', 'melhor cobertura', 'mobiliario mais consistente'],
        excludes: ['automacao integral', 'acabamentos raros e climatizacao premium'],
        idealFor: 'varandas que precisam servir bem o uso social recorrente sem entrar em pacote extremo.',
        timelineBase: '6 a 9 semanas',
        timelineTypical: '6 a 9 semanas',
        timelineDependencies: ['layout executivo', 'pontos tecnicos definidos', 'fornecedores homologados'],
        timelineFactors: ['fechamento em vidro, marcenaria, exaustao e ilha de apoio'],
        variation: 'Sobe quando entram vidro, climatizacao, marcenaria mais densa e bancada especial.',
      }),
      superior: packageEntry({
        rangeLabel: 'R$ 100.000 a R$ 200.000',
        summary: 'Ambiente premium com cozinha externa mais robusta, melhores materiais e integracao tecnica mais exigente.',
        includes: ['cozinha externa mais completa', 'melhores materiais', 'iluminacao cenica', 'fechamento e cobertura mais refinados'],
        excludes: ['escopo autoral raro com automacao e equipamentos especiais sob curadoria dedicada'],
        idealFor: 'varandas premium que funcionam como extensao real da area social e pedem alto nivel de acabamento.',
        timelineBase: '8 a 12 semanas',
        timelineTypical: '8 a 12 semanas',
        timelineDependencies: ['escopo congelado', 'fornecedores especiais', 'compatibilizacao com estrutura e exaustao'],
        timelineFactors: ['equipamentos premium, vidro especial, marcenaria externa e automacao'],
        variation: 'Pode subir com churrasqueira de design, cozinha completa e solucoes especiais de cobertura.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'Sob consulta, normalmente acima de R$ 200.000',
        summary: 'Varanda autoral com tecnologia, materiais especiais e integracao total com area social e cozinha.',
        includes: ['curadoria dedicada', 'equipamentos especiais', 'detalhamento autoral', 'coordenacao executiva premium'],
        excludes: ['fechamento sem levantamento tecnico, memorial e cronograma dedicados'],
        idealFor: 'ativos em que a varanda opera como ambiente protagonista e pede execucao sob medida em alto nivel.',
        timelineBase: 'sob cronograma dedicado',
        timelineTypical: 'sob cronograma dedicado',
        timelineDependencies: ['escopo executivo fechado', 'estrutura validada', 'supply chain homologado'],
        timelineFactors: ['importacao, climatizacao, automacao e detalhes especiais de marcenaria e pedra'],
        variation: 'Nao publicar fechamento sem leitura executiva e compatibilizacao completa.',
      }),
    },
  },
  'automacao-residencial-sp': {
    id: 'automacao-residencial-sp',
    label: 'Automacao residencial integrada',
    nucleus: 'automacao-tecnologia',
    status: 'pending_source',
    measurementLabel: 'por composicao',
    sourceOfTruth: 'Base interna automacao (pricelist_itens + iccri_servicos) ainda em higienizacao operacional; preco publico bloqueado ate homologacao WG',
    sourceReference: '/blog/automacao-residencial-2026-guia',
    articleBindings: ['automacao-residencial-2026-guia'],
    variationFactors: [
      'quantidade de pontos, modulos e cenas',
      'presenca de central dedicada, audio/video e seguranca',
      'cortinas motorizadas, climatizacao e integracao com iluminacao',
      'infraestrutura previa, marcenaria, forro e quadro eletrico',
    ],
    observations: [
      'Automacao residencial ainda nao possui faixa publica homologada unica nesta camada.',
      'Enquanto a base nao estiver consolidada, o blog deve publicar apenas leitura de escopo, dependencias e criterio de decisao.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: 'Leitura enxuta por pontos e dispositivos de entrada',
        summary: 'Automacao de entrada com foco em poucos pontos, conforto basico e ativacao sem grande centralizacao.',
        includes: ['pontos basicos de comando', 'entrada por voz/app', 'escopo limitado a ambientes prioritarios'],
        excludes: ['central robusta, audio/video integrado e infraestrutura mais extensa'],
        idealFor: 'quem quer testar automacao em poucos ambientes sem transformar a casa em sistema central completo.',
        timelineBase: 'sob cronograma leve de infraestrutura',
        timelineTypical: 'sob cronograma leve de infraestrutura',
        timelineDependencies: ['levantamento de pontos', 'wifi robusto', 'compatibilizacao minima'],
        timelineFactors: ['forro, eletrica existente e compatibilidade dos dispositivos'],
        variation: 'Publicacao de preco bloqueada ate a consolidacao da base oficial por pontos, central e ambientes.',
      }),
      equilibrado: packageEntry({
        rangeLabel: 'Leitura integrada para ambientes sociais e rotina recorrente',
        summary: 'Automacao mais coerente para iluminacao, climatizacao, seguranca e alguns acionamentos centralizados.',
        includes: ['mais pontos integrados', 'cenas reais de uso', 'melhor leitura de infraestrutura'],
        excludes: ['rollout high-end completo, audio multiroom e automacao autoral extrema'],
        idealFor: 'obras que ja precisam compatibilizar automacao com eletrica, marcenaria, forro e climatizacao.',
        timelineBase: 'sob cronograma coordenado de obra',
        timelineTypical: 'sob cronograma coordenado de obra',
        timelineDependencies: ['quadro eletrico definido', 'fornecedores homologados', 'layout executivo'],
        timelineFactors: ['quantidade de ambientes, cortinas motorizadas e integracoes adicionais'],
        variation: 'A composicao cresce conforme o numero de ambientes, cenas, pontos e modulos de integracao.',
      }),
      superior: packageEntry({
        rangeLabel: 'Leitura premium com central, integracao tecnica e mais ambientes',
        summary: 'Camada premium para residencias que exigem mais estabilidade, centralizacao e interface entre varias disciplinas.',
        includes: ['central dedicada', 'maior numero de pontos', 'cenas mais completas', 'integracao tecnica mais exigente'],
        excludes: ['solucao autoral rarissima com supply chain especial e rollout enterprise'],
        idealFor: 'casas e apartamentos premium em que automacao ja impacta obra, marcenaria, iluminacao e experiencia final.',
        timelineBase: 'sob cronograma executivo com integracao entre disciplinas',
        timelineTypical: 'sob cronograma executivo com integracao entre disciplinas',
        timelineDependencies: ['escopo congelado', 'infraestrutura validada', 'fornecedores e protocolos definidos'],
        timelineFactors: ['audio/video, seguranca, cortinas, climatizacao e quantidade de cenas'],
        variation: 'So deve ganhar preco publico quando a base oficial separar com confianca pontos, central e infraestrutura.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'Sob composicao dedicada e homologacao tecnica completa',
        summary: 'Frente autoral e de alta complexidade para projetos em que tecnologia vira parte estrutural da experiencia.',
        includes: ['desenho dedicado', 'curadoria de stack', 'integracao ampla entre sistemas'],
        excludes: ['publicacao automatica de valor sem base consolidada e homologada'],
        idealFor: 'ativos residenciais em que automacao deixa de ser acessorio e passa a guiar a experiencia do espaco.',
        timelineBase: 'sob cronograma dedicado',
        timelineTypical: 'sob cronograma dedicado',
        timelineDependencies: ['escopo executivo fechado', 'stack homologado', 'coordenação fina entre disciplinas'],
        timelineFactors: ['protocolos, importacao, suporte e profundidade de integracao'],
        variation: 'Preco publico permanece bloqueado ate a governanca comercial consolidar essa frente sem ruido.',
      }),
    },
  },
  'obraeasy-evf-saas': {
    id: 'obraeasy-evf-saas',
    label: 'ObraEasy · EVF e gestao de obras',
    nucleus: 'automacao-tecnologia',
    status: 'active',
    measurementLabel: 'por assinatura',
    sourceOfTruth: 'WGEasy / saas_planos auditado por audit:wgeasy:site-sync · v2026.05.10',
    sourceReference: '/obraeasy',
    articleBindings: ['evf-estudo-viabilidade-financeira', 'obraeasy-como-funciona-para-clientes-finais'],
    variationFactors: [
      'volume de projetos simultaneos',
      'nivel de acompanhamento operacional desejado',
      'necessidade de uso por cliente final, escritorio ou equipe ampliada',
      'ativacao de recursos adicionais fora do plano publico base',
    ],
    observations: [
      'Os valores publicos do ObraEasy devem bater com src/data/companyPublic.js e com a auditoria WGEasy x site.',
      'Publicacao de planos SaaS exige revisao conjunta entre site, saas_planos e checkout real.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: OBRAEASY_PRECOS.free.price,
        summary: 'Entrada gratuita para conhecer EVF, metodologia e primeiros fluxos do ecossistema.',
        includes: ['acesso inicial', 'contato com a metodologia', 'entrada de aquisicao'],
        excludes: ['operacao ampliada e suporte mais intenso'],
        idealFor: 'quem esta validando aderencia antes de subir para uso recorrente.',
        timelineBase: 'ativacao imediata',
        timelineTypical: 'ativacao imediata',
        timelineDependencies: ['cadastro valido', 'fluxo de acesso ativo'],
        timelineFactors: ['liberacao operacional e jornada de onboarding'],
        variation: 'Nao ha valor mensal nesta faixa; ela funciona como entrada de aquisicao.',
      }),
      equilibrado: packageEntry({
        rangeLabel: `${OBRAEASY_PRECOS.pro.price}/mes`,
        summary: 'Plano Pro com leitura operacional e EVF para uso individual ou operacao mais enxuta.',
        includes: ['EVF completo', 'rotina basica de gestao', 'acompanhamento essencial'],
        excludes: ['escala ampliada e suporte prioritario de negocio'],
        idealFor: 'profissional, autonomo ou cliente final com operacao mais simples e poucos projetos simultaneos.',
        timelineBase: 'ativacao imediata',
        timelineTypical: 'ativacao imediata',
        timelineDependencies: ['conta ativa', 'pagamento confirmado'],
        timelineFactors: ['onboarding e configuracao inicial'],
        variation: 'Valor publico auditado contra WGEasy; nao alterar sem passar pela auditoria de sync.',
      }),
      superior: packageEntry({
        rangeLabel: `${OBRAEASY_PRECOS.business.price}/mes`,
        summary: 'Plano Business para operacao recorrente com mais escala, apoio e leitura de gestao.',
        includes: ['tudo do Pro', 'rotina mais robusta', 'escala ampliada', 'prioridade operacional'],
        excludes: ['customizacao enterprise fora do plano publico base'],
        idealFor: 'escritorios, pequenas construtoras e operacoes com mais projetos ou maior recorrencia.',
        timelineBase: 'ativacao imediata',
        timelineTypical: 'ativacao imediata',
        timelineDependencies: ['cadastro homologado', 'pagamento ativo'],
        timelineFactors: ['volume de equipe e configuracao de operacao'],
        variation: 'Faixa publica homologada; qualquer mudanca precisa bater com checkout real e WGEasy.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'Sob consulta para operacao dedicada',
        summary: 'Configuracao dedicada para necessidades especiais, integracoes ou rollout comercial ampliado.',
        includes: ['leitura consultiva dedicada', 'avaliacao de operacao especial', 'escopo sob consulta'],
        excludes: ['publicacao automatica de valor sem politica comercial validada'],
        idealFor: 'operacoes que pedem rollout customizado, integracoes ou apoio comercial dedicado.',
        timelineBase: 'sob ativacao dedicada',
        timelineTypical: 'sob ativacao dedicada',
        timelineDependencies: ['escopo comercial aprovado', 'capacidade operacional confirmada'],
        timelineFactors: ['integracoes, treinamento e rollout ampliado'],
        variation: 'Nao publicar valor fechado sem confirmacao formal da politica comercial vigente.',
      }),
    },
  },
  'obraeasy-parcerias-imobiliarias': {
    id: 'obraeasy-parcerias-imobiliarias',
    label: 'ObraEasy · programa de parceiros',
    nucleus: 'consultoria-planejamento',
    status: 'active',
    measurementLabel: 'por programa',
    sourceOfTruth: 'Politica comercial versionada do programa de parceiros ObraEasy · v2026.05.10',
    sourceReference: '/blog/obraeasy-para-parceiros-imobiliarias-corretores',
    articleBindings: ['obraeasy-para-parceiros-imobiliarias-corretores'],
    variationFactors: [
      'volume anual de indicacoes homologadas',
      'taxa real de conversao em obra contratada',
      'necessidade de materiais comerciais e apoio dedicado',
      'modelo de parceria e nivel de ativacao conjunta',
    ],
    observations: [
      'Comissao de parceiro deve ser publicada apenas como politica comercial vigente e versionada.',
      'Simulacoes de ganho anual sao orientativas e nao substituem validacao comercial real.',
    ],
    packages: {
      essencial: packageEntry({
        rangeLabel: '2% da obra · 1 a 5 indicacoes/ano',
        summary: 'Entrada do programa com acesso ao ecossistema e ativacao comercial inicial.',
        includes: ['acesso ao ObraEasy', 'calculadora AVM', 'rotina inicial de parceria'],
        excludes: ['materiais dedicados e gerencia comercial especial'],
        idealFor: 'corretores e imobiliarias que estao validando o canal com baixo volume inicial.',
        timelineBase: 'ativacao apos homologacao',
        timelineTypical: 'ativacao apos homologacao',
        timelineDependencies: ['cadastro aprovado', 'alinhamento comercial', 'primeiras indicacoes'],
        timelineFactors: ['ritmo de indicacoes e taxa de conversao'],
        variation: 'Comissao depende de obra efetivamente contratada e regras vigentes do programa.',
      }),
      equilibrado: packageEntry({
        rangeLabel: '3% da obra · 6 a 15 indicacoes/ano',
        summary: 'Faixa mais estruturada para parceiros com recorrencia maior e melhor ativacao comercial.',
        includes: ['tudo da faixa inicial', 'materiais de marketing', 'apoio de operacao mais consistente'],
        excludes: ['gerente dedicado e acordos especiais de co-branding'],
        idealFor: 'operacoes imobiliarias que ja tem recorrencia de indicacao e querem capturar mais valor.',
        timelineBase: 'ativacao apos homologacao',
        timelineTypical: 'ativacao apos homologacao',
        timelineDependencies: ['cadastro homologado', 'volume recorrente', 'rotina comercial ativa'],
        timelineFactors: ['qualidade do funil, taxa de fechamento e continuidade da parceria'],
        variation: 'Pode variar conforme politica comercial vigente e reclassificacao de faixa por volume real.',
      }),
      superior: packageEntry({
        rangeLabel: '5% da obra · 16+ indicacoes/ano',
        summary: 'Faixa de alta recorrencia com apoio mais proximo e maior captura de valor por parceria.',
        includes: ['tudo das faixas anteriores', 'apoio comercial ampliado', 'co-branding e operacao mais proxima'],
        excludes: ['condicoes fora da politica homologada sem aprovacao formal'],
        idealFor: 'parceiros com operacao recorrente e canal ativo de captacao de obras qualificadas.',
        timelineBase: 'ativacao apos homologacao',
        timelineTypical: 'ativacao apos homologacao',
        timelineDependencies: ['historico comprovado', 'volume recorrente', 'alinhamento comercial formal'],
        timelineFactors: ['qualidade das indicacoes, conversao e suporte necessario'],
        variation: 'A permanencia na faixa depende do volume real homologado e das regras do programa.',
      }),
      exclusivo: packageEntry({
        rangeLabel: 'Sob politica dedicada de parceria',
        summary: 'Modelo especial para canais estrategicos, franquias, squads imobiliarios ou co-branding ampliado.',
        includes: ['avaliacao dedicada', 'condicao especial sob consulta', 'desenho comercial customizado'],
        excludes: ['publicacao automatica sem aprovacao formal da politica vigente'],
        idealFor: 'operacoes estrategicas que exigem desenho comercial e acompanhamento dedicados.',
        timelineBase: 'sob ativacao dedicada',
        timelineTypical: 'sob ativacao dedicada',
        timelineDependencies: ['escopo homologado', 'volume projetado', 'aprovação comercial formal'],
        timelineFactors: ['capilaridade da operacao, integracoes e necessidade de apoio especial'],
        variation: 'Nao publicar percentual fechado sem aprovacao comercial formal e registro versionado.',
      }),
    },
  },
  'cacamba-residuos-sp': {
    id: 'cacamba-residuos-sp',
    label: 'Cacamba e residuos',
    nucleus: 'cacamba-residuos',
    status: 'pending_source',
    measurementLabel: 'por retirada',
    sourceOfTruth: 'pendente de base oficial operacional',
    observations: [
      'Nao ha valor oficial consolidado e versionado nesta copia do projeto.',
      'Publicacao de preco para cacamba/residuos permanece bloqueada ate fonte de verdade operacional ser conectada.',
    ],
    packages: {},
  },
};

const mergePackageEntry = (baseEntry = {}, snapshotEntry = {}) => ({
  ...baseEntry,
  ...snapshotEntry,
});

const mergeServiceEntry = (baseService = {}, snapshotService = {}) => {
  const basePackages = baseService.packages;
  const snapshotPackages = snapshotService.packages || {};
  const mergedSnapshotPackages = Object.fromEntries(
    Object.entries(snapshotPackages).map(([packageKey, snapshotEntry]) => [
      packageKey,
      mergePackageEntry(basePackages?.[packageKey], snapshotEntry),
    ])
  );

  return {
    ...baseService,
    ...snapshotService,
    packages: basePackages ? { ...basePackages, ...mergedSnapshotPackages } : mergedSnapshotPackages,
  };
};

export const COMMERCIAL_SERVICE_REGISTRY = Object.entries(COMMERCIAL_SERVICE_REGISTRY_BASE).reduce(
  (accumulator, [serviceId, baseService]) => {
    const snapshotService = COMMERCIAL_GOVERNANCE_GENERATED?.services?.[serviceId] || {};
    accumulator[serviceId] = mergeServiceEntry(baseService, snapshotService);
    return accumulator;
  },
  {}
);

export const ARTICLE_COMMERCIAL_BINDINGS = {
  'tabela-precos-reforma-2026-iccri': { serviceId: 'iccri-reforma-civil-sp', packageFocus: 'superior' },
  'custo-reforma-m2-sao-paulo': { serviceId: 'iccri-reforma-civil-sp', packageFocus: 'equilibrado' },
  'como-calcular-custo-de-obra': { serviceId: 'iccri-reforma-civil-sp', packageFocus: 'equilibrado' },
  'custo-marcenaria-planejada': { serviceId: 'marcenaria-sob-medida', packageFocus: 'equilibrado' },
  'marcenaria-sob-medida': { serviceId: 'marcenaria-sob-medida', packageFocus: 'equilibrado' },
  'marcenaria-sob-medida-tendencias-2026': { serviceId: 'marcenaria-sob-medida', packageFocus: 'superior' },
  'closet-planejado-organizacao-otimizacao': { serviceId: 'marcenaria-sob-medida', packageFocus: 'equilibrado' },
  'reforma-cozinha-planejada-guia-completo': { serviceId: 'reforma-cozinha-planejada', packageFocus: 'equilibrado' },
  'reforma-banheiro-moderno-2026': { serviceId: 'reforma-banheiro-moderno', packageFocus: 'equilibrado' },
  'reforma-banheiro-pequeno-otimizacao': { serviceId: 'reforma-banheiro-moderno', packageFocus: 'equilibrado' },
  'quanto-custa-reformar-apartamento-2026': { serviceId: 'reforma-apartamento-turn-key-sp', packageFocus: 'equilibrado' },
  'quanto-custa-reforma-apartamento-100m2': { serviceId: 'reforma-apartamento-turn-key-sp', packageFocus: 'equilibrado' },
  'custo-reforma-apartamento-alto-padrao-sp': { serviceId: 'reforma-apartamento-turn-key-sp', packageFocus: 'superior' },
  'o-que-e-turn-key': { serviceId: 'reforma-apartamento-turn-key-sp', packageFocus: 'superior' },
  'custo-construcao-reforma-2026-guia-tecnico-completo': { serviceId: 'iccri-reforma-civil-sp', packageFocus: 'equilibrado' },
  'evf-estudo-viabilidade-financeira': { serviceId: 'obraeasy-evf-saas', packageFocus: 'equilibrado' },
  'obraeasy-como-funciona-para-clientes-finais': { serviceId: 'obraeasy-evf-saas', packageFocus: 'equilibrado' },
  'obraeasy-para-parceiros-imobiliarias-corretores': { serviceId: 'obraeasy-parcerias-imobiliarias', packageFocus: 'equilibrado' },
  'varanda-gourmet-planejamento': { serviceId: 'varanda-gourmet-planejada', packageFocus: 'equilibrado' },
  'automacao-residencial-2026-guia': { serviceId: 'automacao-residencial-sp', packageFocus: 'equilibrado' },
};

export const COMMERCIAL_SERVICE_OPTIONS = Object.values(COMMERCIAL_SERVICE_REGISTRY).map((service) => ({
  id: service.id,
  label: service.label,
}));

export const COMMERCIAL_PACKAGE_OPTIONS = COMMERCIAL_PACKAGE_ORDER.map((packageKey) => ({
  id: packageKey,
  label: COMMERCIAL_PACKAGE_LABELS[packageKey],
}));

const LEGACY_PACKAGE_PATTERN = /(^|\n)#{2,6}\s+[^\n]*(basic[ao]|b[aá]sic[ao]|intermedi[aá]ri[ao]|medio padr[aã]o|m[eé]dio padr[aã]o|padr[aã]o premium)/i;
const MONEY_PATTERN = /R\$\s*\d/i;

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const getCommercialService = (serviceId = '') =>
  COMMERCIAL_SERVICE_REGISTRY[String(serviceId || '').trim()] || null;

export const getCommercialPackages = (serviceId = '') => {
  const service = getCommercialService(serviceId);
  if (!service?.packages) return [];

  return COMMERCIAL_PACKAGE_ORDER
    .filter((packageKey) => service.packages[packageKey])
    .map((packageKey) => ({
      key: packageKey,
      label: COMMERCIAL_PACKAGE_LABELS[packageKey],
      ...service.packages[packageKey],
    }));
};

const parseRangeNumbersFromLabel = (rangeLabel = '') => {
  const values = Array.from(String(rangeLabel).matchAll(/R\$\s*([\d.]+(?:,\d+)?)/g))
    .map((match) => Number(String(match[1]).replaceAll('.', '').replace(',', '.')))
    .filter((value) => Number.isFinite(value));

  return {
    minValue: values[0] ?? null,
    maxValue: values[1] ?? null,
  };
};

export const getCommercialPackageNumericRange = (serviceId = '', packageKey = '') => {
  const service = getCommercialService(serviceId);
  const packageEntry = service?.packages?.[packageKey];
  if (!packageEntry) return { minValue: null, maxValue: null };

  if (Number.isFinite(packageEntry.minValue) || Number.isFinite(packageEntry.maxValue)) {
    return {
      minValue: Number.isFinite(packageEntry.minValue) ? packageEntry.minValue : null,
      maxValue: Number.isFinite(packageEntry.maxValue) ? packageEntry.maxValue : null,
    };
  }

  return parseRangeNumbersFromLabel(packageEntry.rangeLabel);
};

export const resolveCommercialProfile = (article = {}) => {
  const explicit = article.commercialProfile || {};
  const binding = ARTICLE_COMMERCIAL_BINDINGS[article.slug] || {};
  const serviceId = explicit.serviceId || binding.serviceId || '';
  const packageFocus = explicit.packageFocus || binding.packageFocus || '';
  const service = getCommercialService(serviceId);
  const packages = getCommercialPackages(serviceId);

  return {
    serviceId,
    packageFocus,
    service,
    packages,
    sourceOfTruth: service?.sourceOfTruth || '',
  };
};

export const getCommercialPublicationValidation = (article = {}) => {
  const profile = resolveCommercialProfile(article);
  const content = String(article.content || '');
  const errors = [];
  const warnings = [];

  if (profile.serviceId && !profile.service) {
    errors.push(`Servico comercial inexistente: ${profile.serviceId}.`);
  }

  if (
    profile.service?.status === 'pending_source' &&
    String(article.status || '').toLowerCase() === 'published' &&
    MONEY_PATTERN.test(content)
  ) {
    errors.push(`Servico ${profile.service.label} ainda nao possui fonte oficial de verdade e nao pode ser publicado com preco.`);
  }

  if (profile.packageFocus && profile.service && !profile.service.packages?.[profile.packageFocus]) {
    errors.push(`Pacote foco invalido para ${profile.service.label}: ${profile.packageFocus}.`);
  }

  if (!profile.serviceId && MONEY_PATTERN.test(content)) {
    errors.push('Conteudo possui valores monetarios publicos sem vinculo a uma base comercial central.');
  }

  if (LEGACY_PACKAGE_PATTERN.test(content)) {
    errors.push('Conteudo ainda usa nomenclatura comercial legada fora da regua Essencial / Equilibrado / Superior / Exclusivo.');
  }

  if (profile.serviceId && !MONEY_PATTERN.test(content)) {
    warnings.push('Post vinculado a servico oficial sem citar faixas no corpo. Considere apoiar a leitura com bloco comercial padrao.');
  }

  return {
    ...profile,
    errors,
    warnings,
    hasBlockingErrors: errors.length > 0,
  };
};

const getPackageLabel = (serviceId, packageKey) => {
  const service = getCommercialService(serviceId);
  if (!service?.packages?.[packageKey]) return '';
  return COMMERCIAL_PACKAGE_LABELS[packageKey] || packageKey;
};

const getPackageValue = (serviceId, packageKey, field) => {
  const service = getCommercialService(serviceId);
  return service?.packages?.[packageKey]?.[field] || '';
};

const getMaterialValue = (serviceId, materialKey) => {
  const service = getCommercialService(serviceId);
  return service?.materialReferences?.[materialKey]?.rangeLabel || '';
};

export const resolveCommercialTokens = (markdown = '', article = {}) =>
  String(markdown || '').replace(/\{\{([A-Z_]+):([^}:]+)(?::([^}]+))?\}\}/g, (_match, token, arg1, arg2) => {
    if (token === 'COMMERCIAL_RANGE') return getPackageValue(arg1, arg2, 'rangeLabel') || _match;
    if (token === 'COMMERCIAL_TIMELINE') return getPackageValue(arg1, arg2, 'timelineTypical') || _match;
    if (token === 'COMMERCIAL_TIMELINE_BASE') return getPackageValue(arg1, arg2, 'timelineBase') || _match;
    if (token === 'COMMERCIAL_SUMMARY') return getPackageValue(arg1, arg2, 'summary') || _match;
    if (token === 'COMMERCIAL_IDEAL_FOR') return getPackageValue(arg1, arg2, 'idealFor') || _match;
    if (token === 'COMMERCIAL_LABEL') return getPackageLabel(arg1, arg2) || _match;
    if (token === 'COMMERCIAL_SOURCE') return getCommercialService(arg1)?.sourceOfTruth || _match;
    if (token === 'COMMERCIAL_MATERIAL_RANGE') return getMaterialValue(arg1, arg2) || _match;
    if (token === 'COMMERCIAL_DEFAULT_RANGE') {
      const profile = resolveCommercialProfile(article);
      const packageKey = arg1 || profile.packageFocus;
      return getPackageValue(profile.serviceId, packageKey, 'rangeLabel') || _match;
    }
    return _match;
  });
