/**
 * REGISTRO DE ERROS E SOLUÇÕES — SITE WG ALMEIDA
 * 
 * Regra: Todo erro crítico identificado e corrigido deve ser registrado aqui
 * para evitar reincidência e alimentar a memória operacional do ecossistema.
 */

export const ERROR_LOG = [
  {
    date: '2026-05-08',
    issue: 'Vídeo do Hero aparecendo vertical no PC (Desktop)',
    diagnosis: 'Inversão de IDs no mapeamento inicial. O ID h6zftberxzqzf4mqpyyr corresponde ao vídeo vertical (30s) e o ID qjhkakyvjjesxqxijkah corresponde ao horizontal (60s). Além disso, as instruções de crop precisavam estar no mesmo segmento da URL.',
    fix: 'Inversão dos IDs no arquivo cloudinaryMedia.js e agrupamento das transformações c_fill e ar. Validação feita via mapeamento canônico em CLOUDINARY-PROJETOS-PORTFOLIO-MAP-2026-04-08.md.',
    status: 'SOLVIDO_DEFINITIVO'
  }
];
