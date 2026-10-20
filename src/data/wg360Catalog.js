/**
 * Catálogo WG 360 — proposta modelo, NÃO oferta contratual.
 * Bases consultadas: WGEasy Core Hub (gestão interna), 15-app-propostas
 * (protótipo de proposta local), docs de mentoria e método comercial WG.
 * Nenhum módulo é apresentado como integração operante no ambiente do cliente.
 */
const define = (id, title, description, deliverable, maturity = 'projeto', stage = 'implantacao') =>
  ({ id, title, description, deliverable, maturity, stage })

export const WG360_CATALOG = [
  {
    id: 'mentoria', number: '01', name: 'Mentoria e estratégia', subtitle: 'Começamos pelo negócio, não pela ferramenta.',
    icon: 'compass', accent: '#d46439',
    items: [
      define('MEN-001','Mentoria Estratégica Individual — 8 semanas','Oito encontros 1:1 de 90 minutos com William Almeida, totalizando 12 horas ao vivo.','Diagnóstico orientado, exercícios, IA prática, prioridades e roadmap de evolução.','aprovado','mentoria'),
      define('MEN-002','Diagnóstico 360 da operação','Análise aprofundada do atendimento, gestão, pessoas, indicadores, processos e tecnologia; distinta da reunião inicial.','Mapa de gargalos, maturidade e prioridades a contratar.'),
      define('MEN-003','Plano 30 / 60 / 90 dias','Desenho de sequência executável, responsáveis e critérios de aceite.','Roadmap de implantação e indicadores.'),
      define('MEN-004','Treinamento de líderes e equipe','Capacitação orientada de gestores, comercial e operação, adaptada à adoção das soluções.','Encontros práticos e materiais de uso.'),
      define('MEN-005','Governança e indicadores executivos','Definição de metas, processos de revisão, papéis, rituais e painéis gerenciais.','Quadro de gestão com métricas e responsáveis.'),
    ],
  },
  {
    id: 'marca', number: '02', name: 'Posicionamento, marca e comunicação', subtitle: 'Uma marca consistente com o valor da entrega.', icon: 'sparkles', accent: '#b25f47',
    items: [
      define('MAR-001','Diagnóstico de posicionamento digital','Auditoria de presença online, perfis, linguagem, público e concorrência.','Diretrizes de posicionamento e oportunidades.'),
      define('MAR-002','Estratégia de marca e diferenciação','Proposta de valor, segmentos-alvo, território de comunicação e mensagem central.','Plataforma de marca e tom de voz.'),
      define('MAR-003','Identidade visual e branding','Logo, tipografia, paleta, sistemas de aplicação e consistência nos pontos de contato.','Manual de identidade e arquivos finais acordados.'),
      define('MAR-004','Narrativa comercial e argumentos','Desenvolvimento de histórias, apresentação da empresa, prova e explicação de diferenciais.','Biblioteca de mensagens comerciais aprovadas.'),
      define('MAR-005','Apresentação institucional premium','Pitch deck, portfólio de serviços e materiais de apresentação presencial ou digital.','Apresentação editável e exportável.'),
      define('MAR-006','Material digital, catálogo e propostas','Templates de PDF/HTML, apresentações, capas, folders e documentos comerciais.','Kit de materiais digitais versionados.'),
    ],
  },
  {
    id: 'presenca', number: '03', name: 'Sites e experiência digital', subtitle: 'Transformamos interesse em experiência e contato.', icon: 'monitor-smartphone', accent: '#bd6847',
    items: [
      define('WEB-001','Site institucional sob medida','Arquitetura de informação, design responsivo, portfólio, serviços, contato e performance.','Site publicado em ambiente aprovado, documentação e gestão de conteúdo.'),
      define('WEB-002','Landing pages e funis','Páginas para campanhas com mensagem, prova, CTA, formulários e mensuração.','Landing e plano de teste de conversão.'),
      define('WEB-003','Portfólio e casos autorizados','Estruturação de imagens reais, depoimentos autorizados, filtros e narrativas.','Galeria documentada e permissões de uso.'),
      define('WEB-004','SEO técnico e conteúdo','Indexação, arquitetura, dados estruturados, desempenho, conteúdo e monitoramento.','Plano SEO e ajustes mensuráveis; sem garantia de ranking.'),
      define('WEB-005','Google Perfil da Empresa','Configuração ou otimização de informações públicas, serviços, fotos e avaliações.','Perfil padronizado e checklist de operação.'),
      define('WEB-006','Área do cliente e portal privado','Acesso por autenticação a propostas, status, documentos e comunicações permitidas.','Portal com permissões, testes e limites de acesso.'),
    ],
  },
  {
    id: 'marketing', number: '04', name: 'Redes sociais e crescimento', subtitle: 'Aquisição, conteúdo, relacionamento e mensuração.', icon: 'megaphone', accent: '#cb6933',
    items: [
      define('MKT-001','Estratégia editorial de redes sociais','Pilares, formatos, frequência, linha editorial e calendário orientados ao posicionamento.','Planejamento de conteúdo por canal.'),
      define('MKT-002','Produção de posts e criativos','Criação de artes, roteiros, carrosséis e campanhas conforme volume contratado.','Pacote de peças finalizadas e aprovadas.'),
      define('MKT-003','Roteiros de vídeos curtos','Ganchos, prova, histórias e CTA para lançamentos e remarketing.','Roteiros 9:16 e plano de filmagem.'),
      define('MKT-004','Gestão de tráfego pago','Planejamento, configuração, testes, otimização e relatórios em canais contratados.','Operação mensal com limites definidos e verba de mídia separada.','projeto','recorrente'),
      define('MKT-005','Medição GA4, GTM e pixels','Plano de eventos, UTMs, atribuição e validação no painel real.','Instrumentação e checklist de qualidade de dados.'),
      define('MKT-006','Gestão de relacionamento e reputação','Rotinas de resposta, pós-venda, pesquisa de satisfação e avaliações.','Fluxo de relacionamento com aprovação humana.'),
    ],
  },
  {
    id: 'vendas', number: '05', name: 'CRM, vendas e propostas inteligentes', subtitle: 'Do primeiro contato ao contrato com rastreabilidade.', icon: 'file-text', accent: '#b26b4f',
    items: [
      define('COM-001','CRM e pipeline de oportunidades','Etapas comerciais, responsáveis, histórico e prioridades por negócio.','Pipeline configurado, relatórios e perfis de acesso.'),
      define('COM-002','Atendimento e qualificação assistidos por IA','Organização de briefings, dúvidas e tarefas com revisão dos responsáveis.','Fluxos, instruções e critérios de supervisão.'),
      define('COM-003','Orçamentos e propostas HTML inteligentes','Itens por categorias, quantidades, condições, versões, visualização mobile e PDF.','Modelo de proposta estruturada com preços aprovados e controle de versões.'),
      define('COM-004','Catálogo de produtos e serviços','Códigos, descrições, unidade, composição de preços e critérios de margem.','Catálogo versionado e regras comerciais.'),
      define('COM-005','Aprovação de proposta por link privado','Fluxo de revisão e aceite com token, escopo imutável e rastreabilidade.','Mecanismo sujeito a validação de identidade, privacidade e assinatura.'),
      define('COM-006','Contratos e cobranças pós-aceite','Eventos controlados para documentos, parcelas, marcos e registro comercial.','Processo de transição proposta → contratação.'),
      define('COM-007','Automação de follow-up','Tarefas, alertas e textos de contato sujeitos a aprovações e regras de consentimento.','Sequências comerciais aprovadas e medidas.'),
    ],
  },
  {
    id: 'obra', number: '06', name: 'Planejamento e execução de obras', subtitle: 'Gestão da operação com informações claras.', icon: 'hard-hat', accent: '#a97751',
    items: [
      define('OBR-001','Cadastro de obras e contratos','Estrutura por obra, responsável, escopo, marcos e documentos.','Painel de obras, acessos e histórico.'),
      define('OBR-002','Planejamento de etapas e EAP','Divisão em fases, entregáveis, frentes e dependências.','Estrutura de etapas com responsáveis.'),
      define('OBR-003','Cronograma e caminho crítico','Marcos, relações entre atividades, datas e alertas de desvios.','Cronograma visual com revisão do gestor.'),
      define('OBR-004','Gestão de equipes e tarefas','Distribuição de atividades, checklists, comentários e controle de conclusão.','Painel de tarefas com histórico.'),
      define('OBR-005','Diário de obra, fotos e ocorrências','Registros autorizados, evidências de evolução e informações sobre pendências.','Linha do tempo da obra e anexos protegidos.'),
      define('OBR-006','Medições, quantitativos e custos','Levantamentos, composições e comparações de previsto versus realizado.','Relatórios com origem dos dados e validação técnica.'),
      define('OBR-007','Qualidade, assistência e garantias','Vistorias, não conformidades, assistência e termos de entrega.','Fluxo de chamados e documentos de aceite.'),
    ],
  },
  {
    id: 'suprimentos', number: '07', name: 'Fornecedores, compras e logística', subtitle: 'Preço, prazo, qualidade e responsabilidade.', icon: 'truck', accent: '#8d806d',
    items: [
      define('SUP-001','Cadastro e qualificação de fornecedores','Dados comerciais, categorias de serviço, documentação e níveis de aprovação.','Base de fornecedores com permissões.'),
      define('SUP-002','Cotações comparativas','Solicitações de preço, prazo, condições e comparação sem inventar valores.','Mapa de cotações referenciadas.'),
      define('SUP-003','Pedidos de compra e aprovações','Requisições, alçadas, justificativas, anexos e status.','Fluxo de compras auditável.'),
      define('SUP-004','Materiais e entregas na obra','Listas, requisições, recebimento, conferência e pendências.','Painel de suprimentos por obra.'),
      define('SUP-005','Gestão de parceiros e subcontratados','Contatos, documentação e vínculo com frentes de trabalho.','Controle de parceiros e responsabilidades.'),
    ],
  },
  {
    id: 'pessoas', number: '08', name: 'Pessoas, colaboradores e produtividade', subtitle: 'O sistema organiza o trabalho; pessoas conduzem.', icon: 'users', accent: '#728496',
    items: [
      define('PES-001','Cadastro de colaboradores e equipes','Perfis, funções, dados mínimos e vinculação às obras.','Painel de equipes com acesso restrito.'),
      define('PES-002','Acessos e responsabilidades','Perfis, permissões mínimas, políticas de aprovação e trilhas de auditoria.','Matriz RBAC e testes negativos.'),
      define('PES-003','Onboarding e treinamento','Manuais, tarefas iniciais, procedimentos e capacitação.','Trilha de entrada e materiais aprovados.'),
      define('PES-004','Rotinas, produtividade e indicadores','Medidas operacionais acordadas, atividades e acompanhamentos.','Quadro de acompanhamento sem vigilância indevida.'),
      define('PES-005','Portal do colaborador','Acesso a tarefas, documentos permitidos e notificações de operação.','Portal com autenticação e avaliação de privacidade.'),
    ],
  },
  {
    id: 'financeiro', number: '09', name: 'Financeiro, custos e inteligência de gestão', subtitle: 'Da proposta à margem conhecida.', icon: 'wallet', accent: '#627d7b',
    items: [
      define('FIN-001','Contas a pagar e receber','Lançamentos, vencimentos, baixa, categorias e responsáveis.','Visão de compromissos e recebíveis.'),
      define('FIN-002','Parcelas, cobrança e conciliação','Regras de pagamento, status de cobrança e integração com provedor autorizado.','Fluxo de recebimentos rastreável.'),
      define('FIN-003','Orçamento versus realizado por obra','Previsto, contratado, custo executado e margem do projeto.','Painel de resultado por obra.'),
      define('FIN-004','Fluxo de caixa e previsibilidade','Visão de entradas/saídas, projeções identificadas como hipóteses e alertas.','Demonstrativo gerencial de caixa.'),
      define('FIN-005','Precificação e composições de custo','Regras de custo, impostos informados, margem e aprovações.','Motor de preço com testes e trilhas de mudança.'),
      define('FIN-006','Dashboards e relatórios executivos','Indicadores comerciais, financeiros e operacionais em fontes reconciliadas.','Relatórios com origem e periodicidade definidas.'),
    ],
  },
  {
    id: 'legal', number: '10', name: 'Contratos, jurídico e governança', subtitle: 'Formalização apoiada por tecnologia e responsáveis.', icon: 'shield-check', accent: '#617086',
    items: [
      define('JUR-001','Templates de contrato e aditivos','Modelos parametrizados e fluxo de conferência; conteúdo jurídico com profissional habilitado.','Documentos padronizados sujeitos à revisão jurídica.'),
      define('JUR-002','Assinatura e aceite rastreáveis','Controle de assinatura, identidade, evidências e versão final.','Trilha de aceite e documentação, sob análise jurídica.'),
      define('JUR-003','Gestão de obrigações e vencimentos','Marcos de contratos, garantias, prazos e alertas de responsabilidade.','Calendário de compromissos e riscos.'),
      define('JUR-004','Proteção de dados e privacidade','Mapeamento LGPD, permissões, inventário de dados e retenção.','Plano de privacidade e responsabilidades definido com especialista.'),
      define('JUR-005','Documentos, versões e auditoria','Classificação, acesso, histórico e preservação de evidências.','Governança documental e política de recuperação.'),
    ],
  },
  {
    id: 'ia', number: '11', name: 'Agentes de IA e integração de sistemas', subtitle: 'IA contextual, com ferramentas autorizadas e supervisão.', icon: 'bot', accent: '#8475a0',
    items: [
      define('IA-001','Mapeamento de casos de uso de IA','Priorização por valor, disponibilidade de dados, risco e tempo de revisão.','Matriz de casos de uso por prioridade.'),
      define('IA-002','Assistente comercial e briefing','Leitura de mensagens/dados autorizados para organizar resumos e rascunhos.','Assistente com validação, base e aprovação humana.'),
      define('IA-003','Base de conhecimento e busca RAG','Organização de documentos vigentes para consultas contextualizadas e com referências.','Base aprovada, políticas de acesso e testes de resposta.'),
      define('IA-004','Agentes com ferramentas do negócio','Consultas com permissão mínima, conectores aprovados, logs e limites de ação.','Agente com testes, trilha e aprovação humana.'),
      define('IA-005','Integrações CRM, ERP, API e webhooks','Conectividade avaliada segundo API, licenças, segurança e disponibilidade real.','Conector documentado e homologado por fluxo.'),
      define('IA-006','Automação de rotinas e alertas','Regras delimitadas para preparar tarefas, notificações e ações autorizadas.','Automação testada com fallback, logs e rollback.'),
      define('IA-007','Monitoramento e avaliação de IA','Rubricas, cenários adversos, custos de modelo, qualidade e revisão.','Painel de qualidade e plano de melhoria.'),
    ],
  },
  {
    id: 'infra', number: '12', name: 'Plataforma, arquitetura e infraestrutura', subtitle: 'Tecnologia própria, documentada e sustentável.', icon: 'server', accent: '#5f8294',
    items: [
      define('TEC-001','Arquitetura de solução sob medida','Domínio de dados, desenho dos módulos, integrações e regras de negócio.','Arquitetura e plano técnico de implementação.'),
      define('TEC-002','Aplicação web e painéis operacionais','Desenvolvimento responsivo com interfaces, APIs e fluxos configurados.','Código específico contratado, testes e documentação.'),
      define('TEC-003','Banco de dados, autenticação e permissões','PostgreSQL/Supabase ou stack adequada, RLS, contas, políticas e restauração.','Data plane testado, acesso mínimo e backup.'),
      define('TEC-004','Deploy e observabilidade','Vercel ou stack aprovada, domínio, monitoramento, logs e alertas.','Ambiente produtivo com evidências e rollback.'),
      define('TEC-005','Workspace e colaboração corporativa','Google Workspace, e-mails, arquivos, agenda e permissões empresariais.','Organização de contas e uso seguro.'),
      define('TEC-006','Transferência de repositório e documentação','Entrega de ativos sob medida após quitação segundo contrato, inventário de licenças e handoff.','Repositório, acessos de cliente, documentação e runbook.'),
      define('TEC-007','Segurança, continuidade e backup','Auditorias, testes de restauração, gestão de incidentes e limites de consumo.','Plano operacional, testes e evidências.'),
    ],
  },
  {
    id: 'operacao', number: '13', name: 'Implantação, suporte e evolução', subtitle: 'Não basta entregar a tela: a equipe precisa operar.', icon: 'life-buoy', accent: '#658479',
    items: [
      define('OPS-001','Setup, configuração e migração assistida','Planejamento de dados, implantação em ambiente aprovado, treinamento e aceite.','Go-live acompanhado e checklist de implantação.'),
      define('OPS-002','Operação assistida por 90 dias','Acompanhamento inicial incluído nos projetos de plataforma sob medida contratados, com correções de defeitos de escopo, dúvidas e adoção, conforme limites do contrato.','Plano de acompanhamento de 90 dias a contar do aceite/go-live, com SLAs e limites contratuais.','projeto','pos-venda'),
      define('OPS-003','Suporte e manutenção mensal opcionais','Atendimento contínuo após a janela inicial, atualizações e gestão de incidentes conforme SLA.','Contrato mensal de manutenção e escopo mensurado.','projeto','recorrente'),
      define('OPS-004','Evoluções por sprint e novas integrações','Backlog de melhorias e módulos adicionais com aceite e precificação específica.','Roadmap priorizado por sprint, marcos e custo.'),
      define('OPS-005','Treinamento recorrente e reciclagem','Novos colaboradores, mudanças de processo e evolução da base de conhecimento.','Agenda de capacitação e materiais atualizados.','projeto','recorrente'),
    ],
  },
]

