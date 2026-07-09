export const resumo = {
  impressoras: 232,
  estoqueUnidades: 456,
  valorEstoque: 58258.48,
  itensCriticos: 8,
};

export const alertasCriticos = [
  { secretaria: "Saúde", local: "UBS Central", suprimento: "Toner HP CF283A", situacao: "Sem estoque", dias: 0 },
  { secretaria: "Educação", local: "EMEF Rui Barbosa", suprimento: "Toner Brother TN-1060", situacao: "Sem estoque", dias: 0 },
  { secretaria: "Saúde", local: "Hospital Municipal", suprimento: "Toner HP CE285A", situacao: "Crítico", dias: 3 },
  { secretaria: "Administração", local: "Paço Municipal", suprimento: "Toner Samsung MLT-D111S", situacao: "Crítico", dias: 5 },
  { secretaria: "Educação", local: "CMEI Pequeno Príncipe", suprimento: "Cilindro Brother DR-1060", situacao: "Sem estoque", dias: 0 },
  { secretaria: "Assistência Social", local: "CRAS I", suprimento: "Toner HP CF217A", situacao: "Crítico", dias: 4 },
  { secretaria: "Saúde", local: "UBS Bela Vista", suprimento: "Toner Lexmark 50F4H00", situacao: "Sem estoque", dias: 0 },
  { secretaria: "Obras", local: "Secretaria de Obras", suprimento: "Toner HP CF230A", situacao: "Crítico", dias: 2 },
];

export const fases = [
  {
    fase: "Hoje",
    titulo: "Cenário Atual",
    descricao: "Uso imediato do estoque disponível para suprir demandas críticas de Saúde e Educação.",
    cor: "success" as const,
    icone: "📦",
  },
  {
    fase: "Ata",
    titulo: "Compra via Ata de Registro",
    descricao: "Aquisição planejada com ata vigente para cobrir todas as secretarias nos próximos 90 dias.",
    cor: "info" as const,
    icone: "📝",
  },
  {
    fase: "Outsourcing",
    titulo: "Terceirização de Impressão",
    descricao: "Contrato de outsourcing com franquia mensal, SLA e substituição de parque obsoleto.",
    cor: "warning" as const,
    icone: "🚀",
  },
];

export type Situacao = "atendido" | "parcial" | "nao_atendido";

export interface ItemCenario {
  secretaria: string;
  local: string;
  suprimento: string;
  necessaria: number;
  atendida: number;
}

const base: ItemCenario[] = [
  { secretaria: "Saúde", local: "UBS Central", suprimento: "Toner HP CF283A", necessaria: 6, atendida: 6 },
  { secretaria: "Saúde", local: "Hospital Municipal", suprimento: "Toner HP CE285A", necessaria: 10, atendida: 7 },
  { secretaria: "Saúde", local: "UBS Bela Vista", suprimento: "Toner Lexmark 50F4H00", necessaria: 4, atendida: 0 },
  { secretaria: "Saúde", local: "Vigilância Sanitária", suprimento: "Toner HP CF217A", necessaria: 3, atendida: 3 },
  { secretaria: "Educação", local: "EMEF Rui Barbosa", suprimento: "Toner Brother TN-1060", necessaria: 8, atendida: 0 },
  { secretaria: "Educação", local: "EMEF Monteiro Lobato", suprimento: "Toner HP CF230A", necessaria: 5, atendida: 5 },
  { secretaria: "Educação", local: "CMEI Pequeno Príncipe", suprimento: "Cilindro Brother DR-1060", necessaria: 2, atendida: 0 },
  { secretaria: "Educação", local: "Secretaria de Educação", suprimento: "Toner Samsung MLT-D111S", necessaria: 6, atendida: 4 },
  { secretaria: "Administração", local: "Paço Municipal", suprimento: "Toner Samsung MLT-D111S", necessaria: 12, atendida: 8 },
  { secretaria: "Administração", local: "Recursos Humanos", suprimento: "Toner HP CF283A", necessaria: 4, atendida: 4 },
  { secretaria: "Assistência Social", local: "CRAS I", suprimento: "Toner HP CF217A", necessaria: 5, atendida: 2 },
  { secretaria: "Assistência Social", local: "CREAS", suprimento: "Toner HP CF230A", necessaria: 3, atendida: 3 },
  { secretaria: "Obras", local: "Secretaria de Obras", suprimento: "Toner HP CF230A", necessaria: 4, atendida: 1 },
  { secretaria: "Meio Ambiente", local: "Sec. Meio Ambiente", suprimento: "Toner Brother TN-1060", necessaria: 2, atendida: 2 },
  { secretaria: "Fazenda", local: "Sec. Fazenda", suprimento: "Toner HP CF283A", necessaria: 5, atendida: 5 },
];

