import i18n from '@/i18n';
export { COMPANY, PRODUCT_URLS, OBRAEASY_PRECOS, EASYREALSTATE_PRECOS } from './companyPublic.js';

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
