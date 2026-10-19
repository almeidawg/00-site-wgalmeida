/**
 * Trilhas editoriais: temas POSSÍVEIS de aprofundamento, não módulos contratados.
 * A mentoria piloto segue com 8 encontros e 12h ao vivo. Não corresponde a
 * 30 entregas, serviços técnicos incluídos, certificação ou diagnóstico pronto.
 */
export const MENTORIA_ABORDAGENS = [
  {
    id: 'direcao', numero: '01', area: 'ESTRATÉGIA', titulo: 'Direção do negócio e prioridades',
    resumo: 'Sair da urgência permanente para entender o que merece atenção primeiro.',
    pergunta: 'Qual problema, se resolvido agora, liberaria mais tempo e resultado?',
    possibilidades: [
      ['Diagnóstico da operação', 'Mapear decisões, gargalos, retrabalho e dependência do fundador.'],
      ['Posicionamento e proposta de valor', 'Entender por que o cliente escolhe sua empresa e onde ela se diferencia.'],
      ['Prioridades e plano de ação', 'Distinguir o urgente do importante e estabelecer próximos passos viáveis.'],
    ],
    exemplo: 'Uma empresa recebe oportunidades, mas cresce sem saber em qual etapa perde margem e tempo.',
    aplicacao: 'Organizar hipóteses e escolher uma prioridade para investigar.',
  },
  {
    id: 'processos', numero: '02', area: 'OPERAÇÃO', titulo: 'Processos, rotinas e equipe',
    resumo: 'Transformar conhecimento disperso em formas de trabalhar mais claras.',
    pergunta: 'O que deixaria de funcionar se uma pessoa-chave se ausentasse?',
    possibilidades: [
      ['Fluxos e checklists', 'Desenhar o caminho de tarefas repetidas, do pedido à conferência.'],
      ['Responsáveis e aprovações', 'Definir quem prepara, decide, executa e valida cada etapa.'],
      ['Gestão de tempo e delegação', 'Criar uma rotina de prioridades, acompanhamentos e decisões.'],
    ],
    exemplo: 'A equipe pergunta tudo ao dono porque responsabilidades e critérios não estão documentados.',
    aplicacao: 'Esboçar um fluxo simples e pontos de responsabilidade.',
  },
  {
    id: 'comercial', numero: '03', area: 'RELACIONAMENTO', titulo: 'Atendimento e oportunidades',
    resumo: 'Dar continuidade às conversas e criar previsibilidade no relacionamento comercial.',
    pergunta: 'Quantos interessados se perdem entre o primeiro contato e a proposta?',
    possibilidades: [
      ['Primeiro contato e briefing', 'Fazer perguntas melhores e registrar o contexto necessário sem excesso de dados.'],
      ['Jornada e pipeline de vendas', 'Visualizar etapas, responsáveis e oportunidades que precisam de retorno.'],
      ['Follow-up e experiência do cliente', 'Planejar comunicações úteis, humanas e autorizadas.'],
    ],
    exemplo: 'Mensagens chegam por canais diferentes e o orçamento nunca é retomado no momento certo.',
    aplicacao: 'Rascunhar um roteiro de atendimento e critérios para a próxima ação.',
  },
  {
    id: 'propostas', numero: '04', area: 'COMERCIAL', titulo: 'Orçamentos, escopo e propostas',
    resumo: 'Melhorar a clareza do que se vende e a segurança do que se promete.',
    pergunta: 'Sua proposta explica tanto o valor entregue quanto o que está fora do escopo?',
    possibilidades: [
      ['Briefing que vira escopo', 'Separar necessidade, premissas, exclusões e etapas de entrega.'],
      ['Composição e defesa de valor', 'Examinar custos, margem, risco e critérios para apresentar a oferta.'],
      ['Versões e negociação', 'Evitar retrabalho com histórico de revisões e alinhamento de expectativas.'],
    ],
    exemplo: 'Duas propostas parecem iguais, mas uma inclui atividades que comprometem toda a margem.',
    aplicacao: 'Revisar a estrutura de uma proposta-modelo, sem criar orçamento vinculante.',
  },
  {
    id: 'obras', numero: '05', area: 'EXECUÇÃO', titulo: 'Planejamento e acompanhamento de obras',
    resumo: 'Conectar prazos, pessoas, materiais e comunicação do canteiro.',
    pergunta: 'Onde um atraso pequeno se transforma em um problema grande?',
    possibilidades: [
      ['Etapas e marcos', 'Dividir a obra em frentes, entregas e dependências compreensíveis.'],
      ['Registro de progresso', 'Usar evidências autorizadas, checklists e alertas de pendências.'],
      ['Mudanças e qualidade', 'Tratar imprevistos, aprovação de mudanças e conferência de entregas.'],
    ],
    exemplo: 'A compra de um material atrasa, mas o impacto só aparece quando a equipe fica parada.',
    aplicacao: 'Examinar um exemplo de fluxo de obra e pontos de controle.',
  },
  {
    id: 'fornecedores', numero: '06', area: 'SUPRIMENTOS', titulo: 'Compras, fornecedores e parceiros',
    resumo: 'Tomar decisões de compras além do menor preço, considerando prazo e qualidade.',
    pergunta: 'Você sabe o custo de uma compra mal especificada ou feita na última hora?',
    possibilidades: [
      ['Solicitação e cotação', 'Comparar especificação, alternativas, prazo, frete e condições.'],
      ['Aprovação e recebimento', 'Organizar pedidos, conferência e registros de não conformidade.'],
      ['Parcerias e subcontratações', 'Definir responsabilidades, documentação e critérios de avaliação.'],
    ],
    exemplo: 'O preço da cotação parecia bom, mas a entrega não atende à etapa da obra.',
    aplicacao: 'Estruturar perguntas e uma matriz simples para comparar decisões de compra.',
  },
  {
    id: 'financas', numero: '07', area: 'GESTÃO', titulo: 'Custos, caixa e indicadores',
    resumo: 'Ganhar visibilidade do que entra, do que sai e do que cada projeto realmente produz.',
    pergunta: 'Faturamento alto significa que a obra foi lucrativa?',
    possibilidades: [
      ['Previsto versus realizado', 'Distinguir orçamento, contratado, medido e efetivamente gasto.'],
      ['Fluxo de caixa e compromissos', 'Antecipar necessidades e observar prazos de recebimento e pagamento.'],
      ['Indicadores que ajudam a decidir', 'Escolher poucos números confiáveis para acompanhar a gestão.'],
    ],
    exemplo: 'A equipe comemora uma venda, mas os custos adicionais consomem o resultado.',
    aplicacao: 'Definir quais dados são necessários para responder a uma pergunta financeira.',
  },
  {
    id: 'marca', numero: '08', area: 'MERCADO', titulo: 'Posicionamento, conteúdo e captação',
    resumo: 'Mostrar o valor do trabalho com coerência e acompanhar o interesse gerado.',
    pergunta: 'Sua presença digital atrai o tipo de projeto que você deseja executar?',
    possibilidades: [
      ['Portfólio e prova de trabalho', 'Escolher como apresentar processos, diferenciais e casos autorizados.'],
      ['Conteúdo que educa o cliente', 'Pensar temas, dúvidas frequentes, canais e consistência de comunicação.'],
      ['Campanhas e mensuração', 'Entender diferença entre alcance, conversa recebida e oportunidade qualificada.'],
    ],
    exemplo: 'Há visualizações nas redes, mas não se sabe quais contatos avançam para o comercial.',
    aplicacao: 'Analisar uma jornada de captação e suas métricas essenciais.',
  },
  {
    id: 'ia', numero: '09', area: 'INTELIGÊNCIA ARTIFICIAL', titulo: 'IA útil, assistentes e automações',
    resumo: 'Aplicar IA com contexto, verificação humana e limites de acesso.',
    pergunta: 'Qual rotina repetitiva vale testar antes de conectar uma ferramenta a tudo?',
    possibilidades: [
      ['Pedidos e revisão de resultados', 'Criar instruções claras e conferir respostas antes de usar.'],
      ['Assistentes com conhecimento autorizado', 'Explorar organização de documentos e busca com referências.'],
      ['Automação e integração consciente', 'Examinar dados, permissões, erros e limites de um possível piloto.'],
    ],
    exemplo: 'Um assistente organiza o briefing, mas a decisão comercial continua com quem responde pela empresa.',
    aplicacao: 'Desenhar um caso de uso supervisionado com critério de sucesso.',
  },
  {
    id: 'governanca', numero: '10', area: 'SUSTENTABILIDADE', titulo: 'Contratos, riscos e evolução',
    resumo: 'Crescer com acordos, documentação e responsabilidade sobre os dados.',
    pergunta: 'O que precisa estar claro antes de uma decisão virar compromisso?',
    possibilidades: [
      ['Contratos e expectativas', 'Reconhecer pontos que precisam de escopo claro e revisão jurídica adequada.'],
      ['Dados, acessos e privacidade', 'Identificar riscos em informações de clientes, equipe e integrações.'],
      ['Evolução após a mentoria', 'Diferenciar aprendizado, melhoria de processo e projeto técnico adicional.'],
    ],
    exemplo: 'Uma integração parece simples, mas depende de consentimento, permissões e aprovação técnica.',
    aplicacao: 'Construir critérios para decidir o que testar, contratar ou adiar.',
  },
]

export const MENTORIA_ABORDAGENS_TOTAL = MENTORIA_ABORDAGENS.reduce(
  (count, area) => count + area.possibilidades.length, 0
)

export const MENTORIA_ABORDAGENS_JORNADAS = [
  {
    titulo: 'Mais clareza para vender',
    etapas: ['Atendimento', 'Briefing', 'Proposta', 'Acompanhamento'],
    contexto: 'Quando oportunidades chegam, mas não seguem uma rotina comercial.',
  },
  {
    titulo: 'Mais controle sobre a obra',
    etapas: ['Planejamento', 'Equipe', 'Compras', 'Custos'],
    contexto: 'Quando os imprevistos se repetem e afetam prazos e margem.',
  },
  {
    titulo: 'IA aplicada com critério',
    etapas: ['Rotina', 'Documentos', 'Teste supervisionado', 'Avaliação'],
    contexto: 'Quando há interesse em automatizar, mas ainda faltam regras e prioridades.',
  },
]
