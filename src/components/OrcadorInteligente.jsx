import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { ArrowRight, ArrowLeft, CheckCircle2, Building2, Ruler, Loader2, Sparkles, Calculator, PenTool, TrendingUp, Home } from 'lucide-react';
import { useWGContext } from '@/providers/ContextProvider';
import { useTranslation } from 'react-i18next';

const SERVICE_OPTIONS = [
  'Obra Turn Key (Completa)',
  'Apenas Projeto de Interiores',
  'Apenas Marcenaria Sob Medida',
  'Consultoria Técnica',
  'Sistema de Experiência Visual',
];

const calculateEstimate = (metragem, servico) => {
  const m2 = parseInt(metragem) || 0;
  if (m2 < 10) return null;

  let min = 0;
  let max = 0;

  if (servico.includes('Turn Key')) {
    min = m2 * 3500;
    max = m2 * 6500;
  } else if (servico.includes('Projeto')) {
    min = m2 * 150;
    max = m2 * 350;
  } else if (servico.includes('Marcenaria')) {
    min = m2 * 1200;
    max = m2 * 2800;
  } else {
    return null; // Não precifica consultoria/sistema genericamente
  }

  const format = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  return `${format(min)} a ${format(max)}`;
};

const OrcadorInteligente = ({
  initialService = '',
  initialPropertyType = '',
  sourceContext = '',
  introLabel = '',
}) => {
  const { t } = useTranslation();
  const { context: wgContext } = useWGContext() || { context: {} };
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    tipoImovel: initialPropertyType,
    metragem: '',
    servico: initialService,
    prazo: '',
  });

  const handleNext = () => {
    if (step === 3) {
      // Step 3 -> 4: Fake calculation delay for "AI" feel
      setIsCalculating(true);
      setEstimate(calculateEstimate(formData.metragem, formData.servico));
      setStep(4);
      setTimeout(() => setIsCalculating(false), 1800);
    } else {
      setStep((s) => Math.min(s + 1, 4));
    }
  };
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalSource = sourceContext || wgContext?.origem || 'site-wgalmeida';
    const message = `Serviço: ${formData.servico} | Imóvel: ${formData.tipoImovel} | Metragem: ${formData.metragem}m² | Prazo: ${formData.prazo} | Origem: ${finalSource} | Faixa Visualizada: ${estimate || 'N/A'}`;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email,
          phone: formData.telefone,
          subject: `Orçamento Inteligente: ${formData.servico}`,
          message: message,
          context: sourceContext || 'orcamento'
        })
      });

      if (!response.ok) throw new Error('Falha ao enviar proposta');

      setSuccess(true);
    } catch (err) {
      console.error('Erro ao enviar orçamento:', err);
      alert('Ocorreu um erro. Por favor, tente novamente ou nos chame no WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-10 flex items-center justify-center gap-2 md:gap-3">
      {[1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-light transition-all duration-500 ${
              step >= i
                ? 'bg-gradient-to-tr from-wg-orange to-wg-orange/70 text-white shadow-lg shadow-wg-orange/30'
                : 'border border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            {i}
          </div>
          {i < 4 && (
            <div className="relative h-px w-12 md:w-16 bg-slate-100 overflow-hidden">
              <div 
                className={`absolute inset-0 bg-wg-orange transition-transform duration-700 ease-in-out ${step > i ? 'translate-x-0' : '-translate-x-full'}`} 
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden border border-black/5 bg-white p-8 text-center shadow-[0_28px_80px_rgba(30,24,20,0.08)] rounded-[2.5rem] md:p-14"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 shadow-inner"
          >
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </motion.div>
          <h3 className="mb-4 text-3xl md:text-4xl font-light text-slate-900 tracking-tight">Oportunidade Destravada!</h3>
          <p className="mb-10 text-lg text-slate-500 max-w-lg mx-auto leading-relaxed font-light">
            Sua solicitação foi processada pelo nosso sistema. O seu diretor de projeto entrará em contato em breve para apresentar o planejamento técnico exato.
          </p>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-10 py-4 text-sm font-medium text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 md:w-auto"
          >
            Voltar para Home
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/90 backdrop-blur-xl p-6 shadow-[0_30px_100px_rgba(0,0,0,0.08)] md:p-12">
      {/* Decorative premium glows */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-wg-orange/10 blur-[100px]" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-wg-blue/5 blur-[100px]" />
      
      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="relative z-10">
        {introLabel ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-[1.6rem] border border-black/5 bg-wg-gray-light px-6 py-5 text-sm text-wg-black flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 shrink-0 text-wg-orange mt-0.5" />
            <span className="leading-relaxed font-light">{introLabel}</span>
          </motion.div>
        ) : null}
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <h3 className="text-3xl font-light text-slate-900 tracking-tight mb-2">Qual o perfil do ativo?</h3>
                <p className="text-slate-500 font-light">Selecione a categoria para adequarmos as normativas técnicas.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {['Apartamento de Alto Padrão', 'Casa em Condomínio', 'Comercial / Corporativo', 'Outro Formato'].map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, tipoImovel: tipo });
                      handleNext();
                    }}
                    className={`group relative overflow-hidden min-h-[9rem] rounded-[2rem] border-2 p-6 text-left transition-all duration-300 ${
                      formData.tipoImovel === tipo
                        ? 'border-wg-orange bg-wg-orange/5 shadow-[0_8px_30px_rgba(242,92,38,0.12)]'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="relative z-10">
                      <div
                        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300 ${
                          formData.tipoImovel === tipo
                            ? 'bg-gradient-to-br from-wg-orange to-wg-orange/80 text-white shadow-lg shadow-wg-orange/30'
                            : 'bg-slate-50 text-slate-400 group-hover:bg-wg-orange/10 group-hover:text-wg-orange'
                        }`}
                      >
                        <Building2 className="h-6 w-6" />
                      </div>
                      <span className={`block text-lg transition-colors ${formData.tipoImovel === tipo ? 'font-medium text-slate-900' : 'font-light text-slate-600'}`}>
                        {tipo}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <h3 className="text-3xl font-light text-slate-900 tracking-tight mb-2">Qual escopo técnico?</h3>
                <p className="text-slate-500 font-light">Defina o nível de integração que você precisa da WG Almeida.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {SERVICE_OPTIONS.map((srv) => (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, servico: srv });
                      handleNext();
                    }}
                    className={`group min-h-[7.5rem] rounded-[2rem] border-2 p-6 text-left transition-all duration-300 ${
                      formData.servico === srv
                        ? 'border-wg-orange bg-wg-orange/5 shadow-[0_8px_30px_rgba(242,92,38,0.12)]'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <span className={`block text-lg transition-colors ${formData.servico === srv ? 'font-medium text-slate-900' : 'font-light text-slate-600'}`}>
                      {srv}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between pt-6">
                <button type="button" onClick={handlePrev} className="flex items-center gap-2 px-4 py-2 font-light text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft className="h-4 w-4" /> Voltar</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
               <div className="text-center">
                <h3 className="text-3xl font-light text-slate-900 tracking-tight mb-2">Dimensões e Cronograma</h3>
                <p className="text-slate-500 font-light">Estes dados calibram nosso motor de precificação preditiva.</p>
              </div>
              <div className="space-y-6 max-w-xl mx-auto">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Área de intervenção (m²)</label>
                  <div className="relative group">
                    <Ruler className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-wg-orange transition-colors" />
                    <input
                      type="number"
                      required
                      value={formData.metragem}
                      onChange={(e) => setFormData({ ...formData, metragem: e.target.value })}
                      className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50/50 py-4 pl-14 pr-4 text-slate-900 focus:bg-white focus:border-wg-orange focus:outline-none focus:ring-4 focus:ring-wg-orange/10 transition-all"
                      placeholder="Ex: 120"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Expectativa de entrega</label>
                  <select
                    required
                    value={formData.prazo}
                    onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                    className="w-full appearance-none rounded-[1.5rem] border border-slate-200 bg-slate-50/50 px-5 py-4 text-slate-900 focus:bg-white focus:border-wg-orange focus:outline-none focus:ring-4 focus:ring-wg-orange/10 transition-all cursor-pointer"
                  >
                    <option value="">Selecione o cronograma desejado...</option>
                    <option value="Urgente (1 a 3 meses)">Fast Track (1 a 3 meses)</option>
                    <option value="Normal (3 a 6 meses)">Padrão WG (3 a 6 meses)</option>
                    <option value="Planejamento (+ 6 meses)">Planejamento de Longo Prazo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between pt-8 max-w-xl mx-auto">
                <button type="button" onClick={handlePrev} className="flex items-center gap-2 px-4 py-2 font-light text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft className="h-4 w-4" /> Voltar</button>
                <button type="button" onClick={handleNext} disabled={!formData.metragem || !formData.prazo} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-3.5 text-sm font-medium text-white transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
                  Gerar Estimativa <Calculator className="h-4 w-4 ml-1" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              
              {isCalculating ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20">
                     <div className="absolute inset-0 rounded-full border-t-2 border-wg-orange animate-spin"></div>
                     <div className="absolute inset-2 rounded-full border-l-2 border-slate-800 animate-spin-reverse"></div>
                     <Calculator className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="mt-8 text-xl font-light text-slate-900">Processando parâmetros...</h3>
                  <p className="text-slate-500 text-sm mt-2">Buscando referências na base ICCRI 2026</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4">
                      <CheckCircle2 size={14} /> Análise Preliminar Concluída
                    </span>
                    <h3 className="text-3xl font-light text-slate-900 tracking-tight mb-4">
                      Seu projeto requer atenção especial.
                    </h3>
                    
                    {estimate ? (
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 max-w-xl mx-auto text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <p className="text-white/60 text-sm uppercase tracking-widest mb-2 font-medium">Investimento Estimado (WG Padrão)</p>
                        <p className="text-3xl md:text-4xl font-light tracking-tight">{estimate}</p>
                        <p className="text-white/40 text-xs mt-4">
                          *Apenas uma previsão algorítmica. O valor exato depende do Book Técnico final.
                        </p>
                      </div>
                    ) : (
                       <p className="text-slate-500 font-light max-w-lg mx-auto">
                        Para o serviço selecionado e dimensões, precisamos de uma análise humana criteriosa para evitar desvios no seu budget.
                      </p>
                    )}
                  </div>

                  <div className="max-w-xl mx-auto bg-slate-50 border border-slate-100 rounded-[2rem] p-6 md:p-8">
                     <p className="text-center font-medium text-slate-900 mb-6">Para onde devemos enviar a Proposta Técnica Exata e o Book de Apresentação?</p>
                     
                    <div className="space-y-5">
                      <div>
                        <input
                          type="text"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-5 py-4 focus:border-wg-orange focus:outline-none focus:ring-4 focus:ring-wg-orange/10 transition-all shadow-sm"
                          placeholder="Nome Completo"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-5 py-4 focus:border-wg-orange focus:outline-none focus:ring-4 focus:ring-wg-orange/10 transition-all shadow-sm"
                          placeholder="Melhor E-mail"
                        />
                        <input
                          type="tel"
                          required
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                          className="w-full rounded-[1.2rem] border border-slate-200 bg-white px-5 py-4 focus:border-wg-orange focus:outline-none focus:ring-4 focus:ring-wg-orange/10 transition-all shadow-sm"
                          placeholder="WhatsApp"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
                      <button type="button" onClick={handlePrev} className="order-2 flex items-center gap-2 font-light text-slate-400 hover:text-slate-900 md:order-1"><ArrowLeft className="h-4 w-4" /> Voltar</button>
                      <button type="submit" disabled={loading || !formData.nome || !formData.telefone} className="order-1 flex w-full items-center justify-center gap-2 rounded-full bg-wg-orange px-10 py-4 text-sm font-medium text-white transition-all hover:bg-wg-orange/90 hover:shadow-xl hover:shadow-wg-orange/20 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 md:order-2 md:w-auto">
                        {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Gerando Proposta...</> : <>Receber Proposta Técnica <ArrowRight className="h-4 w-4" /></>}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default OrcadorInteligente;
