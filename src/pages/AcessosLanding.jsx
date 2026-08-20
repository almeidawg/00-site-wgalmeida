
import React from 'react';
import { motion } from '@/lib/motion-lite';
import SEO from '@/components/SEO';
import { withBasePath } from '@/utils/assetPaths';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { 
  Building2,
  Users,
  QrCode,
  ClipboardCheck,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPANY, PRODUCT_URLS } from '@/data/company';
import { useTranslation } from 'react-i18next';

// Placeholder image
const ACESSOS_HERO_IMAGE = withBasePath('/images/banners/BUILDTECH.webp');

const AcessosLanding = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title="AcessooS | Sistema Operacional para Condomínios"
        description="Gestão de moradores, controle de acesso, ocorrências, reservas e comunicação em uma plataforma integrada para administradoras e síndicos."
      />

      {/* Hero Section */}
      <section className="wg-page-hero hero-under-header">
        <div className="absolute inset-0 z-0">
          <ResponsiveWebpImage
            src={ACESSOS_HERO_IMAGE}
            alt="AcessooS - Gestão de Condomínios"
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
              className="wg-page-hero-kicker text-wg-blue"
            >
              Sistema Operacional de Condomínios
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              className="wg-page-hero-title max-w-4xl text-balance leading-[1.08]"
            >
              A gestão do seu condomínio, simplificada e inteligente.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="wg-page-hero-subtitle max-w-3xl"
            >
              AcessooS unifica a comunicação, segurança e administração do seu condomínio em um único sistema, acessível para gestão, moradores e portaria.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <a 
                href={PRODUCT_URLS.acessoos}
                target="_blank"
                rel="noopener noreferrer"
                className="wg-btn-pill-primary"
              >
                Ver Demonstração
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

      {/* Grid de Funcionalidades */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-wg-black">Uma plataforma completa</h2>
            <p className="text-lg text-wg-gray max-w-2xl mx-auto mt-4">Da segurança da portaria à gestão financeira, AcessooS tem a solução.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-blue/10 rounded-2xl flex items-center justify-center text-wg-blue mb-6 group-hover:scale-110 transition-transform">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Controle de Acesso</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                Gestão de visitantes, prestadores de serviço e encomendas com identificação e registros em tempo real.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Gestão de Moradores</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                Mantenha um cadastro atualizado de unidades, moradores, veículos e pets, tudo em conformidade com a LGPD.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-orange/10 rounded-2xl flex items-center justify-center text-wg-orange mb-6 group-hover:scale-110 transition-transform">
                <ClipboardCheck size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Reservas e Ocorrências</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                Agendamento de áreas comuns e registro de ocorrências de forma organizada e transparente para todos.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Building2 size={24} />
              </div>
              <h3 className="text-xl font-light text-wg-black mb-4">Operação Predial</h3>
              <p className="text-wg-gray leading-relaxed font-light">
                Controle manutenções preventivas, checklists de rotina e a comunicação entre as equipes de operação.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default AcessosLanding;
