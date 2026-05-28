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
  Calculator,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { WG_PRODUCT_MESSAGES, COMPANY, PRODUCT_URLS } from '@/data/company';
import { useTranslation } from 'react-i18next';

const EASYREALSTATE_HERO_IMAGE = withBasePath('/images/banners/ARQUITETURA.webp');

const EasyRealStateLanding = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title="Easy Real State | Inteligência Imobiliária e Avaliação (AVM)"
        description="Plataforma de inteligência para defesa de valor imobiliário e análise de potencial de mercado."
      />

      {/* Hero Section */}
      <section className="wg-page-hero hero-under-header">
        <div className="absolute inset-0 z-0">
          <ResponsiveWebpImage
            src={EASYREALSTATE_HERO_IMAGE}
            alt="Easy Real State B2B"
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
              {t('easyRealStatePage.hero.kicker')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              className="wg-page-hero-title max-w-4xl text-balance"
              dangerouslySetInnerHTML={{ __html: t('easyRealStatePage.hero.title') }}
            />

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="wg-page-hero-subtitle max-w-3xl"
            >
              {t('easyRealStatePage.hero.subtitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="wg-page-hero-body max-w-3xl"
            >
              {WG_PRODUCT_MESSAGES.easyRealStateB2B}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.48 }}
              className="wg-page-hero-body max-w-3xl"
            >
              {WG_PRODUCT_MESSAGES.easyRealStateConfidence}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <a 
                href={`${PRODUCT_URLS.easyrealstate}/calculo`}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn-pill-primary"
              >
                Iniciar Avaliação do Ativo
              </a>
              <a 
                href={COMPANY.ceoWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn-pill-secondary border-white/20 text-white hover:bg-white/10"
              >
                Consultoria Assistida
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
                <Search size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Inteligência de Valor</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                {WG_PRODUCT_MESSAGES.easyRealStateBenchmarks}
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-blue/10 rounded-2xl flex items-center justify-center text-wg-blue mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Conexão com Mercado</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                {WG_PRODUCT_MESSAGES.marketReferences}
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Defesa do Ativo</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                {WG_PRODUCT_MESSAGES.easyRealStateConfidence}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Fluxo Integrado do Ecossistema */}
      <section className="section-padding bg-gray-50 border-t border-black/5">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-wg-orange text-sm uppercase tracking-widest block mb-3 font-light" style={{ letterSpacing: '0.15em' }}>Estratégia Integrada</span>
            <h2 className="text-3xl md:text-5xl font-playfair italic text-wg-black">
              O Fluxo que Converte: Da Inteligência à Decisão
            </h2>
            <p className="text-wg-gray text-lg font-light mt-4 leading-relaxed">
              Nossos produtos não operam de forma isolada. Eles funcionam como uma esteira unificada, atraindo o cliente por valor real e convertendo de forma natural.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="relative p-8 rounded-3xl bg-white border border-black/5 shadow-sm group hover:shadow-md transition-all">
              <span className="absolute top-6 right-6 text-6xl font-playfair italic text-wg-orange/10 font-bold group-hover:text-wg-orange/20 transition-colors">01</span>
              <div className="w-12 h-12 bg-wg-orange/10 rounded-2xl flex items-center justify-center text-wg-orange mb-6">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">1. Atração Consultiva (EasyRealState)</h3>
              <p className="text-wg-gray leading-relaxed font-light text-sm">
                Em vez de publicidade agressiva, o corretor ou a imobiliária inicia a experiência entregando inteligência imobiliária real, pesquisas de mercado e defesa defensável do ativo.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-3xl bg-white border border-black/5 shadow-sm group hover:shadow-md transition-all">
              <span className="absolute top-6 right-6 text-6xl font-playfair italic text-wg-blue/10 font-bold group-hover:text-wg-blue/20 transition-colors">02</span>
              <div className="w-12 h-12 bg-wg-blue/10 rounded-2xl flex items-center justify-center text-wg-blue mb-6">
                <Calculator size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">2. Simulação Autônoma (EVF por ObraEasy)</h3>
              <p className="text-wg-gray leading-relaxed font-light text-sm mb-6">
                O corretor compartilha um link para o <strong>Estudo de Viabilidade Financeira (EVF)</strong>. O cliente simula custos reais de obra e reforma sozinho e no seu ritmo, sem pressão comercial.
              </p>
              <a 
                href={`${PRODUCT_URLS.obraeasy}/evf4`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-wg-blue hover:text-wg-orange transition-colors font-medium"
              >
                Simular Obra no EVF <ArrowRight size={14} />
              </a>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-3xl bg-white border border-black/5 shadow-sm group hover:shadow-md transition-all">
              <span className="absolute top-6 right-6 text-6xl font-playfair italic text-wg-orange/10 font-bold group-hover:text-wg-orange/20 transition-colors">03</span>
              <div className="w-12 h-12 bg-wg-orange/10 rounded-2xl flex items-center justify-center text-wg-orange mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">3. Visão e Cotação (Moodboard & Store)</h3>
              <p className="text-wg-gray leading-relaxed font-light text-sm mb-6">
                O cliente materializa seu imóvel ideal criando o conceito no <strong>WG Moodboard</strong>. Os acabamentos selecionados geram cotações automáticas com fornecedores parceiros na <strong>WG Store</strong>, consolidando a decisão.
              </p>
              <Link 
                to="/moodboard"
                className="inline-flex items-center gap-1.5 text-xs text-wg-orange hover:text-wg-black transition-colors font-medium"
              >
                Acessar Moodboard <ArrowRight size={14} />
              </Link>
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
              Decisões imobiliárias baseadas em inteligência real.
            </h2>
            <p className="text-xl text-white/70 mb-12 font-light">
              {WG_PRODUCT_MESSAGES.wgExperienceCore}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href={`${PRODUCT_URLS.easyrealstate}/calculo`}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn-pill-primary px-10 py-5 text-lg"
              >
                Iniciar AVM agora
              </a>
              <a 
                href={COMPANY.ceoWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-lg"
              >
                Falar com Diretor <ArrowRight size={20} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default EasyRealStateLanding;
