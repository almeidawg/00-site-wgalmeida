/**
 * Hook para buscar estatísticas em tempo real do Sistema WG
 * Conecta ao Supabase para obter dados de contratos
 */

import { useState, useEffect } from "react";

// Data de fundação do primeiro CNPJ (para cálculo de horas)
// Desde 28/10/2011
const DATA_FUNDACAO = new Date("2011-10-28");
const ANOS_MERCADO_BASE = 15;

// Metros de revestimentos: base histórica validada para a vitrine (não é dado
// ao vivo, ver nota abaixo em "contratos_itens").
const METROS_REVESTIMENTOS_FALLBACK = 3898;

// Detecta erro de "tabela/relação não existe" do PostgREST (schema drift),
// para não tratar como falha genérica de rede/permissão nem logar como se
// fosse um bug inesperado. Ver governança WG: padrão "isSchemaAbsenceError"
// (WGEasy, regra 1.23).
function isSchemaAbsenceError(error) {
  if (!error) return false;
  if (error.code === "PGRST205") return true;
  const message = String(error.message || "");
  return message.includes("schema cache") || message.includes("Could not find the table");
}

export function useEstatisticasWG(options = {}) {
  const { enabled = true } = options;
  // Valores fallback renderizam imediatamente (não bloqueia LCP)
  const [estatisticas, setEstatisticas] = useState(() => ({
    clientesAtendidos: 400,
    metrosRevestimentos: 3898,
    projetosAndamento: 7,
    horasProjetando: Math.floor((Date.now() - new Date("2011-10-28").getTime()) / 3600000),
    anosExperiencia: Math.max(Math.floor((Date.now() - new Date("2011-10-28").getTime()) / (365.25 * 86400000)), ANOS_MERCADO_BASE),
    loading: false,
    error: null,
  }));

  // Calcular horas desde a fundação
  const calcularHorasDesdeDataFundacao = () => {
    const agora = new Date();
    const diffMs = agora.getTime() - DATA_FUNDACAO.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHoras;
  };

  // Calcular anos de experiência
  const calcularAnosExperiencia = () => {
    const agora = new Date();
    const diffMs = agora.getTime() - DATA_FUNDACAO.getTime();
    const diffAnos = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
    return Math.max(diffAnos, ANOS_MERCADO_BASE);
  };

  useEffect(() => {
    if (!enabled) return () => {};

    let isCancelled = false;

    const buscarEstatisticas = async () => {
      try {
        const { supabase } = await import("@/lib/customSupabaseClient");

        // Buscar contratos ativos (projetos em andamento)
        const { data: contratosAtivos, error: errorAtivos } = await supabase
          .from("contratos")
          .select("id, valor_total")
          .eq("status", "ativo");

        // Buscar todos os contratos (ativos + concluídos = clientes atendidos)
        const { data: todosContratos, error: errorTodos } = await supabase
          .from("contratos")
          .select("id, valor_total, status")
          .in("status", ["ativo", "concluido"]);

        // Erro inesperado (não ausência de schema conhecida) nas duas queries
        // acima: sinaliza em DEV para não repetir o mesmo tipo de silêncio que
        // escondeu o schema drift de "contratos_itens" por tempo indeterminado.
        if (import.meta.env.DEV) {
          [errorAtivos, errorTodos].forEach((err) => {
            if (err && !isSchemaAbsenceError(err)) {
              console.warn("[useEstatisticasWG] Erro ao buscar contratos:", err.message);
            }
          });
        }

        // Metros de revestimentos: NÃO consultamos mais "contratos_itens" aqui.
        // NOTA (2026-07-24): confirmado via probe read-only direto no PostgREST
        // deste projeto (ahlqzzkxuutwoepirpzr) que a tabela "contratos_itens"
        // não existe mais no schema público (PGRST205 "Could not find the table
        // 'public.contratos_itens' in the schema cache", mesmo erro que uma
        // tabela inventada de controle, confirmando ausência real, não RLS/
        // permissão). Não existe hoje tabela sucessora com o mesmo formato
        // (contrato_id + quantidade + unidade) legível pela chave anônima:
        // "propostas_itens" tem quantidade/unidade mas é por proposta, não por
        // contrato assinado, e "contratos_nucleos" não tem essas colunas.
        // A query antiga sempre resultava em 404 silencioso no browser e nunca
        // teve efeito real (o cálculo já caía neste mesmo valor de fallback).
        // Fica um número estático documentado; se uma tabela real de itens de
        // contrato voltar a existir, trocar aqui para consultá-la ao vivo em
        // vez de reintroduzir uma chamada fadada a falhar.
        const metrosRevestimentos = METROS_REVESTIMENTOS_FALLBACK;

        // Calcular métricas
        const projetosAndamento = contratosAtivos?.length || 6;
        const clientesAtendidos = todosContratos?.length || 400;

        // Calcular horas e anos
        const horasProjetando = calcularHorasDesdeDataFundacao();
        const anosExperiencia = calcularAnosExperiencia();

        if (isCancelled) return;

        setEstatisticas({
          clientesAtendidos: Math.max(clientesAtendidos, 400), // Mínimo vitrine homologado
          metrosRevestimentos: Math.max(metrosRevestimentos, 3898), // Mínimo histórico validado
          projetosAndamento: projetosAndamento + 1, // +1 conforme solicitado
          horasProjetando,
          anosExperiencia,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (isCancelled) return;

        console.error("Erro ao buscar estatísticas:", error);
        // Em caso de erro, usar valores base
        setEstatisticas((prev) => ({
          ...prev,
          horasProjetando: calcularHorasDesdeDataFundacao(),
          anosExperiencia: calcularAnosExperiencia(),
          loading: false,
          error: error.message,
        }));
      }
    };

    // Defer Supabase queries until after LCP (5s or user interaction)
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      buscarEstatisticas();
    };

    const timeoutId = setTimeout(schedule, 5000);
    const events = ['scroll', 'click', 'touchstart'];
    const onInteraction = () => {
      clearTimeout(timeoutId);
      // Small delay after interaction to not compete with UI response
      setTimeout(schedule, 800);
      events.forEach(e => window.removeEventListener(e, onInteraction));
    };
    events.forEach(e => window.addEventListener(e, onInteraction, { once: true, passive: true }));

    // Atualizar horas a cada minuto
    const intervalHoras = setInterval(() => {
      setEstatisticas((prev) => ({
        ...prev,
        horasProjetando: calcularHorasDesdeDataFundacao(),
      }));
    }, 60000);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      clearInterval(intervalHoras);
      events.forEach(e => window.removeEventListener(e, onInteraction));
    };
  }, [enabled]);

  return estatisticas;
}

// Função utilitária para formatar números grandes
export function formatarNumeroGrande(numero) {
  if (numero >= 1000000) {
    return (numero / 1000000).toFixed(1).replace(".", ",") + "M";
  }
  if (numero >= 1000) {
    return (numero / 1000).toFixed(0) + "mil";
  }
  return numero.toLocaleString("pt-BR");
}

// Função para formatar horas em formato legível
export function formatarHoras(horas) {
  if (horas >= 1000) {
    return Math.floor(horas / 1000) + "mil";
  }
  return horas.toLocaleString("pt-BR");
}

export default useEstatisticasWG;
