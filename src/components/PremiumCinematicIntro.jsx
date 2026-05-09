import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { useTranslation, Trans } from 'react-i18next';
import { MonitorCheck } from 'lucide-react';
import { withBasePath } from '@/utils/assetPaths';
import { HERO_MEDIA, getHeroVideoProfile } from '@/utils/cloudinaryMedia';
import { COMPANY } from '@/data/company';

const WG_LOGO = withBasePath('/images/logo-192.webp');
const PROJECTS_FALLBACK_IMAGE = withBasePath('/images/banners/PROJETOS.webp');
const INTRO_VIDEO_POSTER = withBasePath('/images/hero-poster-640.webp');

const WG_COLORS = {
  orange: '#F25C26',
};

const WHATSAPP_NUMBER = COMPANY.phoneRaw.replace('+', '');

const STAGE_TIMES = [
  0, 3000, 6000, 9000, 13000, 16000, 19000, 22000, 25000, 29000, 33000, 37000
];

const TOTAL_DURATION = 45000;

const getViewportForHeroVideo = () => {
  if (globalThis.window === undefined) return { width: 1440, height: 900 };
  const { innerWidth, innerHeight, visualViewport } = globalThis.window;
  return {
    width: Math.round(visualViewport?.width || innerWidth || 1440),
    height: Math.round(visualViewport?.height || innerHeight || 900),
  };
};

const openExternalUrl = (url) => {
  const opened = globalThis.open?.(url, '_blank', 'noopener,noreferrer');
  if (opened) opened.opener = null;
};

