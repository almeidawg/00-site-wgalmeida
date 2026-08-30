
import React from 'react';
import { motion } from '@/lib/motion-lite';
import SEO from '@/components/SEO';
import { withBasePath } from '@/utils/assetPaths';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { 
  Ticket,
  CalendarCheck,
  Megaphone,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPANY, PRODUCT_URLS } from '@/data/company';
import { useTranslation } from 'react-i18next';

const EVENTOS_HERO_IMAGE = withBasePath('/images/banners/PROJETOS.webp');

const EventosLanding = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO
        pathname="/eventos"
        title="EventOS | Gestão Completa de Eventos SaaS"
        description="Simplifique a organização e gestão de todos os seus eventos, do credenciamento à análise pós-evento. Plataforma SaaS completa para organizadores e empresas."
      />

      {/* Hero Section */}
      <section className="wg-page-hero hero-under-header">
        <div className="absolute inset-0 z-0">
          <ResponsiveWebpImage
            src={EVENTOS_HERO_IMAGE}
            alt="EventOS - Gestão Completa de Eventos"
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
              className="wg-page-hero-kicker text-wg-purple"
            >
              SaaS para Organização de Eventos
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              className="wg-page-hero-title max-w-4xl text-balance leading-[1.08]"
            >
              Simplifique cada etapa da gestão dos seus eventos.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="wg-page-hero-subtitle max-w-3xl"
            >
              EventOS é a plataforma completa para planejar, executar e analisar eventos de todos os portes, com agilidade e controle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <a 
                href={COMPANY.ceoWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn-pill-primary"
              >
                Solicitar Demonstração
              </a>
              <Link 
                to="/contato?context=eventos"
                className="wg-btn-pill-secondary border-white/20 text-white hover:bg-white/10"
              >
                Falar com Especialista
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid de Funcionalidades */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-wg-black">Funcionalidades Essenciais</h2>
            <p className="text-lg text-wg-gray max-w-2xl mx-auto mt-4">Do credenciamento inteligente à análise de desempenho.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-purple/10 rounded-2xl flex items-center justify-center text-wg-purple mb-6 group-hover:scale-110 transition-transform">
                <Ticket size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Inscrições e Ticketing</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                Gerencie inscrições, venda de ingressos e credenciamento de participantes de forma eficiente e segura.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <CalendarCheck size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Agenda e Conteúdo</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                Organize palestras, workshops e atividades com uma agenda dinâmica e fácil de personalizar para seus participantes.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-orange/10 rounded-2xl flex items-center justify-center text-wg-orange mb-6 group-hover:scale-110 transition-transform">
                <Megaphone size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Comunicação e Engajamento</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                Envie comunicados, pesquisas de satisfação e promova a interação entre os participantes.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-blue/10 rounded-2xl flex items-center justify-center text-wg-blue mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Analytics e Métricas</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                Acompanhe o desempenho do seu evento em tempo real, identifique tendências e otimize resultados futuros.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default EventosLanding;
