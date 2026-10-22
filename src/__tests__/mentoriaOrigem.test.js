import { describe, expect, it } from 'vitest'
import { describeMentoriaOrigem } from '@/lib/mentoriaOrigem'

const q = (obj) => '?' + new URLSearchParams(obj).toString()

describe('origem legivel da mensagem de WhatsApp da mentoria', () => {
  it('traduz fonte e criativo conhecidos em frase natural', () => {
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_medium: 'paid_social', utm_campaign: 'mentoria_individual_piloto_2026_10', utm_content: 'criativo01_operacao_v3' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (vídeo sobre organizar a operação).')
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'criativo02_briefing_v3' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (vídeo do WhatsApp ao briefing).')
    expect(describeMentoriaOrigem(q({ utm_source: 'meta', utm_content: 'estatico_feed_v3_cwb' })))
      .toBe('Cheguei por um anúncio no Facebook ou Instagram (imagem do feed).')
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
