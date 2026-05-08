import { motion, AnimatePresence } from '@/lib/motion-lite';
import { X, Send, CheckCircle2, Star, MessageSquare, Loader2, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMoodboard } from '@/contexts/MoodboardContext';
import { supabase } from '@/lib/customSupabaseClient';

export default function MoodboardLeadModal({ isOpen, onClose }) {
  const { getMoodboardData } = useMoodboard();
  const [step, setStep] = useState('form'); // form | success
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', whatsapp: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep('generating'); // Novo step de transição premium

    const moodboardData = getMoodboardData();
    const stylesStr = moodboardData.styles.map(s => s.name).join(', ');
    const colorsStr = moodboardData.colors.join(', ');
    const message = `Estilos: ${stylesStr} | Cores: ${colorsStr} | Moodboard Studio 2.0 Session`;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: `${formData.name.toLowerCase().replace(/\s+/g, '.')}@moodboard.tmp`,
          phone: formData.whatsapp,
          subject: 'Lead Qualificado: Moodboard Studio',
          message: message,
          context: 'moodboard-studio'
        })
      });

      if (!response.ok) throw new Error('Falha ao salvar lead');
      
      // Simular tempo de geração do dossiê para efeito WOW
      setTimeout(() => setStep('success'), 2500);
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
      alert('Erro ao processar. Tente novamente.');
      setStep('form');
    }
  };

  const handleWhatsAppOpen = () => {
    const message = encodeURIComponent(`Olá Liz! Acabei de finalizar meu Moodboard Studio na WG Almeida. Meu nome é ${formData.name} e gostaria de acessar meu Dossiê de Projeto e falar sobre os próximos passos.`);
    window.open(`https://wa.me/5511984650002?text=${message}`, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={step === 'form' ? onClose : undefined}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
      >
        {step === 'form' && (
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all z-10">
            <X size={20} />
          </button>
        )}

        {/* Efeito de brilho de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="p-10 relative z-10">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/20">
                  <Star size={24} />
                </div>
                <h2 className="text-3xl font-light text-white mb-2 tracking-tight">Sua visão tomou forma.</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                   Para materializarmos isso, nossa IA vai compilar suas escolhas em um <b>Dossiê Técnico Privado</b>. Informe seus dados para liberação do acesso.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <input 
                      required
                      type="text"
                      placeholder="Nome Completo"
                      className="w-full bg-slate-950/50 border border-slate-800/80 rounded-[1.2rem] py-4 px-5 text-sm text-white focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-slate-600"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <input 
                      required
                      type="tel"
                      placeholder="WhatsApp (com DDD)"
                      className="w-full bg-slate-950/50 border border-slate-800/80 rounded-[1.2rem] py-4 px-5 text-sm text-white focus:bg-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all placeholder:text-slate-600"
                      value={formData.whatsapp}
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>

                  <Button 
                    disabled={loading}
                    className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-[1.2rem] font-bold text-base mt-2 shadow-xl shadow-orange-900/30 border-none transition-all hover:scale-[1.02]"
                  >
                    Gerar Dossiê de Projeto
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 'generating' && (
               <motion.div 
                key="generating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center py-10"
              >
                <div className="relative w-24 h-24 mx-auto mb-8">
                   <div className="absolute inset-0 rounded-full border-t-2 border-orange-500 animate-spin"></div>
                   <div className="absolute inset-2 rounded-full border-b-2 border-blue-500 animate-spin-reverse"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Star size={24} className="text-orange-400 animate-pulse" />
                   </div>
                </div>
                <h3 className="text-2xl font-light text-white mb-2">Compilando Dossiê...</h3>
                <p className="text-slate-400 text-sm">A Liz está organizando sua paleta, referências e normativas técnicas correspondentes.</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-light text-white mb-3 tracking-tight">Dossiê Gerado!</h2>
                
                <div className="bg-slate-950/50 border border-emerald-500/20 rounded-2xl p-5 mb-8 text-left">
                   <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Acesso Liberado</p>
                   <p className="text-slate-300 text-sm font-light leading-relaxed">
                     Seus dados foram sincronizados com nosso núcleo técnico. A Liz já tem seu Dossiê em mãos e está pronta para te atender.
                   </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleWhatsAppOpen}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-[1.2rem] font-medium flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-0.5"
                  >
                    <MessageSquare size={20} /> Solicitar Acesso com a Liz
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full h-14 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-[1.2rem] font-medium transition-all"
                  >
                    Fechar e voltar ao Studio
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-slate-950/80 p-5 border-t border-white/5 flex items-center justify-center gap-2">
           <FileText size={14} className="text-slate-500" />
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">WG Intelligence Core</span>
        </div>
      </motion.div>
    </div>
  );
}
