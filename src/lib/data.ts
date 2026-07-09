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

// ===== Parque de Impressoras =====
export const estoqueAtual: Record<string, number> = {
  "Epson T664 Preto": 30,
  "Epson T544 Preto": 10,
  "Brother TN3492": 2,
  "Brother TN3472": 5,
  "Brother TN2370": 7,
  "Brother TN1060": 6,
  "Brother TN116BR": 0,
  "HP 83A": 60,
  "HP CB435": 27,
  "HP 17A": 4,
  "HP 85A": 0,
  "HP 78A": 0,
  "HP 58X": 0,
  "Samsung D203U": 0,
  "Samsung D208L": 37,
  "Samsung D201L": 0,
  "Samsung D111L": 13,
  "Samsung D104S": 9,
  "Samsung D101": 0,
  "Samsung D205L": 0,
  "Pantum TL411X": 5,
  "Pantum PB211EV": 3,
  "Lexmark 56F0Z00": 0,
  "Ricoh SP3710X": 0,
  "Kit Plotter T3170": 0,
};

export type TipoImpressora = "Jato de Tinta" | "Laser PB" | "Laser Colorido" | "Plotter";
export interface Impressora {
  secretaria: string;
  local: string;
  modelo: string;
  tipo: TipoImpressora;
  toner: string;
}

