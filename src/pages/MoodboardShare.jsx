import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { Download, Share2, Home, FileText, CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { MoodboardCanvas } from '@/components/moodboard';
import BrandStar from '@/components/BrandStar';
import SEO from '@/components/SEO';
import { styleCatalog } from '@/utils/styleCatalog';

const MoodboardShare = () => {
  const [searchParams] = useSearchParams();
  const [showIntro, setShowSuggestions] = useState(true);
  const encodedData = searchParams.get('v');

  const data = useMemo(() => {
    if (!encodedData) return null;
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
      const resolvedStyles = (decoded.s || []).map(slug => 
        styleCatalog.find(s => (s.slug || s.id) === slug)
      ).filter(Boolean);

      return {
        projectName: decoded.p || 'Meu Novo Refúgio',
        clientName: decoded.n || 'Cliente Especial', // Nome do cliente se disponível
        colors: decoded.c || [],
        styles: resolvedStyles,
        customImages: (decoded.i || []).map((img, index) => ({
          id: `share-${index + 1}`,
          url: img.u,
          title: img.t,
          name: img.t || `Referência ${index + 1}`,
          source: 'share',
        })),
        wgeasyId: decoded.ext || null // Preparado para integração WGEasy
      };
    } catch (err) {
      console.error('Erro ao decodificar projeto:', err);
      return null;
    }
  }, [encodedData]);

  // Efeito de entrada: esconde a intro após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowSuggestions(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <BrandStar className="w-12 h-12 text-wg-orange mb-6" />
        <h1 className="text-2xl font-medium font-playfair italic mb-4">Dossiê não encontrado</h1>
        <Link to="/moodboard/studio" className="px-6 py-3 bg-wg-orange text-white rounded-xl font-bold">Criar meu projeto</Link>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${data.projectName} | Dossiê WG Almeida`} noindex />
      
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[300] bg-[#0a0a0b] flex flex-col items-center justify-center text-center p-6"
          >
             <motion.div
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="space-y-6"
             >
                <BrandStar className="w-16 h-16 text-wg-orange mx-auto animate-pulse" />
                <div className="space-y-2">
                   <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-slate-500">Aguardamos por você</h2>
                   <h3 className="text-4xl md:text-6xl font-playfair italic text-white">Seja bem-vindo, {data.clientName}</h3>
                </div>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-[1px] bg-gradient-to-r from-transparent via-wg-orange to-transparent max-w-xs mx-auto"
                />
                <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Gerando sua experiência imersiva...</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#0a0a0b] text-slate-200 flex flex-col relative">
        {/* Marca d'água de luxo no fundo */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
           <div className="absolute top-[-10%] left-[-5%] text-[20vw] font-bold text-white/[0.02] whitespace-nowrap select-none">WG ALMEIDA STUDIO</div>
        </div>

        {/* Header Profissional */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-50">
           <div className="flex items-center gap-8">
              <Link to="/">
                <BrandStar className="w-8 h-8 text-wg-orange hover:scale-110 transition-transform" />
              </Link>
              <div className="h-6 w-[1px] bg-slate-800" />
              <div className="flex flex-col">
                <h1 className="text-lg font-medium text-white italic font-playfair leading-tight">{data.projectName}</h1>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Dossiê de Curadoria Técnica</span>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <Link to="/moodboard/studio" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                 <Sparkles size={14} className="text-wg-orange" /> Editar no Studio
              </Link>
              <button className="flex items-center gap-2 px-6 py-3 bg-wg-orange text-white rounded-xl text-xs font-bold hover:bg-wg-orange/90 transition-all shadow-[0_0_30px_rgba(242,92,38,0.3)]">
                 <Download size={14} /> Download PDF
              </button>
           </div>
        </header>

        <main className="max-w-6xl mx-auto w-full py-16 px-6 space-y-32 relative z-10">
          
          {/* Hero: Moodboard Principal */}
          <section className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-wg-orange uppercase tracking-[0.4em]">01. Conceito Visual</h3>
                  <h2 className="text-4xl font-playfair italic text-white">A Alma do Projeto</h2>
               </div>
               <div className="flex items-center gap-4 text-slate-500 font-mono text-[10px] bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <CheckCircle2 size={12} className="text-green-500" /> CÓDIGO DE VALIDAÇÃO: {Math.random().toString(36).substr(2, 6).toUpperCase()}
               </div>
            </div>
            
            <div className="relative rounded-[48px] overflow-hidden border border-white/10 shadow-2xl bg-slate-900/40 p-4 md:p-8 aspect-[16/10] md:aspect-video group">
              <MoodboardCanvas colors={data.colors} styles={data.styles} customImages={data.customImages} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent opacity-40 pointer-events-none" />
            </div>
          </section>

          {/* Grid de Especificações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Coluna 01: Estilos e Conceitos */}
            <section className="space-y-12">
               <div className="space-y-6">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] border-l-2 border-wg-orange pl-4">Definição de Estilos</h3>
                  <div className="space-y-4">
                    {data.styles.map((style, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-gradient-to-br from-white/[0.05] to-transparent rounded-[32px] border border-white/5 hover:border-wg-orange/20 transition-colors"
                      >
                         <h4 className="text-xl font-medium text-white mb-3">{style.name}</h4>
                         <p className="text-sm text-slate-400 leading-relaxed font-light">{style.excerpt}</p>
                         <div className="flex flex-wrap gap-2 pt-6">
                            {style.tags?.map(tag => <span key={tag} className="text-[10px] text-slate-500 font-medium px-3 py-1 bg-white/5 rounded-full">#{tag}</span>)}
                         </div>
                      </motion.div>
                    ))}
                  </div>
               </div>

               {/* Coluna 02: Paleta Técnica */}
               <div className="space-y-8 pt-8">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] border-l-2 border-wg-orange pl-4">Paleta Cromática Técnica</h3>
                  <div className="grid grid-cols-5 gap-4">
                      {data.colors.map((color, idx) => (
                        <div key={idx} className="group">
                          <div className="aspect-[3/4] rounded-2xl shadow-xl border border-white/10 transition-transform group-hover:scale-105" style={{ backgroundColor: color }} />
                          <p className="text-[10px] font-mono text-center text-slate-600 mt-3">{color.toUpperCase()}</p>
                        </div>
                      ))}
                  </div>
               </div>
            </section>

            {/* Coluna 02: Itens e Ativos */}
            <section className="space-y-10">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] border-l-2 border-wg-orange pl-4">Curadoria de Mobiliário e Acabamentos</h3>
               <div className="grid grid-cols-2 gap-4">
                  {data.customImages.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -10 }}
                      className="group bg-slate-900/50 rounded-3xl overflow-hidden border border-white/5"
                    >
                       <div className="aspect-square overflow-hidden bg-white/5">
                          <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                       </div>
                       <div className="p-5 space-y-1">
                          <p className="text-[10px] text-white font-bold truncate uppercase tracking-tight">{img.title || 'Item Selecionado'}</p>
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] text-slate-500 uppercase tracking-tighter">REF-WG-{idx+100}</span>
                             <span className="text-[9px] text-wg-orange font-bold uppercase tracking-tighter">Validado</span>
                          </div>
                       </div>
                    </motion.div>
                  ))}
               </div>
            </section>
          </div>

          {/* Rodapé Dossiê: Garantia e Próximos Passos */}
          <footer className="pt-24 pb-40">
             <div className="bg-gradient-to-br from-wg-orange to-wg-orange-dark rounded-[64px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-[100px] -ml-32 -mb-32" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-10">
                   <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl border border-white/20">
                      <ShieldCheck size={40} />
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-3xl md:text-5xl font-playfair italic text-white">Sua obra em boas mãos.</h3>
                      <p className="text-white/80 text-lg font-light leading-relaxed">
                        Este dossiê técnico agora faz parte do nosso ecossistema de inteligência. A Liz e nosso time de engenharia estão prontos para transformar este moodboard em um cronograma de execução real.
                      </p>
                   </div>
                   <Link to="/solicite-proposta" className="inline-flex items-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-3xl font-bold text-lg hover:bg-slate-100 transition-all shadow-2xl hover:-translate-y-1">
                      Agendar Reunião de Viabilidade <ArrowRight size={20} />
                   </Link>
                </div>
             </div>

             <div className="mt-12 flex flex-col items-center gap-4 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <div className="flex gap-12 items-center">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white">WGEASY CRM</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white">OBRA EASY PIPELINE</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white">WESTWING CONNECT</span>
                </div>
                <p className="text-[9px] font-mono text-slate-500">WG ALMEIDA DOSSIER VISUAL - DOCUMENTO SEGURO</p>
             </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default MoodboardShare;
