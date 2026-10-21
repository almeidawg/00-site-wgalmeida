import conteudo from './mentoriaAbordagens.json'

/**
 * Trilhas editoriais: temas POSSÍVEIS de aprofundamento, não módulos contratados.
 * A mentoria piloto segue com 8 encontros e 12h ao vivo. Não corresponde a
 * 30 entregas, serviços técnicos incluídos, certificação ou diagnóstico pronto.
 * O texto fica em mentoriaAbordagens.json; aqui só entram os derivados.
 */
export const MENTORIA_ABORDAGENS = conteudo.areas

export const MENTORIA_ABORDAGENS_TOTAL = MENTORIA_ABORDAGENS.reduce(
  (count, area) => count + area.possibilidades.length, 0
)

export const MENTORIA_ABORDAGENS_JORNADAS = conteudo.jornadas
