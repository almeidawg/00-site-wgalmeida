
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ShoppingCart as ShoppingCartIcon, Ruler, Building2, Hammer, Globe, Cpu } from 'lucide-react';
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
  const [isSaaSMenuOpen, setSaaSMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems } = useCart();
  const { t } = useTranslation();

  const MANAGEMENT_URL = '/admin';
  const location = useLocation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isLightBackgroundPage = useMemo(() => [
    '/faq', '/contato', '/store', '/solicite-proposta', '/room-visualizer',
    '/construtora-alto-padrao-sp', '/reforma-apartamento-sp', '/arquitetura-corporativa',
    '/obra-turn-key', '/reforma-apartamento-itaim', '/reforma-apartamento-jardins',
    '/construtora-brooklin', '/marcenaria-sob-medida-morumbi', '/arquitetura-interiores-vila-nova-conceicao'
  ].includes(location.pathname), [location.pathname]);

  const effectivelyScrolled = isScrolled || isLightBackgroundPage;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
          ticking = false;
        });
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setUnitsMenuOpen(false);
    setSaaSMenuOpen(false);
  }, [location]);

  const navItems = useMemo(() => [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.about'), path: '/sobre' },
    { label: t('nav.brand'), path: '/a-marca' },
    { label: t('nav.projects'), path: '/projetos' },
    { label: t('nav.process'), path: '/processo' },
    { label: t('nav.blog'), path: '/blog' },
  ], [t]);

  const unitsItems = useMemo(() => [
    { label: t('nav.architecture'), path: '/arquitetura', icon: Ruler },
    { label: t('nav.engineering'), path: '/engenharia', icon: Building2 },
    { label: t('nav.carpentry'), path: '/marcenaria', icon: Hammer },
  ], [t]);
  
  const saasItems = useMemo(() => [
      { label: 'WGEasy', path: '/wgeasy', description: 'ERP Inteligente para Obras' },
      { label: 'Easy Food', path: '/easyfood', description: 'SaaS para Food Service' },
      { label: 'AcessooS', path: '/acessos', description: 'Gestão de Condomínios' },
      { label: 'EventOS', path: PRODUCT_URLS.eventos, description: 'Gestão Completa de Eventos' }, // Added EventOS here
      { label: 'Easy Real Estate', path: '/easy-real-state', description: 'Plataforma para Imobiliárias' },
  ], []);

  const navLinkClass = effectivelyScrolled
    ? 'whitespace-nowrap px-2 xl:px-2.5 py-1.5 rounded-full text-[12px] xl:text-[13px] text-wg-gray hover:text-wg-black hover:bg-black/[0.05]'
    : 'whitespace-nowrap px-2 xl:px-2.5 py-2 rounded-full text-[12px] xl:text-[13px] text-white/80 hover:text-white hover:bg-white/[0.08] backdrop-blur-sm';

  const activeNavLinkClass = effectivelyScrolled ? 'bg-black/[0.05] text-wg-black' : 'bg-white/[0.12] text-white';
  const iconButtonClass = effectivelyScrolled ? 'w-8.5 h-8.5 xl:w-9 xl:h-9 border-black/[0.08] bg-white/70' : 'w-9 h-9 xl:w-10 xl:h-10 border-white/20 bg-white/[0.08]';
  const iconColorClass = effectivelyScrolled ? 'text-wg-black' : 'text-white';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[80] bg-transparent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <div className={`container-custom pt-3 md:pt-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
          <div className={`flex items-center justify-between rounded-[28px] px-3 md:px-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isScrolled ? 'border border-black/[0.06] bg-white/60 backdrop-blur-2xl shadow-[0_18px_45px_rgba(12,12,12,0.08)]' : 'border border-white/10 bg-transparent backdrop-blur-0 shadow-none'}`} style={{ height: isScrolled ? '3.25rem' : 'var(--header-height)' }}>
            <div className={`min-w-[4.5rem] xl:min-w-[5.5rem] flex-1 lg:flex-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${isScrolled ? 'w-0 opacity-0 pointer-events-none flex-none' : 'w-auto opacity-100'}`}>
              <Link to="/" className="flex items-center space-x-3" aria-label="Grupo WG Almeida - página inicial">
                <img className="h-12 w-12 object-contain" alt="Logo Grupo WG Almeida" src={HEADER_LOGO_SRC} width="96" height="96" decoding="async" />
              </Link>
            </div>

            <nav className={`hidden xl:flex min-w-0 items-center justify-center px-2 xl:px-3 2xl:px-4 flex-1 transition-all duration-500 ${isScrolled ? 'gap-0.5' : 'gap-1.5 xl:gap-2 2xl:gap-4'}`}>
              {navItems.map((item) => (
                <Link key={item.label} to={item.path} className={`transition-all duration-300 font-suisse font-light ${navLinkClass} ${location.pathname === item.path ? activeNavLinkClass : ''}`}>{item.label}</Link>
              ))}

              <div className="relative h-full flex items-center" onMouseEnter={() => setUnitsMenuOpen(true)} onMouseLeave={() => setUnitsMenuOpen(false)}>
                <button type="button" className={cn("flex items-center gap-1.5 whitespace-nowrap transition-all duration-300 font-suisse font-light", navLinkClass, isUnitsMenuOpen && (isScrolled ? "text-wg-orange bg-black/[0.05]" : "text-white bg-white/[0.12]"))}>
                  <span>{t('header.unitsLabel')}</span>
                  <ChevronDown className={cn("transition-transform duration-500", isScrolled ? "w-3 h-3" : "w-4 h-4", isUnitsMenuOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isUnitsMenuOpen && (
                    <>
                      <div className="absolute top-full left-0 w-full h-8 bg-transparent" />
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.3 }} className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-[90] w-72">
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-2xl">
                          <div className="flex flex-col gap-1">
                            {unitsItems.map((subItem) => (
                              <Link key={subItem.label} to={subItem.path} className="group flex items-center gap-4 px-4 py-3 rounded-[20px] transition-all duration-300 hover:bg-white/5">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 transition-all duration-300 group-hover:bg-white/10"><subItem.icon size={18} className="text-white/70" /></div>
                                <span className="text-[13px] font-bold text-white">{subItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/contato" className={`transition-all duration-300 font-suisse font-light ${navLinkClass} ${location.pathname === '/contato' ? activeNavLinkClass : ''}`}>{t('nav.contact')}</Link>
            </nav>

            <div className={`shrink-0 flex items-center justify-end gap-1.5 md:gap-2 xl:gap-3 transition-all duration-500 ${isScrolled ? 'flex-none' : 'flex-1 lg:flex-none'}`}>
              <div className="hidden 2xl:block"><LanguageSelector /></div>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={t('header.cartAria')}
                className={`relative flex items-center justify-center rounded-full border transition-all backdrop-blur-xl hover:bg-white/10 hover:border-black/15 ${iconButtonClass}`}
              >
                <ShoppingCartIcon className={`${iconColorClass} transition-all ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-wg-orange px-1 text-[10px] font-bold leading-none text-white">
                    {totalItems}
                  </span>
                )}
              </button>

              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setSaaSMenuOpen(true)}
                onMouseLeave={() => setSaaSMenuOpen(false)}
                onKeyDown={(event) => { if (event.key === 'Escape') setSaaSMenuOpen(false); }}
              >
                  <button
                    type="button"
                    onClick={() => setSaaSMenuOpen(true)}
                    onFocus={() => setSaaSMenuOpen(true)}
                    aria-label={t('header.saasMenuLabel', 'Abrir menu de produtos SaaS')}
                    aria-expanded={isSaaSMenuOpen}
                    aria-haspopup="menu"
                    className={`flex items-center justify-center rounded-full border transition-all backdrop-blur-xl hover:bg-white/10 hover:border-black/15 ${iconButtonClass}`}
                  >
                      <Cpu className={`${iconColorClass} transition-all ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  </button>
                  <AnimatePresence>
                  {isSaaSMenuOpen && (
                    <>
                      <div className="absolute top-full left-0 w-full h-8 bg-transparent" />
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.3 }} className="absolute top-[calc(100%+8px)] right-0 z-[90] w-80">
                        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-2xl">
                          <div className="flex flex-col gap-1">
                            {saasItems.map((item) => (
                              <Link key={item.label} to={item.path} className="group flex flex-col px-4 py-3 rounded-[20px] transition-all duration-300 hover:bg-white/5">
                                <span className="text-[13px] font-bold text-white">{item.label}</span>
                                <span className="text-xs text-white/60">{item.description}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <Link to={MANAGEMENT_URL} aria-label="Acessar área de gestão" title="Acessar área de gestão" className={`hidden md:flex items-center justify-center rounded-full border transition-all backdrop-blur-xl hover:bg-white/10 hover:border-black/15 ${iconButtonClass}`}>
                <Globe className={`${iconColorClass} transition-all ${isScrolled ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
              </Link>
              
              <button type="button" className={`xl:hidden transition-colors ${isScrolled ? 'text-wg-black' : 'text-white'}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={isMobileMenuOpen ? t('header.closeMenu') : t('header.openMenu')} aria-expanded={isMobileMenuOpen}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="relative z-[95] max-h-[calc(100dvh-var(--header-height)-1rem)] animate-slideDown overflow-y-auto overscroll-contain border-t border-white/[0.12] bg-[rgba(12,16,22,0.86)] backdrop-blur-2xl xl:hidden">
            <nav className="container-custom py-4 space-y-2">
              {[...navItems, {label: t('header.unitsLabel'), dropdown: unitsItems}, {label: 'SaaS', dropdown: saasItems}, {label: t('nav.contact'), path: '/contato'}].map((item) => (
                <div key={item.path || item.label}>
                   <Link to={item.path} className={`block px-4 py-3 transition-colors font-suisse font-light ${location.pathname === item.path ? 'text-white' : 'text-white/70 hover:text-white'}`}>
                      {item.label}
                    </Link>
                  {item.dropdown && (
                    <div className="pl-4 space-y-1 border-l border-white/10 ml-4">
                      {item.dropdown.map((subItem) => (
                        <Link key={subItem.label} to={subItem.path} className="block px-4 py-2 text-white/70 hover:text-white transition-colors text-sm font-suisse font-light">{subItem.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="px-4 pt-2">
                <LanguageSelector />
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
