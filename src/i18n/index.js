import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';
import es from './locales/es.json';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en', 'es'];

export function normalizeLanguageTag(lng) {
  if (!lng) return 'pt-BR';

  const normalized = String(lng).trim().toLowerCase();
  if (!normalized) return 'pt-BR';
  
  // Prioridade absoluta para PT-BR se houver qualquer sinal de português
  if (normalized.startsWith('pt')) return 'pt-BR';

  const base = normalized.split('-')[0];
  if (base === 'en') return 'en';
  if (base === 'es') return 'es';

  return 'pt-BR';
}

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
};

const i18n = createInstance();

// Resolve any locale key to its base bundle key
function resolveKey(lng) {
  return normalizeLanguageTag(lng);
}

async function ensureBundle(lng) {
  const key = resolveKey(lng);
  if (i18n.hasResourceBundle(key, 'translation')) return;
}

function getNestedValue(obj, key) {
  if (!obj || !key) return undefined;
  return key.split('.').reduce((acc, part) => acc && acc[keySeparator === false ? key : part], obj);
}

const keySeparator = '.';

function resolveTranslationValue(key, options = {}) {
  if (typeof key !== 'string' || !key) return undefined;

  const requestedLanguage = normalizeLanguageTag(options.lng || i18n.resolvedLanguage || i18n.language);
  const candidates = [...new Set([requestedLanguage, 'pt-BR'])];

  for (const lng of candidates) {
    const bundle = resources[lng]?.translation;
    if (!bundle) continue;

    const value = getNestedValue(bundle, key);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function patchedTranslate(key, options = {}) {
  const normalizedOptions = options && typeof options === 'object' ? options : {};
  const resolvedValue = resolveTranslationValue(key, normalizedOptions);

  if (resolvedValue === undefined) {
    if (normalizedOptions.returnObjects) return normalizedOptions.defaultValue ?? [];
    return normalizedOptions.defaultValue ?? key;
  }

  // Se pedimos objeto/array, mas veio string (ex: fallback para a própria chave ou tradução flat errada)
  if (normalizedOptions.returnObjects && typeof resolvedValue !== 'object') {
    return normalizedOptions.defaultValue ?? [];
  }

  if (normalizedOptions.returnObjects || typeof resolvedValue !== 'string') {
    return resolvedValue;
  }

  return i18n.services.interpolator.interpolate(
    resolvedValue,
    normalizedOptions,
    normalizeLanguageTag(normalizedOptions.lng || i18n.resolvedLanguage || i18n.language),
    normalizedOptions
  );
}

function patchedExists(key, options = {}) {
  return resolveTranslationValue(key, options) !== undefined;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: ['translation'],
    defaultNS: 'translation',
    keySeparator: '.', // Habilitado separador padrão para objetos aninhados
    nsSeparator: false,
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: 'currentOnly',
    fallbackLng: 'pt-BR',
    debug: false,
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing key "${key}" in languages: ${lngs.join(', ')}`);
      }
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'htmlTag'], // Removido 'navigator' para não pegar o idioma do browser automaticamente
      caches: ['localStorage'],
      convertDetectedLanguage: (lng) => normalizeLanguageTag(lng),
    },
    react: {
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'em', 'i', 'b', 'span', 'p', 'a', 'ul', 'li', 'ol']
    }
  });

i18n.t = patchedTranslate;
i18n.exists = patchedExists;

if (i18n.translator) {
  i18n.translator.translate = patchedTranslate;
  i18n.translator.exists = patchedExists;
}

// When language changes, ensure the bundle is loaded before rendering
i18n.on('languageChanged', (lng) => {
  const normalized = normalizeLanguageTag(lng);
  if (normalized !== lng) {
    i18n.changeLanguage(normalized);
    return;
  }

  ensureBundle(normalized);

  if (typeof document !== 'undefined') {
    document.documentElement.lang = normalized;
  }
});

// If localStorage already has a non-PT language, preload it now
const savedLng = typeof localStorage !== 'undefined' && localStorage.getItem('i18nextLng');
if (savedLng && resolveKey(savedLng) !== 'pt-BR') {
  ensureBundle(savedLng);
}

export default i18n;
