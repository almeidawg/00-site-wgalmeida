import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from '@/App';
import '@/index.css';
import '@/i18n'; // Internacionalizacao
import AnalyticsEvents from '@/components/AnalyticsEvents';
import { CartProvider } from '@/hooks/useCart';
import { getBasePath, withBasePath } from '@/utils/assetPaths';

const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const disableServiceWorkerTemporarily = true;

const scheduleIdle = (callback, timeout = 1800) => {
  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(timeoutId);
};

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Erro inesperado' };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo);
    if (!import.meta.env.PROD) return;

    fetch('/api/client-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        message: String(error?.message || 'unknown').slice(0, 500),
        componentStack: String(errorInfo?.componentStack || '').slice(0, 1200),
        path: window.location.pathname,
      }),
    }).catch(() => {
      // Telemetria de erro nunca deve derrubar a experiencia.
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ marginBottom: 12, fontSize: 24 }}>Falha ao carregar a aplicação</h1>
            <p style={{ marginBottom: 12, color: '#4C4C4C' }}>Atualize a página com Ctrl+F5. Se persistir, me envie essa mensagem:</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f3f3f3', padding: 12, borderRadius: 8 }}>{this.state.message}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Web Vitals - Monitoramento de Performance
const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    scheduleIdle(() => {
      import('web-vitals').then((metrics) => {
        ['onCLS', 'onFCP', 'onLCP', 'onTTFB', 'onINP', 'onFID'].forEach((fnName) => {
          if (typeof metrics?.[fnName] === 'function') {
            metrics[fnName](onPerfEntry);
          }
        });
      });
    }, 2200);
  }
};

// Função para enviar métricas para o Analytics
const sendToAnalytics = (metric) => {
  const { name, delta, id, value } = metric;
  
  // Envia para o dataLayer (GTM)
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'web_vitals',
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_name: name,
    metric_id: id,
    metric_value: value,
    metric_delta: delta,
    non_interaction: true,
  });

  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}: ${value.toFixed(2)} (ID: ${id})`);
  }
};

function DeferredClientEnhancements() {
  const [Enhancements, setEnhancements] = React.useState(null);

  React.useEffect(() => scheduleIdle(() => {
    import('@/components/DeferredClientEnhancements')
      .then((module) => setEnhancements(() => module.default))
      .catch(() => {
        // Melhorias de telemetria nao devem bloquear a experiencia principal.
      });
  }, 1800), []);

  if (!Enhancements) return null;

  return <Enhancements />;
}

// Ativar monitoramento em todos os ambientes (envio condicional via GTM)
reportWebVitals(sendToAnalytics);

// Em caso de regressao de midia/cache, removemos SW ativamente ate reestabilizar producao.
if ('serviceWorker' in navigator && (isLocalPreview || disableServiceWorkerTemporarily)) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .catch(() => {
      // Falha silenciosa - preview local continua funcional.
    });
}

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator && import.meta.env.PROD && !isLocalPreview && !disableServiceWorkerTemporarily) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(withBasePath('/sw.js'))
      .then((registration) => {
        // SW registrado com sucesso
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versao disponivel - pode notificar usuario
              }
            });
          }
        });
      })
      .catch(() => {
        // Falha silenciosa - SW nao e critico
      });
  });
}

const rootElement = document.getElementById('root');
const rootKey = '__wgAlmeidaReactRoot__';

const app = (
  <AppErrorBoundary>
    <HelmetProvider>
      <BrowserRouter basename={getBasePath() || undefined}>
        <CartProvider>
          <AnalyticsEvents />
          <App />
          <DeferredClientEnhancements />
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  </AppErrorBoundary>
);

// Renderizacao SPA consistente (evita mismatch com fallback SEO estatico no HTML)
if (rootElement.hasChildNodes()) {
  rootElement.innerHTML = '';
}

const root = window[rootKey] || ReactDOM.createRoot(rootElement);
window[rootKey] = root;
root.render(app);






