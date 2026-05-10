import i18n from '@/i18n';

/**
 * SINGLE SOURCE OF TRUTH — Dados da empresa e URLs dos produtos
 *
 * REGRA: Este é o ÚNICO lugar onde dados de contato e URLs são definidos.
 * Todos os componentes devem importar daqui.
 *
 * Ao alterar telefone, email, endereço ou URL:
 *   1. Alterar aqui
 *   2. Rodar: grep -rn "98465-0002\|contato@wg\|obraeasy\.wg\|easy\.wg\|easyrealstate\.wg" src/
 *   3. Garantir que todos os resultados sejam apenas importações desta constante
 *
 * Última revisão: 2026-05-01
 */

export const COMPANY = {
  name:         'Grupo WG Almeida',
  phone:        '+55 (11) 98465-0002',
  phoneRaw:     '+5511984650002',
  whatsapp:     'https://wa.me/5511984650002',
  ceoPhone:     '+55 (11) 99179-2291',
  ceoPhoneRaw:  '+5511991792291',
  ceoWhatsapp:  'https://wa.me/5511991792291',
  email:        'contato@wgalmeida.com.br',
  address:      'São Paulo, SP — Brasil',
  instagram:    'https://www.instagram.com/wgalmeida.arq',
  linkedin:     'https://www.linkedin.com/company/wgalmeida',
  facebook:     'https://www.facebook.com/wgalmeidaarquitetura',
  houzz:        'https://www.houzz.com/user/wgalmeida',
  pinterest:    'https://br.pinterest.com/wgalmeida',
  homify:       'https://www.homify.com.br/profissionais/232168/grupo-wg-almeida-arquitetura-engenharia-e-marcenaria-de-alto-padrao',
  gtmId:        'GTM-PT885HFQ',
}

export const PRODUCT_URLS = {
  site:         'https://wgalmeida.com.br',
  wgeasy:       'https://easy.wgalmeida.com.br',
  obraeasy:     'https://obraeasy.wgalmeida.com.br',
  easyrealstate:'https://easyrealstate.wgalmeida.com.br',
  corretor:     'https://obraeasy.wgalmeida.com.br/landing/corretor',
  buildtech:    'https://buildtech.wgalmeida.com.br',
  iccri:        'https://wgalmeida.com.br/iccri',
  easylocker:   'https://wgalmeida.com.br/easylocker',
}

/** Preços SaaS — espelho público auditado contra saas_planos do WGEasy */
export const OBRAEASY_PRECOS = {
  free:     { label: 'Gratuito', price: 'R$ 0', id: 'free' },
  pro:      { label: 'Pro',      price: 'R$ 29,90', id: 'pro' },
  business: { label: 'Business', price: 'R$ 59,90', id: 'business' },
}

export const EASYREALSTATE_PRECOS = {
  free:        { label: 'Gratuito', price: 'R$ 0', schemaPrice: '0', id: 'free' },
  solo:        { label: 'Solo', price: 'R$ 79,90', schemaPrice: '79.90', id: 'solo' },
  completo:    { label: 'Completo', price: 'R$ 149,90', schemaPrice: '149.90', id: 'completo' },
  proCorretor: { label: 'Solo', price: 'R$ 79,90', schemaPrice: '79.90', id: 'solo' },
  imobiliaria: { label: 'Completo', price: 'R$ 149,90', schemaPrice: '149.90', id: 'completo' },
}

/**
 * Mensagens de Posicionamento WG_Build.tech
 * Dinâmicas para suportar i18n sem quebrar sites de chamada
 */
export const WG_PRODUCT_MESSAGES = {
  get wgExperienceCore() { return i18n.t('messages.wgExperienceCore'); },
  get wgAutomationPromise() { return i18n.t('messages.wgAutomationPromise'); },
  get obraeasyPromise() { return i18n.t('messages.obraeasyPromise'); },
  get obraeasyB2B() { return i18n.t('messages.obraeasyB2B'); },
  get obraeasyBenchmarks() { return i18n.t('messages.obraeasyBenchmarks'); },
  get iccriPositioning() { return i18n.t('messages.iccriPositioning'); },
  get marketReferences() { return i18n.t('messages.marketReferences'); },
  get easyRealStateB2B() { return i18n.t('messages.easyRealStateB2B'); },
  get easyRealStateConfidence() { return i18n.t('messages.easyRealStateConfidence'); },
  get easyRealStateBenchmarks() { return i18n.t('messages.easyRealStateBenchmarks'); },
  get obraeasyCapture() { return i18n.t('messages.obraeasyCapture'); },
  get wgExperienceSystem() { return i18n.t('messages.wgExperienceSystem'); },
  get wgExperienceAddon() { return i18n.t('messages.wgExperienceAddon'); },
  get wgExperienceConversion() { return i18n.t('messages.wgExperienceConversion'); },
};
