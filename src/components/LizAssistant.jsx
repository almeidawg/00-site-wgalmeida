import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { MessageSquare, X, Sparkles, Send, ArrowRight } from 'lucide-react';
import { trackWhatsappClick } from '@/lib/analytics';
import { COMPANY } from '@/data/company';

export default function LizAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  // Auto-prompt after 10 seconds if not opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen && !hasPrompted) setHasPrompted(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, [isOpen, hasPrompted]);

  const handleOpenWhatsApp = (customMessage) => {
    const defaultMsg = 'Olá! Gostaria de falar com a Liz sobre um projeto na WG Almeida.';
    const msg = customMessage || defaultMsg;
    
    trackWhatsappClick({ context: 'liz_copilot', target: COMPANY.phoneRaw });
    window.open(`https://wa.me/5511984650002?text=${encodeURIComponent(msg)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {/* Prompt Bubble */}
          {!isOpen && hasPrompted && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="mb-4 mr-2 bg-white text-slate-800 p-4 rounded-2xl rounded-br-sm shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 max-w-[240px] cursor-pointer hover:shadow-[0_15px_50px_rgba(0,0,0,0.15)] transition-shadow"
              onClick={() => setIsOpen(true)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Liz · AI Concierge</p>
                  <p className="text-sm leading-snug font-light">Posso te ajudar a estimar o custo do seu projeto ou encontrar o estilo ideal?</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setHasPrompted(false);
          }}
          className={`w-14 h-14 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-colors border ${
            isOpen 
              ? 'bg-slate-900 border-slate-700 text-white' 
              : 'bg-gradient-to-tr from-slate-900 to-slate-800 border-slate-700 text-white'
          }`}
          aria-label="Falar com a Liz"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </div>

      {/* Expanded Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[100] w-[calc(100vw-3rem)] sm:w-[360px] bg-white rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[50px]" />
              <div className="relative z-10 flex items-center gap-4">
                 <div className="relative">
                   <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 p-[2px]">
                      <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden">
                         <img src="/images/icone.webp" alt="Liz" className="w-8 h-8 opacity-80 object-contain" />
                      </div>
                   </div>
                   <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                 </div>
                 <div>
                   <h3 className="text-white font-medium text-lg">Liz WG</h3>
                   <p className="text-blue-200 text-xs tracking-widest uppercase font-bold">Concierge Digital</p>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex-1">
              <p className="text-slate-600 text-sm font-light leading-relaxed mb-6">
                Olá! Sou a inteligência artificial do Grupo WG Almeida. Posso te conectar com um diretor de projeto ou responder suas dúvidas instantaneamente no WhatsApp.
              </p>

              <div className="space-y-3">
                <button 
                  onClick={() => handleOpenWhatsApp('Olá Liz! Gostaria de agendar uma reunião com um especialista.')}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Falar com especialista</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors group-hover:translate-x-1" />
                </button>
                <button 
                  onClick={() => handleOpenWhatsApp('Olá Liz! Quero fazer uma simulação de custo de obra.')}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">Simular custo de obra</span>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors group-hover:translate-x-1" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100">
               <button 
                  onClick={() => handleOpenWhatsApp()}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={18} /> Ir para o WhatsApp
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