const PremiumCinematicIntro = ({ onComplete }) => {
  const { t } = useTranslation();
  const whatsappMessage = t('premiumIntro.whatsappMessage');
  const wgEasyFeatures = t('premiumIntro.stages.wgEasy.features', { returnObjects: true });
  const wgEasyFeatureList = Array.isArray(wgEasyFeatures) ? wgEasyFeatures : [];
  const startTimeRef = useRef(Date.now());
  const [currentStage, setCurrentStage] = useState(0);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const [introVideoProfile, setIntroVideoProfile] = useState(() => {
    if (globalThis.window === undefined) return 'desktopLandscape';
    const vp = getViewportForHeroVideo();
    if (vp.width > vp.height && vp.width > 640) return 'desktopLandscape';
    return getHeroVideoProfile(vp);
  });

  const [elapsed, setElapsed] = useState(0);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  const handleComplete = () => {
    setIsComplete(true);
    window.dispatchEvent(new CustomEvent('wg-intro-complete'));
    if (onComplete) onComplete();
  };

  useEffect(() => {
    const tick = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      let newStage = 0;
      for (let i = STAGE_TIMES.length - 1; i >= 0; i--) {
        if (elapsedTime >= STAGE_TIMES[i]) {
          newStage = i;
          break;
        }
      }
      setElapsed(elapsedTime);
      setCurrentStage(newStage);
      if (elapsedTime >= 3000) setShowWhatsApp(true);
      if (elapsedTime >= TOTAL_DURATION) {
        handleComplete();
      }
    };
    intervalRef.current = setInterval(tick, 100);
    return () => clearInterval(intervalRef.current);
  }, [onComplete]);

  if (isComplete) return null;

  const introVideoSrc = HERO_MEDIA.profiles[introVideoProfile] || HERO_MEDIA.desktop;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[200] overflow-hidden bg-black"
      onClick={handleComplete}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') handleComplete();
      }}
      role="button"
      tabIndex={0}
      aria-label={t('premiumIntro.skip')}
    >
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60 w-full h-full object-cover object-center scale-[1.1]"
          src={introVideoSrc}
          autoPlay muted loop playsInline preload="auto" poster={INTRO_VIDEO_POSTER}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <AnimatePresence mode="wait">
          {currentStage === 0 && (
            <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
              <img src={WG_LOGO} alt="WG" className="h-32 md:h-44 w-auto" />
              <p className="mt-6 text-white/70 text-sm tracking-[0.4em] uppercase">{t('premiumIntro.tagline')}</p>
            </motion.div>
          )}

          {currentStage === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <span className="block text-wg-orange text-xs tracking-[0.3em] uppercase mb-4">{t('premiumIntro.stages.whoWeAre.kicker')}</span>
              <p className="text-white text-3xl md:text-5xl font-playfair italic">{t('premiumIntro.stages.whoWeAre.line1')}<br/>{t('premiumIntro.stages.whoWeAre.line2')}</p>
            </motion.div>
          )}

          {currentStage === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <p className="text-white text-3xl md:text-5xl font-playfair italic">{t('premiumIntro.stages.ecosystem.line1')}<br/>{t('premiumIntro.stages.ecosystem.line2')}</p>
            </motion.div>
          )}

          {currentStage === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <span className="block text-wg-orange text-xs tracking-[0.3em] uppercase mb-4">{t('premiumIntro.stages.whatWeDo.kicker')}</span>
              <p className="text-white text-3xl md:text-5xl font-playfair italic">{t('premiumIntro.stages.whatWeDo.line1')}<br/>{t('premiumIntro.stages.whatWeDo.line2')}</p>
            </motion.div>
          )}

          {currentStage === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <span className="block text-wg-orange text-xs tracking-[0.3em] uppercase mb-4">{t('premiumIntro.stages.units.kicker')}</span>
              <p className="text-white text-3xl md:text-5xl font-playfair italic">{t('premiumIntro.stages.units.line1')}<br/>{t('premiumIntro.stages.units.line2')}</p>
            </motion.div>
          )}

          {currentStage === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <h3 className="text-5xl md:text-7xl font-light text-wg-green mb-4" style={{ fontFamily: 'Inter' }}>{t('premiumIntro.stages.architecture.title')}</h3>
              <p className="text-white/70 text-xl">{t('premiumIntro.stages.architecture.subtitle')}</p>
            </motion.div>
          )}

          {currentStage === 6 && (
            <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <h3 className="text-5xl md:text-7xl font-light text-wg-blue mb-4" style={{ fontFamily: 'Inter' }}>{t('premiumIntro.stages.engineering.title')}</h3>
              <p className="text-white/70 text-xl">{t('premiumIntro.stages.engineering.subtitle')}</p>
            </motion.div>
          )}

          {currentStage === 7 && (
            <motion.div key="s7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <h3 className="text-5xl md:text-7xl font-light text-wg-brown mb-4" style={{ fontFamily: 'Inter' }}>{t('premiumIntro.stages.carpentry.title')}</h3>
              <p className="text-white/70 text-xl">{t('premiumIntro.stages.carpentry.subtitle')}</p>
            </motion.div>
          )}

          {currentStage === 8 && (
            <motion.div key="s8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <span className="block text-wg-orange text-xs tracking-[0.3em] uppercase mb-4">{t('premiumIntro.stages.howWeWork.kicker')}</span>
              <p className="text-white text-3xl md:text-5xl font-playfair italic">{t('premiumIntro.stages.howWeWork.line1')}<br/>{t('premiumIntro.stages.howWeWork.line2')}</p>
            </motion.div>
          )}

          {currentStage === 9 && (
            <motion.div
              key="s9"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-[92vw] px-5 text-center sm:px-8 md:max-w-4xl"
            >
              <motion.span
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-3 block text-xs uppercase tracking-[0.22em] text-wg-orange sm:mb-4 sm:tracking-[0.3em]"
              >
                {t('premiumIntro.stages.wgEasy.kicker')}
              </motion.span>

              <motion.div
                initial={{ scale: 0.82, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.18, type: 'spring', stiffness: 120, damping: 14 }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-wg-orange bg-wg-orange/15 text-wg-orange shadow-[0_0_34px_rgba(242,92,38,0.28)] sm:h-16 sm:w-16"
              >
                <MonitorCheck className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" strokeWidth={1.7} />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-2 font-sans text-3xl font-light text-white sm:text-4xl md:text-5xl"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                WG Easy
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                className="mx-auto mb-4 max-w-2xl text-base sm:text-lg md:text-xl"
                style={{ color: 'rgba(255, 255, 255, 0.82)' }}
              >
                {t('premiumIntro.stages.wgEasy.subtitle')}
              </motion.p>

              {wgEasyFeatureList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-wrap justify-center gap-2 sm:gap-3"
                >
                  {wgEasyFeatureList.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-wg-orange/35 bg-wg-orange/12 px-3 py-1.5 text-xs text-wg-orange sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStage === 10 && (
            <motion.div key="s10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
              <p className="text-white text-3xl md:text-6xl font-medium" style={{ fontFamily: 'Inter' }}>{t('premiumIntro.stages.impact.line1')}<br/><span style={{ color: WG_COLORS.orange }}>{t('premiumIntro.stages.impact.line2')}</span></p>
            </motion.div>
          )}

          {currentStage === 11 && (
            <motion.div key="s11" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center pointer-events-auto px-8">
              <p className="text-white text-3xl md:text-5xl font-playfair italic mb-8">
                {t('premiumIntro.stages.finalCta.line1')}
                <br />
                {t('premiumIntro.stages.finalCta.line2Prefix')}{' '}
                <span className="text-wg-orange">{t('premiumIntro.stages.finalCta.line2Highlight')}</span>
                <br />
                {t('premiumIntro.stages.finalCta.line3')}
              </p>
              <button onClick={() => openExternalUrl(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`)} className="px-10 py-5 bg-wg-orange text-white rounded-full font-bold text-lg hover:brightness-110 transition-all">{t('premiumIntro.cta.button')}</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div className="h-full bg-wg-orange" animate={{ width: `${(elapsed / TOTAL_DURATION) * 100}%` }} />
      </div>

      <button onClick={handleComplete} className="pointer-events-auto absolute right-8 top-8 text-white/30 hover:text-white/70 text-xs tracking-widest uppercase">{t('premiumIntro.skip')}</button>
    </div>
  );
};

PremiumCinematicIntro.propTypes = { onComplete: PropTypes.func };
export default PremiumCinematicIntro;
