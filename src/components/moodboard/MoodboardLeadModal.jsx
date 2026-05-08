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
    setLoading(true);

    const moodboardData = getMoodboardData();
    const leadData = {
      full_name: formData.name,
      phone: formData.whatsapp,
      source: 'Moodboard Studio 2.0',
      metadata: {
        moodboard: moodboardData,
        message: `Cliente gerou curadoria viva com ${moodboardData.colors.length} cores e ${moodboardData.styles.length} estilos.`
      }
    };

    try {
      // 1. Salva na tabela de contatos
      const { error } = await supabase.from('contacts').insert([leadData]);
      if (error) throw error;

      // 2. Simulação de processamento inteligente
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStep('success');
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
      alert('Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOpen = () => {
    const message = encodeURIComponent(`Olá Liz! Acabei de finalizar meu Moodboard Studio na WG Almeida. Meu nome é ${formData.name} e gostaria de receber meu Link de Curadoria Viva e falar sobre meu projeto.`);
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
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all">
          <X size={20} />
        </button>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-6">
                  <Star size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Sua Curadoria está pronta.</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                   Para gerar seu <b>Link Público de Estilo</b> com sua paleta, referências e orientações técnicas da nossa curadoria, informe como podemos te chamar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Seu Nome</label>
                    <input 
                      required
                      type="text"
                      placeholder="Ex: William Almeida"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-5 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">WhatsApp</label>
                    <input 
                      required
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 px-5 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      value={formData.whatsapp}
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>

                  <Button 
                    disabled={loading}
                    className="w-full h-14 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-base mt-4 shadow-lg shadow-orange-900/20"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Gerar Meu Link de Curadoria'}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Curadoria Salva!</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  Seu link público de estilo foi gerado. Agora a Liz (nossa assistente IA) vai te enviar o acesso e pode tirar suas dúvidas sobre como transformar essa visão em um projeto real.
                </p>

                <div className="space-y-3">
                  <button 
                    onClick={handleWhatsAppOpen}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                  >
                    <MessageSquare size={20} /> Falar com a Liz agora
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all"
                  >
                    Voltar para o Studio
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-slate-950/50 p-6 border-t border-slate-800/50 flex items-center justify-center gap-2">
           <FileText size={14} className="text-slate-600" />
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Curadoria Viva · BuildTech Intelligence</span>
        </div>
      </motion.div>
    </div>
  );
}
