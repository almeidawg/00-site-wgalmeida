import Header from '@/components/layout/Header'
import { Suspense, lazy, useEffect, useLayoutEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { AuthProvider } from '@/contexts/SupabaseAuthContext'
import { Loader2 } from 'lucide-react'
import { PRODUCT_URLS } from '@/data/company'
import { ContextProvider } from '@/providers/ContextProvider'

// Lazy load pages
const Footer = lazy(() => import('@/components/layout/Footer'))
const ContextTracker = lazy(() => import('@/components/ContextTracker'))
const NextBestActionPanel = lazy(() => import('@/components/NextBestActionPanel'))
const LizAssistant = lazy(() => import('@/components/LizAssistant'))
const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const AMarca = lazy(() => import('@/pages/AMarca'))
const Architecture = lazy(() => import('@/pages/Architecture'))
const Engineering = lazy(() => import('@/pages/Engineering'))
const Carpentry = lazy(() => import('@/pages/Carpentry'))
const Projects = lazy(() => import('@/pages/Projects'))
const Process = lazy(() => import('@/pages/Process'))
const Testimonials = lazy(() => import('@/pages/Testimonials'))
const Contact = lazy(() => import('@/pages/Contact'))
const Store = lazy(() => import('@/pages/Store'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const Success = lazy(() => import('@/pages/Success'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Account = lazy(() => import('@/pages/Account'))
const Admin = lazy(() => import('@/pages/Admin'))
const AdminBlogEditorial = lazy(() => import('@/pages/AdminBlogEditorial'))
const AdminLayout = lazy(() => import('@/components/Admin/AdminLayout'))
const MediaManager = lazy(() => import('@/pages/AdminMediaManager'))
const PremiumCinematicIntro = lazy(() => import('@/components/PremiumCinematicIntro'))

// Region Pages (SEO)
const Brooklin = lazy(() => import('@/pages/regions/Brooklin'))
const VilaNovaConceicao = lazy(() => import('@/pages/regions/VilaNovaConceicao'))
const Itaim = lazy(() => import('@/pages/regions/Itaim'))
const Jardins = lazy(() => import('@/pages/regions/Jardins'))
const CidadeJardim = lazy(() => import('@/pages/regions/CidadeJardim'))
const Morumbi = lazy(() => import('@/pages/regions/Morumbi'))
const VilaMariana = lazy(() => import('@/pages/regions/VilaMariana'))
const Mooca = lazy(() => import('@/pages/regions/Mooca'))
const AltoDePinheiros = lazy(() => import('@/pages/regions/AltoDePinheiros'))
const Moema = lazy(() => import('@/pages/regions/Moema'))
const CampoBelo = lazy(() => import('@/pages/regions/CampoBelo'))
const Higienopolis = lazy(() => import('@/pages/regions/Higienopolis'))
const Pinheiros = lazy(() => import('@/pages/regions/Pinheiros'))
const Perdizes = lazy(() => import('@/pages/regions/Perdizes'))
const Paraiso = lazy(() => import('@/pages/regions/Paraiso'))
const Aclimacao = lazy(() => import('@/pages/regions/Aclimacao'))
const SoliciteProposta = lazy(() => import('@/pages/SoliciteProposta'))
const Blog = lazy(() => import('@/pages/Blog'))
const FAQ = lazy(() => import('@/pages/FAQ'))
const Moodboard = lazy(() => import('@/pages/Moodboard'))
const MoodboardStudio = lazy(() => import('@/pages/MoodboardStudio'))
const MoodboardShare = lazy(() => import('@/pages/MoodboardShare'))
const RoomVisualizer = lazy(() => import('@/pages/RoomVisualizer'))
const RevistaEstilos = lazy(() => import('@/pages/RevistaEstilos'))
const EstiloDetail = lazy(() => import('@/pages/EstiloDetail'))

// Empresas do Grupo WG Almeida
const EasyLocker = lazy(() => import('@/pages/EasyLocker'))
const BuildTech = lazy(() => import('@/pages/BuildTech'))
const BuildTechClientProposal = lazy(() => import('@/pages/BuildTechClientProposal'))
const ICCRI = lazy(() => import('@/pages/ICCRI'))
const ICCRIParaImobiliarias = lazy(() => import('@/pages/ICCRIParaImobiliarias'))

// Landing Pages SaaS · ObraEasy e EasyRealState
const ObraEasyLanding      = lazy(() => import('@/pages/ObraEasyLanding'))
const EasyRealStateLanding = lazy(() => import('@/pages/EasyRealStateLanding'))

// Redirect component para ObraEasy parceiros (externo)
function ObraEasyParceiroRedirect() {
  useEffect(() => {
    window.location.replace(`${PRODUCT_URLS.obraeasy}/landing/corretor`)
  }, [])
  return null
}

// Landing Pages Estratégicas (SEO)
const ConstrutoraAltoPadraoSP = lazy(() => import('@/pages/ConstrutoraAltoPadraoSP'))
const ReformaApartamentoSP = lazy(() => import('@/pages/ReformaApartamentoSP'))
const ArquiteturaCorporativa = lazy(() => import('@/pages/ArquiteturaCorporativa'))
const ObraTurnKey = lazy(() => import('@/pages/ObraTurnKey'))

// Landing Pages Serviço + Bairro (SEO Local)
const ReformaApartamentoItaim = lazy(() => import('@/pages/ReformaApartamentoItaim'))
const ReformaApartamentoJardins = lazy(() => import('@/pages/ReformaApartamentoJardins'))
const ConstrutoraBrooklin = lazy(() => import('@/pages/ConstrutoraBrooklin'))
const MarcenariaSobMedidaMorumbi = lazy(() => import('@/pages/MarcenariaSobMedidaMorumbi'))
const ArquiteturaInterioresVilaNovaConceicao = lazy(
  () => import('@/pages/ArquiteturaInterioresVilaNovaConceicao')
)

const LoadingFallback = () => (
  <div className="min-h-screen w-full flex justify-center items-center bg-wg-gray-light">
    <Loader2 className="h-10 w-10 text-wg-orange animate-spin opacity-60" />
  </div>
)

const APP_BUILD_TAG = '2026-05-07-cockpit-v2'

const scheduleIdle = (callback, timeout = 1600) => {
  if (typeof window === 'undefined') return undefined

  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(callback, { timeout })
    return () => window.cancelIdleCallback(idleId)
  }

  const timeoutId = window.setTimeout(callback, timeout)
  return () => window.clearTimeout(timeoutId)
}

function ConteudoRedirect() {
  const { slug } = useParams()
  return <Navigate to={slug ? `/blog/${slug}` : '/blog'} replace />
}

function RouteScrollManager() {
  const location = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const previous = window.history.scrollRestoration
      window.history.scrollRestoration = 'manual'

      return () => {
        window.history.scrollRestoration = previous
      }
    }

    return undefined
  }, [])

  useLayoutEffect(() => {
    const headerHeight = Number.parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
      10
    ) || 0

    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return undefined
    }

    let cancelled = false
    let attempts = 0
    const maxAttempts = 24

    const scrollToHashTarget = () => {
      if (cancelled) return

      const targetId = decodeURIComponent(location.hash.slice(1))
      const target = targetId ? document.getElementById(targetId) : null

      if (!target) {
        if (attempts < maxAttempts) {
          attempts += 1
          window.requestAnimationFrame(scrollToHashTarget)
        }
        return
      }

      const top = window.scrollY + target.getBoundingClientRect().top - headerHeight - 24
      window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'auto' })
    }

    window.requestAnimationFrame(scrollToHashTarget)

    return () => {
      cancelled = true
    }
  }, [location.pathname, location.hash])

  return null
}

