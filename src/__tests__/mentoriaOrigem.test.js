import { describe, expect, it } from 'vitest'
import { describeMentoriaOrigem, lerOrigemDaMensagem, contarOrigens } from '@/lib/mentoriaOrigem'

const q = (obj) => '?' + new URLSearchParams(obj).toString()

describe('origem legivel da mensagem de WhatsApp da mentoria', () => {
  it('traduz fonte e criativo conhecidos em frase natural', () => {
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_medium: 'paid_social', utm_campaign: 'mentoria_individual_piloto_2026_10', utm_content: 'criativo01_operacao_v3' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (vídeo sobre organizar a operação).')
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'criativo02_briefing_v3' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (vídeo do WhatsApp ao briefing).')
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'estatico_feed_v3_cwb' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (imagem do feed, Curitiba).')
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'estatico_stories_v3' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (imagem dos stories).')
    expect(describeMentoriaOrigem(q({ utm_source: 'instagram' }))).toBe('Cheguei por um anúncio no Instagram.')
  })

  it('criativo desconhecido mantem so a fonte e nunca repete o valor cru', () => {
    const text = describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'criativo99_novo_v1' }))
    expect(text).toBe('Cheguei por um anúncio no Facebook ou Instagram.')
    expect(text).not.toMatch(/criativo99|_v1/)
  })

  it('sem fonte conhecida, ou com valor invalido, nao escreve nada', () => {
    expect(describeMentoriaOrigem('')).toBe('')
    expect(describeMentoriaOrigem(q({ utm_source: 'qa_pixel', utm_medium: 'qa', utm_content: 'qa' }))).toBe('')
    expect(describeMentoriaOrigem(q({ utm_source: 'meta<script>' }))).toBe('')
    expect(describeMentoriaOrigem(q({ utm_content: 'criativo01_operacao_v3' }))).toBe('')
  })

  it('nunca expoe o nome interno da campanha', () => {
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_campaign: 'mentoria_individual_piloto_2026_10' }))).not.toMatch(/piloto|campaign|mentoria_/i)
  })
})

describe('cidade do anuncio na frase de origem', () => {
  it('sufixo _cwb acrescenta Curitiba; sem sufixo nao afirma cidade nenhuma', () => {
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'criativo01_operacao_v3_cwb' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (vídeo sobre organizar a operação, Curitiba).')
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'criativo01_operacao_v3' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (vídeo sobre organizar a operação).')
  })

  it('criativo desconhecido com _cwb nao vaza cidade nem valor cru', () => {
    const text = describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'criativo99_novo_v1_cwb' }))
    expect(text).toBe('Cheguei por um anúncio no Facebook ou Instagram.')
  })
})

describe('leitura inversa da frase de origem', () => {
  const frase = (content) => describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: content }))
  const msg = (content) => 'Olá, William! Vim pela apresentação. Minha prioridade é organizar. ' + frase(content) + ' Gostaria de conversar.'

  it('recupera canal, criativo e cidade do que o proprio codigo escreve', () => {
    expect(lerOrigemDaMensagem(msg('estatico_stories_v3_cwb')))
      .toEqual({ canal: 'Facebook ou Instagram', criativo: 'imagem dos stories', cidade: 'Curitiba' })
    expect(lerOrigemDaMensagem(msg('criativo02_briefing_v3')))
      .toEqual({ canal: 'Facebook ou Instagram', criativo: 'vídeo do WhatsApp ao briefing', cidade: null })
    expect(lerOrigemDaMensagem('Cheguei por um anúncio no Instagram.'))
      .toEqual({ canal: 'Instagram', criativo: null, cidade: null })
  })

  it('devolve null sem a frase, com canal falso ou texto de terceiros', () => {
    expect(lerOrigemDaMensagem('Oi, tudo bem?')).toBeNull()
    expect(lerOrigemDaMensagem('')).toBeNull()
    expect(lerOrigemDaMensagem(undefined)).toBeNull()
    expect(lerOrigemDaMensagem('Cheguei por um anúncio no TikTok.')).toBeNull()
  })

  it('rotulo ou cidade inventados pelo lead nao entram na contagem', () => {
    expect(lerOrigemDaMensagem('Cheguei por um anúncio no Facebook (vídeo falso, Marte).'))
      .toEqual({ canal: 'Facebook', criativo: null, cidade: null })
  })

  it('conta uma conversa uma vez e separa quem veio de anuncio', () => {
    const conversas = [
      [msg('criativo01_operacao_v3_cwb'), 'Obrigado'],
      [msg('criativo01_operacao_v3'), msg('criativo01_operacao_v3')],
      ['Oi, vi no Instagram do grupo'],
      [msg('estatico_stories_v3_cwb')],
    ]
    const r = contarOrigens(conversas)
    expect(r.total).toBe(4)
    expect(r.comOrigem).toBe(3)
    expect(r.porCriativo['vídeo sobre organizar a operação']).toBe(2)
    expect(r.porCriativo['imagem dos stories']).toBe(1)
    expect(r.porCidade.Curitiba).toBe(2)
    expect(r.porCidade['não identificada']).toBe(1)
    expect(r.porCanal['Facebook ou Instagram']).toBe(3)
  })
})
