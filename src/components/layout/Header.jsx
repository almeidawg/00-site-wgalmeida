import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ShoppingCart as ShoppingCartIcon, Ruler, Building2, Hammer, Globe, Monitor } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';
import { withBasePath } from '@/utils/assetPaths';
import { PRODUCT_URLS } from '@/data/company';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { cn } from '@/lib/utils';

const ShoppingCart = lazy(() => import('@/components/ShoppingCart'));

const SCROLL_THRESHOLD = 72;
const HEADER_LOGO_SRC = withBasePath('/images/logo-192.webp');

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUnitsMenuOpen, setUnitsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems } = useCart();
  const { t } = useTranslation();

  const WG_EASY_URL = PRODUCT_URLS.wgeasy;
  const MANAGEMENT_URL = '/admin';
  const location = useLocation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        globalThis.requestAnimationFrame(() => {
          setIsScrolled(globalThis.scrollY > SCROLL_THRESHOLD);
          ticking = false;
        });
      }
    };
    handleScroll();
    globalThis.addEventListener('scroll', handleScroll, { passive: true });
    return () => globalThis.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setUnitsMenuOpen(false);
  }, [location]);

  const navItems = useMemo(() => [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.about'), path: '/sobre' },
    { label: t('nav.brand'), path: '/a-marca' },
    { label: t('nav.projects'), path: '/projetos' },
    { label: t('nav.process'), path: '/processo' },
    { label: t('nav.blog'), path: '/blog' },
    { label: 'FAQ', path: '/faq' },
    { label: t('nav.store'), path: '/store' },
    { label: t('nav.contact'), path: '/contato' },
  ], [t]);

  const unitsItems = useMemo(() => [
    {
      label: t('nav.architecture'),
      path: '/arquitetura',
      icon: Ruler,
      accent: '#F25C26', // Laranja Arquitetura
      type: 'Arquitetura'
    },
    {
      label: t('nav.engineering'),
      path: '/engenharia',
      icon: Building2,
      accent: '#1e3a8a', // Azul Engenharia (Blue 900)
      type: 'Engenharia'
    },
    {
      label: t('nav.carpentry'),
      path: '/marcenaria',
      icon: Hammer,
      accent: '#78350f', // Marrom Madeira (Amber 900)
      type: 'Marcenaria'
    },
  ], [t]);

  const navLinkClass = isScrolled
    ? 'whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-full text-[12px] xl:text-[13px] text-wg-gray hover:text-wg-black hover:bg-black/[0.05]'
    : 'whitespace-nowrap px-2 xl:px-2.5 py-2 rounded-full text-[12px] xl:text-[13px] text-white/80 hover:text-white hover:bg-white/[0.08] backdrop-blur-sm';

  const activeNavLinkClass = isScrolled
    ? 'bg-black/[0.05] text-wg-black'
    : 'bg-white/[0.12] text-white';

  const iconButtonClass = isScrolled
    ? 'w-8.5 h-8.5 xl:w-9 xl:h-9 border-black/[0.08] bg-white/70 backdrop-blur-xl hover:bg-white hover:border-black/[0.14] shadow-[0_10px_26px_rgba(12,12,12,0.08)]'
    : 'w-9 h-9 xl:w-10 xl:h-10 border-white/20 bg-white/[0.08] backdrop-blur-xl hover:bg-white/[0.16] hover:border-white/30 shadow-[0_14px_34px_rgba(10,10,10,0.16)]';

  const iconColorClass = isScrolled ? 'text-wg-black' : 'text-white';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-[80] bg-transparent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        <div className={`container-custom pt-3 md:pt-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
          <div
            className={`flex items-center justify-between rounded-[28px] px-3 md:px-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isScrolled
                ? 'border border-black/[0.06] bg-white/60 backdrop-blur-2xl shadow-[0_18px_45px_rgba(12,12,12,0.08)]'
                : 'border border-white/10 bg-transparent backdrop-blur-0 shadow-none'
            }`}
            style={{ height: isScrolled ? '3.25rem' : 'var(--header-height)' }}
          >
            {/* Logo */}
            <div
              className={`min-w-[4.5rem] xl:min-w-[5.5rem] flex-1 lg:flex-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
                isScrolled
                  ? 'w-0 opacity-0 pointer-events-none flex-none'
                  : 'w-auto opacity-100'
              }`}
            >
              <Link to="/" className="flex items-center space-x-3">
                <img
                  className="h-12 w-12 object-contain"
                  alt="Logo Grupo WG Almeida"
                  src={HEADER_LOGO_SRC}
                  width="96"
                  height="96"
                  decoding="async"
                />
              </Link>
            </div>

            {/* Nav desktop */}
            <nav className={`hidden xl:flex min-w-0 items-center justify-center px-2 xl:px-3 2xl:px-4 flex-1 transition-all duration-500 ${
              isScrolled ? 'gap-0.5' : 'gap-1.5 xl:gap-2 2xl:gap-4'
            }`}>
              {navItems.slice(0, 3).map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`transition-all duration-300 font-suisse font-light ${navLinkClass} ${
                    location.pathname === item.path ? activeNavLinkClass : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Menu Núcleos (Dropdown Refinado) */}
              <div 
                className="relative h-full flex items-center"
                onMouseEnter={() => setUnitsMenuOpen(true)}
                onMouseLeave={() => setUnitsMenuOpen(false)}
              >
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap transition-all duration-300 font-suisse font-light",
                    navLinkClass,
                    isUnitsMenuOpen && (isScrolled ? "text-orange-600 bg-black/[0.05]" : "text-white bg-white/[0.12]")
                  )}
                >
                  <span>{t('header.unitsLabel')}</span>
                  <ChevronDown className={cn("transition-transform duration-500", isScrolled ? "w-3 h-3" : "w-4 h-4", isUnitsMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isUnitsMenuOpen && (
                    <>
                      {/* Invisible buffer to keep menu open while moving mouse */}
                      <div className="absolute top-full left-0 w-full h-8 bg-transparent" />
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-[90] w-72"
                      >
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-2 shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                          <div className="flex flex-col gap-1">
                            {unitsItems.map((subItem, index) => {
                              return (
                                <Link
                                  key={subItem.label}
                                  to={subItem.path}
                                  className="group flex items-center gap-4 px-4 py-3 rounded-[20px] transition-all duration-500"
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = subItem.accent}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110"
                                  >
                                    <subItem.icon 
                                      size={18} 
                                      className="text-white group-hover:text-white transition-colors duration-300"
                                      style={{ color: subItem.accent }}
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[13px] font-bold text-white group-hover:text-white transition-colors">
                                      {subItem.label}
                                    </span>
                                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold group-hover:text-white/70">
                                      {subItem.type}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                          
                          <div className="mt-2 p-2.5 border-t border-white/5 bg-black/20 rounded-b-2xl">
                             <p className="text-[7px] text-center text-slate-600 uppercase font-bold tracking-[0.2em]">WG Intelligence Ecosystem</p>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {navItems.slice(3).map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`transition-all duration-300 font-suisse font-light ${navLinkClass} ${
                    location.pathname === item.path ? activeNavLinkClass : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Ações à direita */}
            <div className={`shrink-0 flex items-center justify-end gap-1.5 md:gap-2 xl:gap-3 transition-all duration-500 ${
              isScrolled ? 'flex-none' : 'flex-1 lg:flex-none'
            }`}>
              <div className="hidden 2xl:block">
                <LanguageSelector />
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={t('header.cartAria')}
                className={`relative flex items-center justify-center rounded-full border transition-all ${iconButtonClass}`}
              >
                <ShoppingCartIcon className={`${iconColorClass} transition-all ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {totalItems > 0 && (
                  <span className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-light ${
                    isScrolled ? 'bg-wg-black text-white' : 'bg-white text-wg-black'
                  }`}>
                    {totalItems}
                  </span>
                )}
              </button>

              <Link
                to={MANAGEMENT_URL}
                aria-label="Acessar área de gestão"
                title="Acessar área de gestão"
                className={`hidden md:flex items-center justify-center rounded-full border transition-all ${iconButtonClass}`}
              >
                <Globe className={`${iconColorClass} transition-all ${isScrolled ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
              </Link>

              <a
                href={WG_EASY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('header.wgEasyAccess')}
                title={t('header.wgEasyAccess')}
                className={`hidden md:flex items-center justify-center rounded-full border transition-all ${iconButtonClass}`}
              >
                <Monitor className={`${iconColorClass} transition-all ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
              </a>

              <button
                type="button"
                className={`xl:hidden transition-colors ${isScrolled ? 'text-wg-black' : 'text-white'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="relative z-[95] max-h-[calc(100dvh-var(--header-height)-1rem)] animate-slideDown overflow-y-auto overscroll-contain border-t border-white/[0.12] bg-[rgba(12,16,22,0.86)] backdrop-blur-2xl xl:hidden">
            <nav className="container-custom py-4 space-y-2">
              {[...navItems.slice(0,3), {label: t('header.unitsLabel'), dropdown: unitsItems}, ...navItems.slice(3)].map((item) => (
                <div key={item.path || item.label}>
                  {item.dropdown ? (
                    <div className="pl-4 space-y-1">
                      {item.dropdown.map((subItem) => (
                        <Link key={subItem.label} to={subItem.path} className="block px-4 py-2 text-white/70 hover:text-white transition-colors text-sm font-suisse font-light">
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`block px-4 py-3 transition-colors font-suisse font-light ${
                        location.pathname === item.path ? 'text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              <div className="px-4 pt-4 space-y-3">
                <div className="flex items-center justify-center gap-2 py-2">
                  <span className="text-sm text-white/70">{t('header.languageLabel')}</span>
                  <LanguageSelector variant="compact" />
                </div>
                <Link
                  to={MANAGEMENT_URL}
                  className="wg-overlay-button-dark w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center gap-2 text-white text-sm"
                >
                  <Globe className="h-4 w-4" />
                  <span>Área de Gestão</span>
                </Link>
                <a
                  href={WG_EASY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-wg-black rounded-lg font-light hover:bg-white/90 transition-all"
                >
                  <Monitor className="h-5 w-5 text-wg-black" />
                  <span>{t('header.wgEasyAccess')}</span>
                </a>
                <Link
                  to="/contato"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold bg-orange-600 text-white transition-all duration-300"
                >
                  {t('header.ctaSpecialist')}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {isCartOpen && (
        <Suspense fallback={null}>
          <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
        </Suspense>
      )}
    </>
  );
};

export default Header;
