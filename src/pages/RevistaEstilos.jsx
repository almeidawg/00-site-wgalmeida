import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from '@/lib/motion-lite';
import { Link } from 'react-router-dom';
import Seo from '@/components/SEO';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import {
  Palette,
  ArrowRight,
  Heart,
  Eye,
  BookOpen
} from 'lucide-react';
import { styleCatalog } from '@/utils/styleCatalog';
import { withBasePath } from '@/utils/assetPaths';
import { getStyleImageUrl } from '@/data/styleImageManifest';
import { getPublicPageImageSrc } from '@/data/publicPageImageCatalog';
import { useTranslation } from 'react-i18next';

const STYLE_MAGAZINE_HERO_IMAGE = getPublicPageImageSrc('revistaEstilos', withBasePath('/images/banners/MARCENARIA.webp'));

// Component for Style Card
const StyleCard = ({ estilo, index }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-[24px] border border-black/5 bg-wg-black shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${
        index === 0 ? 'col-span-1 md:col-span-2 row-span-2' : 'col-span-1'
      }`}
    >
      <Link to={`/estilos/${estilo.slug}`} className="block h-full min-h-[380px]">
        {/* Image */}
        <div className="relative h-full min-h-[380px] overflow-hidden">
          <ResponsiveWebpImage
            src={getStyleImageUrl({ slug: estilo.slug, variant: 'card' }) || estilo.image}
            alt={estilo.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading={index < 2 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10 opacity-80 transition-opacity duration-500 group-hover:opacity-90" />

          {/* Featured Badge */}
          {estilo.featured && (
            <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-wg-orange px-4 py-2 text-xs font-light uppercase tracking-wider text-white shadow-lg">
              <BookOpen className="w-4 h-4" />
              <span>{t('styleMagazine.grid.featured')}</span>
            </div>
          )}

          {/* Color Palette */}
          <div className="absolute top-5 left-5 flex gap-1.5">
            {estilo.colors.slice(0, 4).map((color) => (
              <div
                key={color}
                className="h-5 w-5 rounded-full border border-white/90 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-7">
          {/* Quote */}
          {estilo.quote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mb-5 line-clamp-3 text-sm italic opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:text-base"
            >
              "{estilo.quote}"
              {estilo.author && <span className="block mt-2 text-xs not-italic">- {estilo.author}</span>}
            </motion.div>
          )}

          {/* Title */}
          <h3 className={`font-inter font-light text-white mb-3 leading-[1.05] ${
            index === 0 ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'
          }`}>
            {estilo.title}
          </h3>

          {/* Excerpt */}
          <p className={`text-white/90 leading-relaxed mb-4 ${
            index === 0 ? 'line-clamp-4 text-base md:text-lg' : 'line-clamp-3 text-sm'
          }`}>
            {estilo.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {estilo.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm text-xs rounded-full border border-white/30"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 font-light text-white/88 transition-all duration-300 group-hover:gap-4">
            <span>{t('styleMagazine.grid.explore')}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

StyleCard.propTypes = {
  estilo: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    image: PropTypes.string,
    title: PropTypes.string.isRequired,
    featured: PropTypes.bool,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    quote: PropTypes.string,
    author: PropTypes.string,
    excerpt: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const RevistaEstilos = () => {
  const { t } = useTranslation();
  const [estilos, setEstilos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEstilos(styleCatalog);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Palette className="w-16 h-16 text-wg-gray animate-spin mx-auto mb-4" />
          <p className="text-wg-gray">{t('styleMagazine.grid.loading')}</p>
        </div>
      </div>
    );
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Guia de Estilos de Decoração e Interiores",
    "description": "Catálogo completo de estilos arquitetônicos e decorativos curados pelo Grupo WG Almeida.",
    "itemListElement": estilos.map((estilo, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://wgalmeida.com.br/estilos/${estilo.slug}`,
      "name": estilo.title
    }))
  };

  return (
    <>
      <Seo
        pathname="/revista-estilos"
        title="Revista de Estilos | Guia de decoração e interiores WG Almeida"
        description="Explore estilos de decoração, paletas, materiais e referências para transformar ambientes residenciais com curadoria da WG Almeida."
        schema={itemListSchema}
      />

      {/* Hero Section */}
      <section className="wg-page-hero wg-page-hero--store hero-under-header bg-wg-black">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <ResponsiveWebpImage
            src={STYLE_MAGAZINE_HERO_IMAGE}
            alt="Revista de Estilos"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wg-black/60 via-wg-black/70 to-wg-black" />
        </motion.div>

        <div className="container-custom">
          <div className="wg-page-hero-content px-4 pt-8 md:pt-10">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="wg-page-hero-kicker text-white/78"
            >
              {t('styleMagazine.hero.kicker')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              className="wg-page-hero-title"
            >
              {t('styleMagazine.hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="wg-page-hero-subtitle max-w-3xl"
            >
              {t('styleMagazine.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="wg-page-hero-actions text-xs text-white/72"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{estilos.length} {t('styleMagazine.hero.stats.styles')}</span>
              </div>
              <div className="h-4 w-px bg-white/25" />
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{t('styleMagazine.hero.stats.guide')}</span>
              </div>
              <div className="h-4 w-px bg-white/25" />
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>{t('styleMagazine.hero.stats.inspiration')}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Styles Grid */}
      <section className="section-padding-tight-top bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-inter font-light text-wg-black mb-4">
              {t('styleMagazine.grid.title')}
            </h2>
            <p className="text-lg text-wg-gray max-w-2xl mx-auto">
              {t('styleMagazine.grid.subtitle')}
            </p>
          </motion.div>

          {/* Masonry Grid */}
          <div className="grid auto-rows-[minmax(380px,auto)] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {estilos.map((estilo, index) => (
              <StyleCard key={estilo.slug} estilo={estilo} index={index} />
            ))}
          </div>

          {/* SEO Quick Links Hub */}
          <div className="mt-20 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h3 className="mb-6 text-center text-sm font-light uppercase tracking-widest text-wg-gray">{t('styleMagazine.grid.indexTitle')}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {estilos.map((estilo) => (
                <Link
                  key={estilo.slug}
                  to={`/estilos/${estilo.slug}`}
                  className="group flex min-h-[56px] items-center rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-light leading-snug text-wg-gray transition-all hover:border-wg-orange/30 hover:bg-white hover:text-wg-black hover:shadow-sm"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-wg-orange/60 transition-transform group-hover:scale-125" />
                  <span className="ml-3">{estilo.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-wg-black text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Palette className="w-12 h-12 text-white/78 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-inter font-light mb-6">
              {t('styleMagazine.cta.title')}
            </h2>
            <p className="text-xl text-white/80 mb-8">
              {t('styleMagazine.cta.subtitle')}
            </p>
            <Link
              to="/solicite-proposta"
              className="inline-flex items-center gap-3 rounded-lg bg-wg-orange px-8 py-4 font-light text-white shadow-lg transition-colors hover:bg-wg-orange-dark hover:shadow-xl"
            >
              <span>{t('styleMagazine.cta.button')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default RevistaEstilos;
