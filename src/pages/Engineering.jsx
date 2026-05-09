import React, { useState } from 'react';
import SEO from '@/components/SEO';
import { motion } from '@/lib/motion-lite';
import { Wrench, ClipboardCheck, Zap, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { useTranslation } from 'react-i18next';
import { SCHEMAS } from '@/data/schemaConfig';
import { WG_PRODUCT_MESSAGES } from '@/data/company';
import { PROJECT_SERVICE_HIGHLIGHTS } from '@/utils/cloudinaryProjectPortfolio';
import { getPublicPageImageSrc } from '@/data/publicPageImageCatalog';

const ENGINEERING_HERO_IMAGE = getPublicPageImageSrc('engineering', '/images/banners/ENG.webp');

const Engineering = () => {
  const { t } = useTranslation();
  const [etapaAtiva, setEtapaAtiva] = useState(0);

  const etapas = [
    {
      title: t('engineeringPage.services.0.title'),
      desc: t('engineeringPage.services.0.description'),
      icon: ClipboardCheck,
    },
    {
      title: t('engineeringPage.services.1.title'),
      desc: t('engineeringPage.services.1.description'),
      icon: Wrench,
    },
    {
      title: t('engineeringPage.services.2.title'),
      desc: t('engineeringPage.services.2.description'),
      icon: Zap,
    },
    {
      title: t('engineeringPage.services.3.title'),
      desc: t('engineeringPage.services.3.description'),
      icon: Award,
    },
  ];

  return (
    <>
      <SEO
        pathname="/engenharia"
        schema={[SCHEMAS.serviceEngineering, SCHEMAS.breadcrumbEngineering]}
      />

      {/* Hero elegante com cor da unidade */}
      <section className="wg-page-hero wg-page-hero--store hero-under-header">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <ResponsiveWebpImage
            className="w-full h-full object-cover"
            alt={t('engineeringPage.hero.imageAlt')}
            src={ENGINEERING_HERO_IMAGE}
            width="1920"
            height="1080"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wg-blue/50 via-wg-blue/60 to-wg-black/80"></div>
        </motion.div>

        <div className="container-custom">
          <div className="wg-page-hero-content px-4 pt-8 md:pt-10">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="wg-page-hero-kicker"
          >
            {t('units.engineering.kicker')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="wg-page-hero-title"
          >
            {t('units.engineering.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="wg-page-hero-subtitle max-w-3xl"
          >
            {t('units.engineering.subtitle')}
          </motion.p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white relative overflow-hidden">
        <div className="container-custom relative z-10">
          {/* Timeline Interactiva */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-start mb-20">
            <div className="space-y-6">
              <span className="text-wg-blue font-light tracking-[0.2em] uppercase text-sm mb-4 block">
                {t('engineeringPage.servicesKicker')}
              </span>
              <h2 className="text-3xl md:text-4xl font-inter font-light text-wg-black tracking-tight">
                {t('engineeringPage.servicesTitle')}
              </h2>
              <div className="space-y-4 pt-4">
                {etapas.map((etapa, idx) => {
                  const ehAtual = etapaAtiva === idx;
                  return (
                    <motion.div
                      key={idx}
                      onClick={() => setEtapaAtiva(idx)}
                      className={`p-6 rounded-2xl cursor-pointer border transition-all ${
                        ehAtual
                          ? 'bg-wg-blue text-white border-wg-blue shadow-xl'
                          : 'bg-gray-50 border-transparent hover:border-gray-200 text-wg-gray'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          ehAtual ? 'bg-white/20' : 'bg-wg-blue/10 text-wg-blue'
                        }`}>
                          <etapa.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className={`text-lg font-light ${ehAtual ? 'text-white' : 'text-wg-black'}`}>
                              {etapa.title}
                            </h4>
                            <span className={`text-[10px] uppercase font-bold tracking-widest ${
                              ehAtual ? 'text-white/60' : 'text-wg-blue'
                            }`}>
                              {idx <= etapaAtiva ? t('units.engineering.etapas.approved') : t('units.engineering.etapas.locked')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              key={etapaAtiva}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-black/5"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-wg-blue text-white flex items-center justify-center">
                  {React.createElement(etapas[etapaAtiva].icon, { size: 32 })}
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-wg-blue font-bold">Etapa 0{etapaAtiva + 1}</span>
                  <h3 className="text-2xl font-inter font-light text-wg-black">{etapas[etapaAtiva].title}</h3>
                </div>
              </div>
              <p className="text-lg text-wg-gray leading-relaxed font-light mb-10">
                {etapas[etapaAtiva].desc}
              </p>
              <div className="flex flex-wrap gap-4">
                 <Link to="/solicite-proposta" className="btn-primary">
                    {etapaAtiva === etapas.length - 1 ? t('engineeringPage.cta') : t('units.engineering.etapas.approveAction')}
                 </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="rounded-3xl border border-wg-blue/15 bg-gradient-to-br from-wg-blue/5 via-white to-white p-8 md:p-10 mb-20"
          >
            <div className="max-w-4xl">
              <span className="text-wg-blue font-light tracking-[0.2em] uppercase text-sm mb-4 block">
                {t('aboutPage.differential.kicker')}
              </span>
              <h3 className="text-2xl md:text-3xl font-inter font-light text-wg-black tracking-tight mb-4">
                {t('units.engineering.methodTitle')}
              </h3>
              <div className="space-y-3 text-wg-gray leading-relaxed">
                <p>
                  {WG_PRODUCT_MESSAGES.obraeasyPromise}
                </p>
                <p>
                  {t('units.engineering.methodDesc')}
                </p>
                <p>
                   {WG_PRODUCT_MESSAGES.marketReferences}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-wg-blue font-light tracking-[0.2em] uppercase text-sm mb-4 block">
                {t('engineeringPage.commitment.kicker')}
              </span>

              <h2 className="text-3xl md:text-4xl font-inter font-light text-wg-black mb-6 tracking-tight">
                {t('engineeringPage.commitment.title')}
              </h2>

              <div className="space-y-4 text-wg-gray leading-relaxed">
                <p>
                  {t('engineeringPage.commitment.paragraphs.0')}
                </p>
                <p>
                  {t('engineeringPage.commitment.paragraphs.1')}
                </p>
                <p>
                  {t('engineeringPage.commitment.paragraphs.2')}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8"
              >
                <Link
                  to="/contato"
                  className="bg-wg-blue text-white px-8 py-4 rounded-xl font-light hover:bg-wg-blue/90 transition-all inline-flex items-center gap-2 group"
                >
                  <span>{t('engineeringPage.cta')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-wg-blue/20 to-transparent rounded-2xl" />
              <img
                className="relative w-full h-[500px] object-cover rounded-xl shadow-2xl"
                alt={t('engineeringPage.commitment.imageAlt')}
                src={PROJECT_SERVICE_HIGHLIGHTS.engineering || ENGINEERING_HERO_IMAGE}
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-xl shadow-xl max-w-[200px]">
                <p className="text-sm font-inter font-light text-wg-blue italic leading-tight">"{t('engineeringPage.commitment.quote')}"</p>
              </div>
            </motion.div>
          </div>

          {/* Add-on de Experiência Visual */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 rounded-3xl border border-wg-blue/15 bg-wg-black text-white p-8 md:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
              <div>
                <span className="text-white/60 font-light tracking-[0.2em] uppercase text-sm mb-4 block">
                   {t('proposalPage.benefits.visual')}
                </span>
                <h3 className="text-2xl md:text-3xl font-inter font-light tracking-tight mb-4">
                  {t('units.engineering.addonTitle')}
                </h3>
                <div className="space-y-3 text-white/75 leading-relaxed">
                  <p>{WG_PRODUCT_MESSAGES.wgExperienceSystem}</p>
                  <p>
                    {t('units.engineering.addonDesc')}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {(Array.isArray(t('units.engineering.addonPoints', { returnObjects: true }))
                  ? t('units.engineering.addonPoints', { returnObjects: true })
                  : []
                ).map((item) => (
                  <div key={item} className="wg-overlay-panel-dark flex items-start gap-3 p-4">
                    <CheckCircle2 className="w-5 h-5 text-wg-blue flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white/80 font-light leading-relaxed">{item}</p>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to="/solicite-proposta?service=Sistema%20de%20Experi%C3%AAncia%20Visual&context=engineering"
                    className="bg-wg-blue text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-wg-blue/90 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t('units.engineering.addonButton')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/moodboard"
                    className="btn-hero-outline"
                  >
                    {t('cta.learnMore')}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Engineering;
