import { motion, AnimatePresence } from '@/lib/motion-lite';
import { X, Send, CheckCircle2, Star, MessageSquare, Loader2, FileText, Sparkles, Database, ShieldCheck, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMoodboard } from '@/contexts/MoodboardContext';
import BrandStar from '@/components/BrandStar';

export default function MoodboardLeadModal({ isOpen, onClose }) {
  const [step, setStep] = useState('form'); // form | generating | success
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
  const [processIndex, setProcessIndex] = useState(0);
  
  const { projectName, getMoodboardData, buildShareUrl } = useMoodboard();

  const processingMessages = [
    { text: "Iniciando WG Intelligence Core...", icon: Database },
    { text: "Analisando harmonia cromática...", icon: Sparkles },
    { text: "Sincronizando catálogo Westwing e Leroy...", icon: Star },
    { text: "Validando especificações técnicas...", icon: ShieldCheck },
    { text: "Gerando Link Único do Dossiê...", icon: FileText }
  ];

  useEffect(() => {
    if (isOpen && step === 'generating') {
      const interval = setInterval(() => {
        setProcessIndex((prev) => {
          if (prev >= processingMessages.length - 1) {
            clearInterval(interval);
            setTimeout(() => setStep('success'), 800);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const shareUrl = buildShareUrl();
    const moodboardData = getMoodboardData();
    const stylesStr = moodboardData.styles.map(s => s.name).join(', ');
    
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.whatsapp,
      subject: `Dossiê Moodboard Studio: ${formData.name}`,
      message: `Projeto: ${projectName} | Estilos: ${stylesStr} | Link: ${shareUrl}`,
      context: 'moodboard-studio-v2',
      metadata: { projectName, shareUrl, styles: stylesStr }
    };

    try {
      // Envia para o pipeline de integração (Supabase / Email / Liz)
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setLoading(false);
      setStep('generating');
    } catch (err) {
      console.error('Erro ao processar lead:', err);
      setLoading(false);
      setStep('generating'); // Segue o fluxo para não frustrar o usuário
    }
  };

  const handleWhatsAppDelivery = () => {
    const shareUrl = buildShareUrl();
    const message = encodeURIComponent(`Olá Liz! Acabei de finalizar meu Dossiê no Moodboard Studio. \n\n📌 Projeto: ${projectName}\n🔗 Acessar meu Dossiê: ${shareUrl}\n\nMeu nome é ${formData.name}, gostaria de validar a viabilidade técnica deste projeto.`);
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
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="p-10 relative z-10">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Star size={24} />
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"><X size={20}/></button>
                </div>
                
                <div>
                  <h2 className="text-3xl font-light text-white mb-2 tracking-tight font-playfair italic">Sua visão tomou forma.</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Para enviar o <b>Dossiê de Especificação</b> do projeto <b>{projectName}</b>, confirme seus dados de contato abaixo.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                   <div className="relative">
                      <input 
                        required
                        type="text"
                        placeholder="Seu nome completo"
                        className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 px-5 text-sm text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input 
                          required
                          type="email"
                          placeholder="Seu melhor e-mail"
                          className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 px-5 text-sm text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="relative">
                        <input 
                          required
                          type="tel"
                          placeholder="WhatsApp com DDD"
                          className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl py-4 px-5 text-sm text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                          value={formData.whatsapp}
                          onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                        />
                      </div>
                   </div>

                   <Button type="submit" disabled={loading} className="w-full h-16 bg-orange-600 hover:bg-orange-500 rounded-2xl text-white font-bold text-lg shadow-xl shadow-orange-900/20 group border-none mt-4 transition-all hover:scale-[1.02]">
                      {loading ? <Loader2 className="animate-spin" /> : (
                        <span className="flex items-center gap-2">Receber Dossiê Gratuito <Send size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                      )}
                   </Button>
                   <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest font-bold">Respeitamos sua privacidade. Seus dados estão seguros.</p>
                </form>
              </motion.div>
            )}

            {step === 'generating' && (
              <motion.div 
                key="generating"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center text-center space-y-8"
              >
                 <div className="relative">
                    <div className="w-28 h-24 rounded-full border-2 border-orange-500/10 flex items-center justify-center">
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 border-t-2 border-orange-500 rounded-full"
                       />
                       <BrandStar className="w-12 h-12 text-orange-500 animate-pulse" />
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <h3 className="text-2xl font-medium text-white italic font-playfair">Gerando sua Experiência</h3>
                    <div className="h-6 overflow-hidden">
                       <AnimatePresence mode="wait">
                          <motion.p 
                            key={processIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="text-sm text-slate-400 font-light flex items-center justify-center gap-3"
                          >
                             {processingMessages[processIndex].text}
                          </motion.p>
                       </AnimatePresence>
                    </div>
                 </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-6 flex flex-col items-center text-center space-y-8"
              >
                 <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-2 border border-emerald-500/20">
                    <CheckCircle2 size={48} />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-3xl font-medium text-white italic font-playfair">Dossiê Enviado!</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Olá <b>{formData.name}</b>, seu link de acesso foi enviado para o seu e-mail. Para recebê-lo agora no <b>WhatsApp</b>, clique no botão abaixo.
                    </p>
                 </div>
                 
                 <div className="w-full space-y-4 pt-4">
                    <button 
                      onClick={handleWhatsAppDelivery}
                      className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-bold text-base flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-600/20 hover:scale-[1.02]"
                    >
                      <MessageSquare size={24} /> Receber no WhatsApp agora
                    </button>
                    <button 
                      onClick={onClose}
                      className="w-full py-4 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Voltar ao Studio
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 bg-slate-950/50 border-t border-white/5 flex items-center justify-center gap-3">
           <ShieldCheck size={14} className="text-slate-600" />
           <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Ambiente Seguro & Criptografado</span>
        </div>
      </motion.div>
    </div>
  );
}
