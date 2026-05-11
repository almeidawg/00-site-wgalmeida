const COMMERCIAL_GOVERNANCE_GENERATED = {
  "generatedAt": "2026-05-11T02:02:35.775Z",
  "services": {
    "iccri-reforma-civil-sp": {
      "sourceOfTruth": "ICCRI editorial/comercial homologado · competencia 2026-03-01",
      "sourceBreakdown": [
        "iccri_indice.valor_indice=R$ 176 como indice de referencia operacional",
        "faixas publicas homologadas da regua ICCRI 2026 para reforma em Sao Paulo"
      ],
      "latestIndexValue": 176.02,
      "latestIndexCompetencia": "2026-03-01",
      "packages": {
        "essencial": {
          "minValue": 1500,
          "maxValue": 2500,
          "rangeLabel": "R$ 1.500 a R$ 2.500 por m2"
        },
        "equilibrado": {
          "minValue": 2500,
          "maxValue": 4500,
          "rangeLabel": "R$ 2.500 a R$ 4.500 por m2"
        },
        "superior": {
          "minValue": 4500,
          "maxValue": 6500,
          "rangeLabel": "R$ 4.500 a R$ 6.500 por m2"
        },
        "exclusivo": {
          "minValue": 6500,
          "maxValue": null,
          "rangeLabel": "R$ 6.500+ por m2"
        }
      }
    },
    "marcenaria-sob-medida": {
      "sourceOfTruth": "Supabase · pricelist_itens + iccri_servicos · snapshot 2026-05-11",
      "sourceBreakdown": [
        "pricelist_itens (nome~marcenaria, unidade=m2) · 3 registro(s) validado(s)",
        "iccri_servicos (nome~marcen, unidade=m2) · 13 registro(s) validado(s)"
      ],
      "packages": {
        "essencial": {
          "minValue": 700,
          "maxValue": 1200,
          "rangeLabel": "R$ 700 a R$ 1.200 por m2"
        },
        "equilibrado": {
          "minValue": 1200,
          "maxValue": 1500,
          "rangeLabel": "R$ 1.200 a R$ 1.500 por m2"
        },
        "superior": {
          "minValue": 1500,
          "maxValue": 3100,
          "rangeLabel": "R$ 1.500 a R$ 3.100 por m2"
        },
        "exclusivo": {
          "minValue": 4800,
          "maxValue": null,
          "rangeLabel": "R$ 4.800+ por m2"
        }
      }
    },
    "cacamba-residuos-sp": {
      "status": "active",
      "sourceOfTruth": "Supabase · pricelist_itens residuos/logistica · snapshot 2026-05-11",
      "sourceBreakdown": [
        "pricelist_itens (nome~cacamba|entulho|remocao|ensacar) · 12 registro(s) validado(s)"
      ],
      "packages": {
        "essencial": {
          "minValue": 400,
          "maxValue": 500,
          "rangeLabel": "R$ 400 a R$ 500 por retirada"
        },
        "equilibrado": {
          "minValue": 700,
          "maxValue": 1100,
          "rangeLabel": "R$ 700 a R$ 1.100 por retirada"
        },
        "superior": {
          "minValue": 1100,
          "maxValue": 1400,
          "rangeLabel": "R$ 1.100 a R$ 1.400 por retirada"
        },
        "exclusivo": {
          "minValue": 1700,
          "maxValue": null,
          "rangeLabel": "R$ 1.700+ por operacao dedicada"
        }
      }
    }
  }
};

export default COMMERCIAL_GOVERNANCE_GENERATED;
