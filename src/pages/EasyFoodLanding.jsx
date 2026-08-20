
import React from 'react';
import { motion } from '@/lib/motion-lite';
import SEO from '@/components/SEO';
import { withBasePath } from '@/utils/assetPaths';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { 
  MenuSquare,
  LayoutGrid,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { COMPANY, PRODUCT_URLS } from '@/data/company';
import { useTranslation } from 'react-i18next';

const EASYFOOD_HERO_IMAGE = withBasePath('/images/banners/MARCENARIA.webp');

const EasyFoodLanding = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title="Easy Food | Gestão Inteligente para Food Service"
        description="Plataforma SaaS completa para restaurantes, bares, cafés e padarias. Cardápio digital, PDV, cozinha, estoque e mais."
      />
      <section className="wg-page-hero hero-under-header">
        <div className="absolute inset-0 z-0">
          <ResponsiveWebpImage src={EASYFOOD_HERO_IMAGE} alt="Easy Food - Gestão para Food Service" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-wg-black/60 via-wg-black/70 to-wg-black" />
        </div>
        <div className="container-custom">
          <div className="wg-page-hero-content px-4 pt-16 md:pt-20">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }} className="wg-page-hero-kicker text-wg-orange">SaaS para Food Service</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18 }} className="wg-page-hero-title max-w-4xl text-balance leading-[1.08]">Gestão completa e inteligente para seu restaurante</motion.h1>
            <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="wg-page-hero-subtitle max-w-3xl">Easy Food centraliza cardápio, cozinha, caixa e gestão em uma única plataforma SaaS, fácil de usar e poderosa.</motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }} className="flex flex-wrap gap-4 mt-10">
              <a href={PRODUCT_URLS.easyfood} target="_blank" rel="noopener noreferrer" className="wg-btn-pill-primary">Acessar a Plataforma</a>
              <a href={COMPANY.ceoWhatsapp} target="_blank" rel="noopener noreferrer" className="wg-btn-pill-secondary border-white/20 text-white hover:bg-white/10">Solicitar uma Demonstração</a>
            </motion.div>
          </div>
        </div>
      </section>
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-wg-black">Tudo que seu negócio precisa</h2>
            <p className="text-lg text-wg-gray max-w-2xl mx-auto mt-4">Do pedido à gestão financeira, o Easy Food simplifica sua operação.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-orange/10 rounded-2xl flex items-center justify-center text-wg-orange mb-6 group-hover:scale-110 transition-transform"><MenuSquare size={24} /></div>
              <h3 className="text-xl font-light text-wg-black mb-4">Cardápio Digital com QR Code</h3>
              <p className="text-wg-gray leading-relaxed font-light">Modernize o atendimento com cardápios digitais acessíveis por QR code nas mesas. Fácil de atualizar, rápido para o cliente.</p>
            </div>
            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-wg-blue/10 rounded-2xl flex items-center justify-center text-wg-blue mb-6 group-hover:scale-110 transition-transform"><LayoutGrid size={24} /></div>
              <h3 className="text-xl font-light text-wg-black mb-4">Gestão de Cozinha</h3>
              <p className="text-wg-gray leading-relaxed font-light">Receba e gerencie pedidos em tempo real, otimizando o fluxo de preparo e a comunicação com o salão.</p>
            </div>
            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform"><ShoppingCart size={24} /></div>
              <h3 className="text-xl font-light text-wg-black mb-4">PDV (Ponto de Venda)</h3>
              <p className="text-wg-gray leading-relaxed font-light">Um caixa ágil e integrado para fechamento de contas, emissão de notas e controle de pagamentos.</p>
            </div>
            <div className="p-8 rounded-3xl border border-black/5 bg-gray-50 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform"><LayoutGrid size={24} /></div>
              <h3 className="text-xl font-light text-wg-black mb-4">Admin Completo</h3>
              <p className="text-wg-gray leading-relaxed font-light">Controle CRM de clientes, fornecedores, estoque e financeiro em um painel de gestão centralizado.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section-padding bg-wg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-wg-orange/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-playfair italic mb-8">Transforme a gestão do seu negócio hoje mesmo.</h2>
            <p className="text-xl text-white/70 mb-12 font-light">Descubra como o Easy Food pode otimizar sua operação e aumentar seus lucros.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href={PRODUCT_URLS.easyfood} target="_blank" rel="noopener noreferrer" className="wg-btn-pill-primary px-10 py-5 text-lg">Acessar Plataforma</a>
              <a href={COMPANY.ceoWhatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-lg">Agendar Demonstração <ArrowRight size={20} /></a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};
export default EasyFoodLanding;