export const impressoras: Impressora[] = [
  { secretaria: "SAD", local: "Recursos Humanos", modelo: "SCX-5835", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SAD", local: "Recursos Humanos", modelo: "Brother DCP-5652DN", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SAD", local: "Recursos Humanos", modelo: "Brother 6912DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SAD", local: "Compras", modelo: "SCX-5835", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SAD", local: "Compras", modelo: "SLM-4070", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SAD", local: "Compras", modelo: "Brother 5652DN", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SAD", local: "Licitação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SAD", local: "Licitação", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SAD", local: "Almoxarifado Externo", modelo: "Brother 6912DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEFIP", local: "Finanças/CAC", modelo: "MX-410", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEFIP", local: "Finanças/CAC", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEFIP", local: "Finanças/CAC", modelo: "DCP-5652DN", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEFIP", local: "Finanças/SAREN", modelo: "SCX-5835", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEFIP", local: "Fiscalização/Obras", modelo: "SLM-4070", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEFIP", local: "Fiscalização/Obras", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEFIP", local: "Auditoria Tributária", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEFIP", local: "Auditoria Tributária", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEFIP", local: "Auditoria Tributária", modelo: "SLM-4070 USB", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEFIP", local: "Auditoria Tributária", modelo: "HP ML-2165 USB", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SEFIP", local: "Contabilidade", modelo: "Brother DCP-5652DN", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEFIP", local: "Contabilidade", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEINFRA", local: "SEINFRA/DEMUTRAN", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEINFRA", local: "SEINFRA/DEMUTRAN", modelo: "HP 1102W", tipo: "Laser PB", toner: "HP 85A" },
  { secretaria: "SEINFRA", local: "SEINFRA/DEMUTRAN", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEINFRA", local: "SEINFRA/DEMUTRAN", modelo: "Plotter SC-T3170", tipo: "Plotter", toner: "Kit Plotter T3170" },
  { secretaria: "SEMEJUL", local: "Esporte", modelo: "M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SEMEJUL", local: "Esporte", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEJUL", local: "Esporte", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEJUL", local: "Esporte", modelo: "Ricoh M320", tipo: "Laser PB", toner: "Ricoh SP3710X" },
  { secretaria: "SEMEJUL", local: "Esporte", modelo: "Epson L110", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEJUL", local: "Ginásio de Esportes", modelo: "Epson L110", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEJUL", local: "Ginásio de Esportes", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEGOV", local: "Gabinete", modelo: "Brother 6912DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEGOV", local: "Jurídico/Controle Interno/Dívida Ativa", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEGOV", local: "Jurídico/Controle Interno/Dívida Ativa", modelo: "HP 1212", tipo: "Laser PB", toner: "HP 85A" },
  { secretaria: "SEGOV", local: "Jurídico/Controle Interno/Dívida Ativa", modelo: "SCX-5835 USB", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEGOV", local: "Junta Militar", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SEGOV", local: "Ouvidoria", modelo: "SLM-4070", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEGOV", local: "PROCON", modelo: "HP M277", tipo: "Laser Colorido", toner: "Samsung D208L" },
  { secretaria: "SEGOV", local: "PROCON", modelo: "SLM-4070", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "Brother 5652DN", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "HP M102W", tipo: "Laser PB", toner: "HP 17A" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "HP P1005", tipo: "Laser PB", toner: "HP CB435" },
  { secretaria: "SMS", local: "CEM - Recepção", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Coord. Enfermagem", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Ultrassom", modelo: "Pantum P2500W", tipo: "Laser PB", toner: "Pantum PB211EV" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Sala de Gesso", modelo: "HP 1102", tipo: "Laser PB", toner: "HP 85A" },
  { secretaria: "SMS", local: "CEM - Raio X", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Recepção", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Coord. Enfermagem", modelo: "HP 2165", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "CEM - Ultrassom", modelo: "HP 452", tipo: "Laser Colorido", toner: "HP 58X" },
  { secretaria: "SMS", local: "ESF Flamboyant - Recepção", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "ESF Flamboyant - Dentista", modelo: "Samsung 1865", tipo: "Laser PB", toner: "Samsung D104S" },
  { secretaria: "SMS", local: "ESF Flamboyant - Farmácia", modelo: "HP 1606", tipo: "Laser PB", toner: "HP 78A" },
  { secretaria: "SMS", local: "ESF Flamboyant - Enfermagem", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "ESF Flamboyant - Consultório", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção", modelo: "Pantum P3305", tipo: "Laser PB", toner: "Pantum TL411X" },
  { secretaria: "SMS", local: "UBS Esplanada - Farmacêutica", modelo: "Brother 6700", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "UBS Esplanada - Gerência", modelo: "Brother 6700", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "UBS Esplanada - Consultório 01", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "UBS Esplanada - Consultório 02", modelo: "Samsung 2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "UBS Esplanada - Consultório 03", modelo: "Brother 6700", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "UBS Esplanada - Farmácia", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "UBS Esplanada - Enfermagem 01", modelo: "Brother 1222", tipo: "Laser PB", toner: "Brother TN116BR" },
  { secretaria: "SMS", local: "UBS Esplanada - Enfermagem 02", modelo: "Brother 6700", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "UBS Esplanada - Enfermagem 03", modelo: "Brother 1222", tipo: "Laser PB", toner: "Brother TN116BR" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção 02", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção 02", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção 02", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "ESF Central - Recepção", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "ESF Central - Pré-Consulta", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Central - Odontológico", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Central - Farmácia", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Central - Enfermagem 01", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Central - Enfermagem 02", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Central - Consultório 01", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Central - Consultório 02", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "CAPS - Recepção", modelo: "Brother 2540", tipo: "Laser PB", toner: "Brother TN2370" },
  { secretaria: "SMS", local: "CAPS - Consultório 01", modelo: "Samsung 2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "CAPS - Psicólogo", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "ESF Planalto - Recepção", modelo: "Samsung M2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Planalto - Fonoaudiologia", modelo: "Samsung M2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Planalto - Odontológico", modelo: "Samsung M2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Planalto - Consultório", modelo: "Pantum P2500", tipo: "Laser PB", toner: "Pantum PB211EV" },
  { secretaria: "SMS", local: "ESF Planalto - Enfermagem", modelo: "Brother 1222", tipo: "Laser PB", toner: "Brother TN116BR" },
  { secretaria: "SMS", local: "ESF Planalto - Farmácia", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Esperança - Vacina", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Esperança - Recepção", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Esperança - Enfermagem", modelo: "Epson 5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "ESF Esperança - Consultório 01", modelo: "Pantum P3305", tipo: "Laser PB", toner: "Pantum TL411X" },
  { secretaria: "SMS", local: "ESF Esperança - Consultório 02", modelo: "Pantum P2500", tipo: "Laser PB", toner: "Pantum PB211EV" },
  { secretaria: "SMS", local: "CAF - Alto Custo", modelo: "Brother L5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "CAF", modelo: "Brother 1602", tipo: "Laser PB", toner: "Brother TN1060" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Recepção", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Farmácia", modelo: "Brother L1222", tipo: "Laser PB", toner: "Brother TN116BR" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Preventivo", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "ESF Saúde Lar - ECG", modelo: "Brother L1222", tipo: "Laser PB", toner: "Brother TN116BR" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Consultório 01", modelo: "HP 428", tipo: "Laser PB", toner: "HP 85A" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Consultório 02", modelo: "Samsung 2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Sibipiruna - Recepção", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "ESF Sibipiruna - Enfermagem", modelo: "Epson 5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMS", local: "ESF Sibipiruna - Consultório 01", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Sibipiruna - Consultório 02", modelo: "Pantum P3305", tipo: "Laser PB", toner: "Pantum TL411X" },
  { secretaria: "SMS", local: "Prático/Transporte - Cartão SUS", modelo: "—", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SMS", local: "Prático/Transporte - Regulação", modelo: "—", tipo: "Laser Colorido", toner: "Brother TN3492" },
  { secretaria: "SMS", local: "Prático/Transporte - Coord. Transporte", modelo: "—", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SMS", local: "Prático/Transporte - Núcleo PME", modelo: "Brother 6912DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SMS", local: "Prático/Transporte - Recepção Transporte", modelo: "—", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Brother 6902W (parada)", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Biblioteca", modelo: "Brother 6912 USB", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "SESI", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "SESI", modelo: "Brother 2540", tipo: "Laser PB", toner: "Brother TN2370" },
  { secretaria: "SEMEC", local: "CEAMES - Sala 01", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "CEAMES - Núcleo", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEAMES - Direção", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEAMES - Direção", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Cozinha Piloto", modelo: "Brother 6912DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Cultura - Recepção", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Cultura - Adm", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "SEMEAR - Coord. Pedagógica", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "SEMEAR - Coord. Pedagógica", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "SEMEAR - Secretaria", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "SEMEAR - Secretaria", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "SEMEAR - Coord. Especial", modelo: "Epson L3210", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "SEMEAR - Direção", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "SEMEAR - Direção", modelo: "Epson L3210", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Rurais - Secretaria", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Rurais - Direção", modelo: "Brother 6902DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Rurais - Direção", modelo: "Epson L396", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Escola Pedra Branca", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Escola Pedra Branca", modelo: "Epson L380", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Escola Pedra Branca", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Escola Ribeirão", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Escola Ribeirão", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Escola Aroeira", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Escola Aroeira", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Secretaria", modelo: "Brother 6912", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Secretaria", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Secretaria", modelo: "HP 1132", tipo: "Laser PB", toner: "HP 85A" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Direção", modelo: "DCP 2540W", tipo: "Laser PB", toner: "Brother TN2370" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Direção", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. EJA", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. EJA", modelo: "Epson L380", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. Técnica", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 6-9", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 6-9", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 6-9", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 6-9", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 1-2", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 1-2", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 3-4", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 3-4", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Recepção", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Epson L396", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Direção", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Direção", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Busca Ativa", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Busca Ativa", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Ed. Especial", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Secretaria", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Secretaria", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Sala 02", modelo: "Epson L6490", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Sala 03", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Coordenação", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 01", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 01", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 02", modelo: "Brother 6912", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 02", modelo: "Brother L2540", tipo: "Laser PB", toner: "Brother TN2370" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 02", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 03", modelo: "Samsung 6555", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 04", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 05", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Banda", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Érica Schwetter", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Érica Schwetter", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Érica Schwetter", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Álide Belotti", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Álide Belotti", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "CEI Álide Belotti", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Nice Archila - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Nice Archila - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Nice Archila - Secretaria", modelo: "Epson L210", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Nice Archila - Direção", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Sibipiruna - Sala 01", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Sibipiruna - Sala 01", modelo: "Epson L210", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Sibipiruna - Sala 02", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Transporte Escolar", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Transporte Escolar", modelo: "Brother L6912", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SMAS", local: "Assist. Social - Recepção", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Progride", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Coord. Mulher", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Estágio", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Criança Feliz", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Habitação", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Cad. Habitacional", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "Assist. Social - Coord. Social", modelo: "Epson L396", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Gestão Trabalho", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Sec. Gabinete", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Gestão Compras", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "Assist. Social - Conselhos Ext.", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMAS", local: "Assist. Social - Conselhos Ext.", modelo: "Epson L3290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Samsung 4833", tipo: "Laser PB", toner: "Samsung D205L" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "Casa Abrigo", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Casa Abrigo", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Casa Abrigo", modelo: "Epson L3110", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Conviver", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Conviver", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 01", modelo: "Epson 5190", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 02", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 03", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 03", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 04", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "Conselho Tutelar", modelo: "Samsung 5835", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SMAS", local: "Conselho Tutelar", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SESOP", local: "Pátio de Obras - COP", modelo: "Brother L6912", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SESOP", local: "Pátio de Obras - GFCC", modelo: "Samsung 5835", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SESOP", local: "Pátio de Obras - Oficina", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SEDEMA", local: "CANIL", modelo: "Lexmark MX421", tipo: "Laser PB", toner: "Lexmark 56F0Z00" },
  { secretaria: "SEDEMA", local: "CTR", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEDEMA", local: "AGIPEQ/SEDEMA", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEDEMA", local: "SEDEMA", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEDEMA", local: "SEDEMA", modelo: "Epson L695", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
];

export function statusImpressora(imp: Impressora): "verde" | "amarelo" | "vermelho" {
  const q = estoqueAtual[imp.toner] ?? 0;
  if (q === 0) return "vermelho";
  if (q <= 2) return "amarelo";
  return "verde";
}
