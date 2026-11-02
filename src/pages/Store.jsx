import React, { lazy, Suspense } from 'react';
import { motion } from '@/lib/motion-lite';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { SCHEMAS } from '@/data/schemaConfig';
import { normalizeUnsplashImageUrl } from '@/lib/unsplash';
import SafeImage from '@/components/SafeImage';
import { withBasePath } from '@/utils/assetPaths';
import { isPublicStoreConfigured } from '@/utils/storePublicReadiness';

const ProductsList = lazy(() => import('@/components/ProductsList'));

const STORE_HERO_IMAGE = normalizeUnsplashImageUrl('https://images.unsplash.com/photo-1507473885765-e6ed057f782c', {
  width: 1920,
  height: 1080,
  quality: 80,
});
const STORE_HERO_FALLBACK = withBasePath('/images/banners/MARCENARIA.webp');

const Store = () => {
  const { t } = useTranslation();
  const catalogReady = isPublicStoreConfigured(import.meta.env);

  return (
    <>
      <SEO pathname="/store" schema={SCHEMAS.breadcrumbStore} />

      {/* Hero Section */}
      <section className="wg-page-hero wg-page-hero--store hero-under-header bg-wg-black">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Imagem de luminárias/decoração */}
          <SafeImage
            className="w-full h-full object-cover"
            alt={t('storePage.hero.imageAlt')}
            src={STORE_HERO_IMAGE}
            fallbackSrc={STORE_HERO_FALLBACK}
            width="1920"
            height="1080"
            decoding="async"
            loading="eager"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-wg-black/40 via-wg-black/50 to-wg-black/70"></div>
        </motion.div>

        <div className="container-custom">
          <div className="wg-page-hero-content px-4 pt-8 md:pt-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="wg-page-hero-title"
          >
            {t('storePage.hero.title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="wg-page-hero-subtitle max-w-3xl"
          >
            {t('storePage.hero.subtitle')}
          </motion.p>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-7"
          >
            <span className="wg-overlay-chip-dark md:px-6 md:py-3.5">
              <ShoppingBag className="w-4 h-4" />
              {t('storePage.hero.badge')}
            </span>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Seção de produtos */}
      <section className="relative overflow-hidden bg-[#F6F4EF] pb-16 pt-8 md:pb-20">
        <div className="container-custom relative z-10">
          {import.meta.env.VITE_WG_STORE_OFFERS_ENABLED === 'true' && (
            <p className="mb-5 text-sm text-gray-600">A WG Store pode utilizar links de afiliados. As condições de compra, entrega e devolução são definidas pelo fornecedor indicado.</p>
          )}
          {catalogReady ? (
            <Suspense fallback={null}>
              <ProductsList />
            </Suspense>
          ) : (
            <div role="status" className="mx-auto max-w-3xl rounded-xl bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                {t('storePage.catalogUnavailable.title', { defaultValue: 'Vitrine em preparação' })}
              </h2>
              <p className="mb-6 text-gray-700">
                {t('storePage.catalogUnavailable.message', { defaultValue: 'Estamos validando as ofertas e os fornecedores antes de disponibilizar o catálogo. Enquanto isso, solicite uma proposta à nossa equipe.' })}
              </p>
              <a href="/solicite-proposta" className="inline-block rounded-lg bg-wg-black px-6 py-3 font-medium text-white hover:opacity-90">
                {t('storePage.catalogUnavailable.action', { defaultValue: 'Solicitar proposta' })}
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Store;