export const WG360_ITEMS = WG360_CATALOG.flatMap(category => category.items.map(item => ({...item,categoryId:category.id,categoryName:category.name})))
export const WG360_BY_ID = Object.fromEntries(WG360_ITEMS.map(item => [item.id,item]))

export const WG360_CROSSSELL = [
  { source:'MEN-001',target:['COM-001','IA-002','WEB-001'],reason:'Da mentoria ao processo comercial implementado.' },
  { source:'MAR-002',target:['WEB-001','MKT-001','MAR-005'],reason:'Uma marca bem definida precisa aparecer com consistência.' },
  { source:'WEB-002',target:['MKT-004','MKT-005','COM-001'],reason:'Página sem tráfego e acompanhamento não fecha o ciclo comercial.' },
  { source:'COM-003',target:['COM-006','JUR-002','FIN-002'],reason:'Aceite de proposta pode orientar formalização e cobrança.' },
  { source:'OBR-003',target:['OBR-004','SUP-004','FIN-003'],reason:'Cronograma se fortalece com tarefas, compras e custos.' },
  { source:'IA-002',target:['IA-003','IA-005','IA-007'],reason:'Assistente ganha utilidade com fontes autorizadas e avaliação.' },
  { source:'TEC-002',target:['OPS-002','TEC-007','OPS-003'],reason:'Implantação precisa de adoção, segurança e continuidade.' },
]
export const WG360_TRAFFIC_POLICY = {
  status:'hipotese_nao_aprovada',
  fixedFee:1500,
  includedAdSpend:10000,
  overThresholdPct:15,
  note:'R$ 1.500/mês para investimento em mídia até R$ 10.000/mês; acima desse valor, 15% do investimento total do mês, mantendo piso de R$ 1.500. Mídia paga diretamente pelo cliente. Proposta sujeita a aprovação.',
}
export function estimateTrafficFee(spend, policy=WG360_TRAFFIC_POLICY){
 const clean=Math.max(0,Number(spend)||0)
 return clean<=policy.includedAdSpend?policy.fixedFee:Math.max(policy.fixedFee,clean*policy.overThresholdPct/100)
}