function DeferredEngagementLayer() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => scheduleIdle(() => setEnabled(true), 1400), [])

  if (!enabled) return null

  return (
    <Suspense fallback={null}>
      <ContextTracker />
    </Suspense>
  )
}

function DeferredFooter() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => scheduleIdle(() => setEnabled(true), 1200), [])

  if (!enabled) return null

  return (
    <Suspense fallback={null}>
      <Footer />
    </Suspense>
  )
}

function HomeWithIntro() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === 'undefined') return false
    const forceIntro = new URLSearchParams(window.location.search).get('intro') === '1'
    return forceIntro || !sessionStorage.getItem('wg-intro-completed')
  })

  if (showIntro) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <PremiumCinematicIntro 
          onComplete={() => {
            setShowIntro(false)
            sessionStorage.setItem('wg-intro-completed', 'true')
          }} 
        />
      </Suspense>
    )
  }

  return <Home />
}

function App() {
  const location = useLocation()
  const buildTechHostname = new URL(PRODUCT_URLS.buildtech).hostname
  const isBuildTechHost = typeof window !== 'undefined'
    && window.location.hostname === buildTechHostname
  const shouldInitAuth = [
    '/login',
    '/register',
    '/account',
    '/admin',
    '/room-visualizer',
    '/visualizador-ambientes',
    '/moodboard/studio',
  ].some((path) => location.pathname.startsWith(path))

  // Garante canonical sempre sem "www" em qualquer rota SPA
  useEffect(() => {
    const link = document.querySelector('link[rel="canonical"]')
    if (link) {
      const rawPath = location?.pathname || '/'
      let normalizedPath = rawPath.replace(/\/{2,}/g, '/')
      if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
        normalizedPath = normalizedPath.slice(0, -1)
      }
      link.setAttribute('href', `https://wgalmeida.com.br${normalizedPath}`)
    }
  }, [location])

  // Sinaliza ao prerender que os metadados da rota atual ja foram aplicados.
  useEffect(() => {
    let isDone = false
    let observer
    let timeoutId

    const emitReady = () => {
      if (isDone) return
      isDone = true
      document.dispatchEvent(new Event('prerender-ready'))
      if (observer) observer.disconnect()
      if (timeoutId) window.clearTimeout(timeoutId)
    }

    // Usa MutationObserver em vez de polling a cada 120ms
    const main = document.querySelector('main')
    if (main) {
      const check = () => {
        const heading = main.querySelector('h1, h2')
        if (heading?.textContent?.trim()?.length) emitReady()
      }
      check() // verificar imediatamente
      if (!isDone) {
        observer = new MutationObserver(check)
        observer.observe(main, { childList: true, subtree: true })
      }
    }

    // Fallback: 3s maximo
    timeoutId = window.setTimeout(emitReady, 3000)

    return () => {
      if (observer) observer.disconnect()
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [location.pathname])

  // Não mostrar header/footer em páginas standalone
  const isStandaloneRoute =
    ['/login', '/admin', '/clientes', '/buildtech/clientes', '/moodboard', '/moodboard/studio'].some((path) =>
      location.pathname.startsWith(path)
    );

  return (
    <ContextProvider>
    <AuthProvider autoInit={shouldInitAuth}>
      <DeferredEngagementLayer />
      <RouteScrollManager />
      <div
        className="min-h-screen flex flex-col bg-white"
        data-app-build={APP_BUILD_TAG}
      >
        {!isStandaloneRoute && <Header />}
        <main
          className="flex-grow bg-white"
          style={{ paddingTop: isStandaloneRoute ? '0' : 'var(--header-height)' }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={isBuildTechHost ? <BuildTech /> : <HomeWithIntro />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/a-marca" element={<AMarca />} />
              <Route path="/arquitetura" element={<Architecture />} />
              <Route path="/engenharia" element={<Engineering />} />
              <Route path="/marcenaria" element={<Carpentry />} />
              {/* Outras empresas do Grupo WG Almeida */}
              <Route path="/easylocker" element={<EasyLocker />} />
              <Route path="/buildtech" element={<BuildTech />} />
              <Route path="/buildtech/solucoes.html" element={<BuildTech />} />
              <Route path="/buildtech/metodo.html" element={<BuildTech />} />
              <Route path="/buildtech/cases.html" element={<BuildTech />} />
              <Route path="/buildtech/blog.html" element={<BuildTech />} />
              <Route
                path="/buildtech/contato.html"
                element={<Navigate to="/contato?context=buildtech" replace />}
              />
              <Route path="/clientes/:slug" element={<BuildTechClientProposal />} />
              <Route path="/buildtech/clientes/:slug" element={<BuildTechClientProposal />} />
              <Route path="/iccri" element={<ICCRI />} />
              <Route path="/iccri-para-imobiliarias" element={<ICCRIParaImobiliarias />} />
              <Route path="/obraeasy" element={<ObraEasyLanding />} />
              <Route path="/parceiros" element={<ObraEasyParceiroRedirect />} />
              <Route path="/corretor" element={<ObraEasyParceiroRedirect />} />
              <Route path="/easy-real-state" element={<EasyRealStateLanding />} />
              <Route
                path="/easyrealstate"
                element={<Navigate to="/easy-real-state" replace />}
              />
              <Route path="/projetos" element={<Projects />} />
              <Route path="/processo" element={<Process />} />
              <Route path="/depoimentos" element={<Testimonials />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/solicite-proposta" element={<SoliciteProposta />} />
              <Route
                path="/solicite-sua-proposta"
                element={<Navigate to="/solicite-proposta" replace />}
              />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Blog />} />
              <Route path="/conteudo" element={<ConteudoRedirect />} />
              <Route path="/conteudo/:slug" element={<ConteudoRedirect />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/revista-estilos" element={<RevistaEstilos />} />
              <Route path="/estilos/:slug" element={<EstiloDetail />} />

              {/* Moodboard & Room Visualizer */}
              <Route path="/moodboard" element={<MoodboardStudio />} />
              <Route path="/moodboard/studio" element={<MoodboardStudio />} />
              <Route path="/moodboard/share" element={<MoodboardShare />} />
              <Route path="/moodboard-generator" element={<Navigate to="/moodboard" replace />} />
              <Route path="/gerador-moodboard" element={<Navigate to="/moodboard" replace />} />
              <Route path="/room-visualizer" element={<RoomVisualizer />} />
              <Route path="/tools" element={<Navigate to="/buildtech" replace />} />
              <Route
                path="/tools/moodboard-generator"
                element={<Navigate to="/moodboard-generator" replace />}
              />
              <Route
                path="/tools/room-visualizer"
                element={<Navigate to="/room-visualizer" replace />}
              />
              <Route
                path="/visualizador-ambientes"
                element={<Navigate to="/room-visualizer" replace />}
              />

              {/* Landing Pages Estratégicas (SEO) */}
              <Route path="/construtora-alto-padrao-sp" element={<ConstrutoraAltoPadraoSP />} />
              <Route path="/reforma-apartamento-sp" element={<ReformaApartamentoSP />} />
              <Route path="/arquitetura-corporativa" element={<ArquiteturaCorporativa />} />
              <Route path="/obra-turn-key" element={<ObraTurnKey />} />
              <Route
                path="/turn-key/alto_padrao"
                element={<Navigate to="/obra-turn-key" replace />}
              />

              {/* Landing Pages Serviço + Bairro (SEO Local) */}
              <Route path="/reforma-apartamento-itaim" element={<ReformaApartamentoItaim />} />
              <Route path="/reforma-apartamento-jardins" element={<ReformaApartamentoJardins />} />
              <Route path="/construtora-brooklin" element={<ConstrutoraBrooklin />} />
              <Route
                path="/marcenaria-sob-medida-morumbi"
                element={<MarcenariaSobMedidaMorumbi />}
              />
              <Route
                path="/arquitetura-interiores-vila-nova-conceicao"
                element={<ArquiteturaInterioresVilaNovaConceicao />}
              />

              {/* Region Pages (SEO) */}
              <Route path="/brooklin" element={<Brooklin />} />
              <Route path="/vila-nova-conceicao" element={<VilaNovaConceicao />} />
              <Route path="/itaim" element={<Itaim />} />
              <Route path="/jardins" element={<Jardins />} />
              <Route path="/cidade-jardim" element={<CidadeJardim />} />
              <Route path="/morumbi" element={<Morumbi />} />
              <Route path="/vila-mariana" element={<VilaMariana />} />
              <Route path="/mooca" element={<Mooca />} />
              <Route path="/alto-de-pinheiros" element={<AltoDePinheiros />} />
              <Route path="/moema" element={<Moema />} />
              <Route path="/campo-belo" element={<CampoBelo />} />
              <Route path="/higienopolis" element={<Higienopolis />} />
              <Route path="/pinheiros" element={<Pinheiros />} />
              <Route path="/perdizes" element={<Perdizes />} />
              <Route path="/paraiso" element={<Paraiso />} />
              <Route path="/aclimacao" element={<Aclimacao />} />

              {/* Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<Admin />} />
                        <Route path="blog-editorial" element={<AdminBlogEditorial />} />
                        <Route path="media" element={<MediaManager />} />
                        <Route path="seo" element={<div className="text-slate-500 py-20 text-center italic">SEO Manager em breve...</div>} />
                        <Route path="settings" element={<div className="text-slate-500 py-20 text-center italic">Configurações em breve...</div>} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Store Pages */}
              <Route path="/store" element={<Store />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/success" element={<Success />} />
            </Routes>
          </Suspense>
        </main>
        {!isStandaloneRoute && <DeferredFooter />}
      </div>
    </AuthProvider>
    </ContextProvider>
  )
}

export default App
