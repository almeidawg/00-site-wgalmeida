import React from 'react';
import { motion } from '@/lib/motion-lite';
import SEO from '@/components/SEO';
import { withBasePath } from '@/utils/assetPaths';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { 
  BarChart3, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  Database,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { WG_PRODUCT_MESSAGES, COMPANY, PRODUCT_URLS } from '@/data/company';
import { useTranslation } from 'react-i18next';

const OBRAEASY_HERO_IMAGE = withBasePath('/images/banners/ENGENHARIA.webp');

const ObraEasyLanding = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title="ObraEasy B2B | Gestão de Obras para Incorporação e Retrofit"
        description="Plataforma técnica para controle de custos, cronograma e execução de obras de alto padrão."
      />

      {/* Hero Section */}
      <section className="wg-page-hero hero-under-header">
        <div className="absolute inset-0 z-0">
          <ResponsiveWebpImage
            src={OBRAEASY_HERO_IMAGE}
            alt="ObraEasy B2B"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wg-black/60 via-wg-black/70 to-wg-black" />
        </div>

        <div className="container-custom">
          <div className="wg-page-hero-content px-4 pt-16 md:pt-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="wg-page-hero-kicker text-wg-orange"
            >
              {t('obraeasyPage.hero.kicker')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              className="wg-page-hero-title max-w-4xl text-balance leading-[1.08]"
              dangerouslySetInnerHTML={{ __html: t('obraeasyPage.hero.title') }}
            />

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="wg-page-hero-subtitle max-w-3xl"
            >
              {t('obraeasyPage.hero.subtitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="wg-page-hero-body max-w-3xl"
            >
              {WG_PRODUCT_MESSAGES.obraeasyB2B}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.48 }}
              className="wg-page-hero-body max-w-3xl"
            >
              {WG_PRODUCT_MESSAGES.wgAutomationPromise}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <a 
                href={`${PRODUCT_URLS.obraeasy}/evf4`}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn-pill-primary"
              >
                Solicitar Estudo de Viabilidade (EVF)
              </a>
              <a 
                href={COMPANY.ceoWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn-pill-secondary border-white/20 text-white hover:bg-white/10"
              >
                Falar com Especialista
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid de Benefícios Técnicos */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-orange/10 rounded-2xl flex items-center justify-center text-wg-orange mb-6 group-hover:scale-110 transition-transform">
                <Database size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Motor ICCRI Integrado</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                {WG_PRODUCT_MESSAGES.iccriPositioning}
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-blue/10 rounded-2xl flex items-center justify-center text-wg-blue mb-6 group-hover:scale-110 transition-transform">
                <Calculator size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Referências de Mercado</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                {WG_PRODUCT_MESSAGES.obraeasyBenchmarks}
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Captura de Valor</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                {WG_PRODUCT_MESSAGES.obraeasyCapture}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section-padding bg-wg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-wg-orange/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-playfair italic mb-8">
              Sua obra com inteligência e controle real.
            </h2>
            <p className="text-xl text-white/70 mb-12 font-light">
              {WG_PRODUCT_MESSAGES.wgExperienceCore}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href={`${PRODUCT_URLS.obraeasy}/evf4`}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn-pill-primary px-10 py-5 text-lg"
              >
                Começar agora
              </a>
              <a 
                href={COMPANY.ceoWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-lg"
              >
                Agendar Reunião de Viabilidade <ArrowRight size={20} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ObraEasyLanding;
