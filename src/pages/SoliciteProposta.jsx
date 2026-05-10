import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from '@/lib/motion-lite';
import SEO from '@/components/SEO';
import OrcadorInteligente from '@/components/OrcadorInteligente';
import { useTranslation } from 'react-i18next';
import { useWGContext } from '@/providers/ContextProvider';

const SoliciteProposta = () => {
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { context: wgContext } = useWGContext() || { context: {} };
  const requestedService = searchParams.get('service') || '';
  const requestedContext = searchParams.get('context') || '';
  const requestedIntent = searchParams.get('intent') || '';
  const requestedPropertyType = searchParams.get('propertyType') || '';

  const contextCopy = {
    moodboard: t('proposalPage.contexts.moodboard'),
    room: t('proposalPage.contexts.room'),
    buildtech: t('proposalPage.contexts.buildtech'),
    process: t('proposalPage.contexts.process'),
    architecture: t('proposalPage.contexts.architecture'),
    engineering: t('proposalPage.contexts.engineering'),
    carpentry: t('proposalPage.contexts.carpentry'),
    turnkey: t('proposalPage.contexts.turnkey'),
    'vila-nova': t('proposalPage.contexts.vila-nova'),
  };

  const intentCopy = {
    obra: t('proposalPage.intents.obra'),
    marcenaria: t('proposalPage.intents.marcenaria'),
    design: t('proposalPage.intents.design'),
    investimento: t('proposalPage.intents.investimento'),
  };

  const introLabel = requestedContext
    ? contextCopy[requestedContext] || t('proposalPage.benefits.addon')
    : requestedIntent && intentCopy[requestedIntent]
      ? intentCopy[requestedIntent]
      : wgContext?.interesse && !requestedContext && intentCopy[wgContext.interesse]
        ? intentCopy[wgContext.interesse]
        : '';

  return (
    <>
      <SEO
        pathname="/solicite-proposta"
        title={t('seo.proposal.title')}
        description={t('seo.proposal.description')}
      />

      <section className="pt-32 pb-20 bg-wg-gray-light min-h-screen">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="text-wg-orange text-[11px] tracking-[0.22em] uppercase mb-4 block font-light">
              {t('proposalPage.hero.kicker')}
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-wg-black mb-6 tracking-tight">
              {t('proposalPage.hero.title')}
            </h1>
            <p className="text-wg-gray text-lg font-light leading-relaxed">
              {t('proposalPage.hero.subtitle')}
            </p>
          </motion.div>

          <OrcadorInteligente
            initialService={requestedService}
            initialPropertyType={requestedPropertyType}
            sourceContext={requestedContext}
            introLabel={introLabel}
          />
        </div>
      </section>
    </>
  );
};

export default SoliciteProposta;