function filtro(items: ItemCenario[], secretarias: string[] | null, atender: "estoque" | "ata"): ItemCenario[] {
  return items
    .filter((i) => (secretarias ? secretarias.includes(i.secretaria) : true))
    .map((i) => {
      if (atender === "ata") return { ...i, atendida: i.necessaria };
      return i;
    });
}

export const cenarios = {
  c1: {
    titulo: "C1 — Estoque para Saúde e Educação",
    descricao: "Priorização do estoque atual apenas para as secretarias de Saúde e Educação.",
    items: filtro(base, ["Saúde", "Educação"], "estoque"),
  },
  c2: {
    titulo: "C2 — Estoque para Todas as Secretarias",
    descricao: "Distribuição do estoque atual entre todas as secretarias municipais.",
    items: filtro(base, null, "estoque"),
  },
  c3: {
    titulo: "C3 — Compra via Ata (Saúde e Educação)",
    descricao: "Aquisição via ata de registro de preços cobrindo integralmente Saúde e Educação.",
    items: filtro(base, ["Saúde", "Educação"], "ata"),
  },
  c4: {
    titulo: "C4 — Compra via Ata (Todas as Secretarias)",
    descricao: "Aquisição via ata de registro de preços cobrindo todas as secretarias.",
    items: filtro(base, null, "ata"),
  },
};

export function situacaoDe(item: ItemCenario): Situacao {
  if (item.atendida >= item.necessaria) return "atendido";
  if (item.atendida === 0) return "nao_atendido";
  return "parcial";
}

// Estoque — 95 itens
const suprimentos = [
  "Toner HP CF283A", "Toner HP CF217A", "Toner HP CE285A", "Toner HP CF230A", "Toner HP CF280A",
  "Toner HP CF226A", "Toner HP CB435A", "Toner HP CE278A", "Toner HP CF400A", "Toner HP CF401A",
  "Toner Brother TN-1060", "Toner Brother TN-660", "Toner Brother TN-1000", "Cilindro Brother DR-1060", "Cilindro Brother DR-2340",
  "Toner Samsung MLT-D111S", "Toner Samsung MLT-D101S", "Toner Samsung MLT-D104S", "Toner Samsung MLT-D116L", "Toner Samsung SCX-4200",
  "Toner Lexmark 50F4H00", "Toner Lexmark E260A11L", "Toner Lexmark MX310", "Toner Xerox 106R02773", "Toner Xerox 3020",
  "Cartucho HP 664 Preto", "Cartucho HP 664 Color", "Cartucho HP 662 Preto", "Cartucho HP 662 Color", "Cartucho Epson 664 Preto",
];
const secretariasList = ["Saúde", "Educação", "Administração", "Assistência Social", "Obras", "Fazenda", "Meio Ambiente"];
const locais = ["Almoxarifado Central", "Depósito Saúde", "Depósito Educação", "Paço Municipal", "CRAS I"];

export interface ItemEstoque {
  id: number;
  codigo: string;
  suprimento: string;
  secretaria: string;
  local: string;
  quantidade: number;
  valorUnit: number;
  mapeado: boolean;
}

export const estoque: ItemEstoque[] = Array.from({ length: 95 }).map((_, i) => {
  const sup = suprimentos[i % suprimentos.length];
  const mapeado = i % 5 !== 0;
  return {
    id: i + 1,
    codigo: `SUP-${String(i + 1).padStart(4, "0")}`,
    suprimento: sup,
    secretaria: secretariasList[i % secretariasList.length],
    local: locais[i % locais.length],
    quantidade: ((i * 7) % 30) + 1,
    valorUnit: 80 + ((i * 13) % 350),
    mapeado,
  };
});

export const estoqueResumo = {
  total: estoque.length,
  mapeados: estoque.filter((e) => e.mapeado).length,
  naoMapeados: estoque.filter((e) => !e.mapeado).length,
  unidades: estoque.reduce((s, e) => s + e.quantidade, 0),
  valorTotal: estoque.reduce((s, e) => s + e.quantidade * e.valorUnit, 0),
};
