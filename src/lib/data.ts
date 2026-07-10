// resumo e alertasCriticos são DERIVADOS de `estoque[]` / `impressoras[]`
// (declarados mais abaixo). Usamos Proxy com getters para adiar o cálculo
// até o primeiro uso — assim as declarações posteriores já existem.

type Resumo = {
  impressoras: number;
  estoqueUnidades: number;
  valorEstoque: number;
  itensCriticos: number;
  estoqueBaixo: number;
};

export const resumo: Resumo = new Proxy({} as Resumo, {
  get(_t, prop: keyof Resumo) {
    switch (prop) {
      case "impressoras":
        return impressoras.length;
      case "estoqueUnidades":
        return estoque.reduce((s, e) => s + e.quantidade, 0);
      case "valorEstoque":
        return estoque.reduce((s, e) => s + e.quantidade * e.valorUnit, 0);
      case "itensCriticos":
        return estoque.filter((e) => e.quantidade === 0).length;
      case "estoqueBaixo":
        return estoque.filter((e) => e.quantidade > 0 && e.quantidade <= 2).length;
    }
  },
}) as Resumo;

type AlertaCritico = {
  secretaria: string;
  local: string;
  suprimento: string;
  situacao: "Sem estoque" | "Crítico";
  dias: number;
};

export const alertasCriticos: AlertaCritico[] = new Proxy([] as AlertaCritico[], {
  get(_t, prop) {
    const isToner = (e: (typeof estoque)[number]) =>
      e.categoria === "Toners e Cartuchos";
    const zerados = estoque
      .filter((e) => isToner(e) && e.quantidade === 0)
      .map<AlertaCritico>((e) => ({
        secretaria: e.secretaria,
        local: e.local,
        suprimento: e.suprimento,
        situacao: "Sem estoque",
        dias: 0,
      }));
    const criticos = estoque
      .filter((e) => isToner(e) && e.quantidade > 0 && e.quantidade <= 2)
      .sort((a, b) => a.quantidade - b.quantidade)
      .slice(0, 12)
      .map<AlertaCritico>((e) => ({
        secretaria: e.secretaria,
        local: e.local,
        suprimento: e.suprimento,
        situacao: "Crítico",
        dias: e.quantidade === 1 ? 3 : 7,
      }));
    const list = [...zerados, ...criticos];
    return Reflect.get(list, prop);
  },
}) as AlertaCritico[];

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

export interface ItemEstoque {
  id: number;
  codigo: string;
  suprimento: string;
  categoria: string;
  secretaria: string;
  local: string;
  quantidade: number;
  valorUnit: number;
  mapeado: boolean;
}

export const estoque: ItemEstoque[] = [
  {"id": 1, "codigo": "RED-0009", "suprimento": "ADAPTADOR USB WI-FI AC ACI1300", "categoria": "Redes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 5, "valorUnit": 55.0, "mapeado": true},
  {"id": 2, "codigo": "RED-0004", "suprimento": "BANDEJA PARA RACK 19U GFORCE 19U", "categoria": "Redes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 69.9, "mapeado": true},
  {"id": 3, "codigo": "PER-0013", "suprimento": "BASE DE NOTEBOOK OBERON OR-9013", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 4, "valorUnit": 83.25, "mapeado": true},
  {"id": 4, "codigo": "PER-0006", "suprimento": "BASE DE NOTEBOOK MULTI", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 7, "valorUnit": 82.37, "mapeado": false},
  {"id": 5, "codigo": "PER-0019", "suprimento": "BASE PARA NOTEBOOK MULTI/MULTILASER AC166", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 5, "valorUnit": 82.37, "mapeado": true},
  {"id": 6, "codigo": "CAB-0008", "suprimento": "CABO DE IMPRESSORA CBL", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 6.5, "mapeado": false},
  {"id": 7, "codigo": "CAB-0009", "suprimento": "CABO DE IMPRESSORA", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 0.0, "mapeado": false},
  {"id": 8, "codigo": "CAB-0011", "suprimento": "CABO DE REDE GTS NETWORK", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 40.0, "mapeado": false},
  {"id": 9, "codigo": "CAB-0010", "suprimento": "CABO HDMI GRASEP H5100", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 60.0, "mapeado": true},
  {"id": 10, "codigo": "CAB-0006", "suprimento": "CABO HDMI GRASEP H5003", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 10, "valorUnit": 12.5, "mapeado": true},
  {"id": 11, "codigo": "CAB-0005", "suprimento": "CABO HDMI GRASEP H51000", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 12.5, "mapeado": true},
  {"id": 12, "codigo": "CAB-0001", "suprimento": "CABO HDMI LIFE", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 12.5, "mapeado": false},
  {"id": 13, "codigo": "CAB-0002", "suprimento": "CABO HDMI SUMAY SUMAY", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 12.5, "mapeado": false},
  {"id": 14, "codigo": "CAB-0004", "suprimento": "CABO VGA GLF GLF", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 15.0, "mapeado": false},
  {"id": 15, "codigo": "CAB-0007", "suprimento": "CABOS P2", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 13.4, "mapeado": false},
  {"id": 16, "codigo": "PER-0005", "suprimento": "CAIXAS DE SOM EXBOM EXBOM CS-32", "categoria": "Áudio e Vídeo", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 29.9, "mapeado": true},
  {"id": 17, "codigo": "PER-0009", "suprimento": "CAMERA LOGITECH' LOGITECH C270", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 172.75, "mapeado": true},
  {"id": 18, "codigo": "TON-0025", "suprimento": "CARTUCHO DE IMPRESSORA AMARELO HP · 410A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 395.44, "mapeado": true},
  {"id": 19, "codigo": "TON-0021", "suprimento": "CARTUCHO DE IMPRESSORA CIANO HP · 410A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 5, "valorUnit": 395.44, "mapeado": true},
  {"id": 20, "codigo": "TON-0023", "suprimento": "CARTUCHO DE IMPRESSORA MAGENTA HP · 410A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 395.44, "mapeado": true},
  {"id": 21, "codigo": "TON-0026", "suprimento": "CARTUCHO DE IMPRESSORA PRETA HP · 83A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 28, "valorUnit": 124.6, "mapeado": true},
  {"id": 22, "codigo": "TON-0022", "suprimento": "CARTUCHO DE IMPRESSORA PRETA HP · 17A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 4, "valorUnit": 174.93, "mapeado": true},
  {"id": 23, "codigo": "TON-0024", "suprimento": "CARTUCHO DE IMPRESSORA PRETA HP · 410A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 395.44, "mapeado": true},
  {"id": 24, "codigo": "ACS-0004", "suprimento": "CASE PARA SSD SAMSUNG NB2772", "categoria": "Acessórios", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 79.0, "mapeado": true},
  {"id": 25, "codigo": "FER-0004", "suprimento": "EXTENSÃO USITECH 6 PORTAS USITECH PLU6T", "categoria": "Ferramentas", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 69.96, "mapeado": true},
  {"id": 26, "codigo": "FER-0003", "suprimento": "FILTRO DE LINHA MEGATRON", "categoria": "Ferramentas", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 44.94, "mapeado": false},
  {"id": 27, "codigo": "FER-0002", "suprimento": "FILTRO DE LINHA COM DPS EMBRASTEC 916207", "categoria": "Ferramentas", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 5, "valorUnit": 69.83, "mapeado": true},
  {"id": 28, "codigo": "PER-0021", "suprimento": "FONE INTELBRAS INTELBRAS", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 176.0, "mapeado": false},
  {"id": 29, "codigo": "FER-0001", "suprimento": "GRAVADOR ELETRICO DREMEL 290-40", "categoria": "Ferramentas", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 186.0, "mapeado": true},
  {"id": 30, "codigo": "RED-0008", "suprimento": "GUIA PASSA CABO MOREIRA 9011 PRETO TEXTURIZADO", "categoria": "Redes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 0.0, "mapeado": true},
  {"id": 31, "codigo": "CAB-0003", "suprimento": "HDMI VINIK VINIK", "categoria": "Cabos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 20.0, "mapeado": false},
  {"id": 32, "codigo": "TON-0095", "suprimento": "KIT COMPLETO DE TINTA EPSON · 544", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 256.96, "mapeado": true},
  {"id": 33, "codigo": "TON-0097", "suprimento": "KIT CONPLETO DE TINTA EPSON · 644", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 215.0, "mapeado": true},
  {"id": 34, "codigo": "TON-0096", "suprimento": "KIT TINTA PRETA 2UNI EPSON · 644", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 116.0, "mapeado": true},
  {"id": 35, "codigo": "TON-0066", "suprimento": "LASER TONER PRO RESOLUTION · LACF413A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 8, "valorUnit": 59.46, "mapeado": true},
  {"id": 36, "codigo": "TON-0057", "suprimento": "LASER TONER EVOLUT · 258X", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 78.0, "mapeado": true},
  {"id": 37, "codigo": "TON-0065", "suprimento": "LASER TONER PRO RESOLUTION · LHCF412A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 8, "valorUnit": 59.49, "mapeado": true},
  {"id": 38, "codigo": "TON-0048", "suprimento": "LASER TONER EVOLUT · TN1060", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 18.9, "mapeado": true},
  {"id": 39, "codigo": "TON-0036", "suprimento": "LASER TONER SUPLI' · CE278/78A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 23.18, "mapeado": true},
  {"id": 40, "codigo": "TON-0034", "suprimento": "LASER TONER SUPLI' · CE285/85A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 15, "valorUnit": 53.7, "mapeado": true},
  {"id": 41, "codigo": "TON-0064", "suprimento": "LASER TONER PRO RESOLUTION · LHCF411A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 4, "valorUnit": 59.46, "mapeado": true},
  {"id": 42, "codigo": "CMP-0001", "suprimento": "MEMORIA RAM 4GB DDR3 BLUECASE", "categoria": "Componentes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 175.99, "mapeado": false},
  {"id": 43, "codigo": "PER-0002", "suprimento": "MONITOR ACER ACER X183H D", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 328.0, "mapeado": true},
  {"id": 44, "codigo": "PER-0003", "suprimento": "MONITOR LG LG 20EN33SSA", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 330.0, "mapeado": true},
  {"id": 45, "codigo": "PER-0030", "suprimento": "MOUSE MULTILASER MF100", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 8, "valorUnit": 45.0, "mapeado": true},
  {"id": 46, "codigo": "PER-0028", "suprimento": "MOUSE MULTILASER M0300", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 45.0, "mapeado": true},
  {"id": 47, "codigo": "PER-0027", "suprimento": "MOUSE MULTILASER", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 30.0, "mapeado": false},
  {"id": 48, "codigo": "PER-0026", "suprimento": "MOUSE KNUP", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 34.0, "mapeado": false},
  {"id": 49, "codigo": "PER-0025", "suprimento": "MOUSE VINIK", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 40.0, "mapeado": false},
  {"id": 50, "codigo": "PER-0020", "suprimento": "MOUSE MULTILASER", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 19.0, "mapeado": false},
  {"id": 51, "codigo": "PER-0008", "suprimento": "MOUSE USB BRAZIL PC BPC-M129", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 19.0, "mapeado": true},
  {"id": 52, "codigo": "PER-0018", "suprimento": "MOUSEPAD FORTREK FORTREK MPG102", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 22.0, "mapeado": true},
  {"id": 53, "codigo": "RED-0001", "suprimento": "NANOSTATION LOCO M5 UBIQUITI LOCO M5", "categoria": "Redes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 0, "valorUnit": 591.0, "mapeado": true},
  {"id": 54, "codigo": "TON-0072", "suprimento": "NOBREAK 1200VA TS SHARA · 4429", "categoria": "Pilhas e Baterias", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 715.0, "mapeado": true},
  {"id": 55, "codigo": "BAT-0001", "suprimento": "NOBREAK 1200VA CR ENERGIA SB 12 0", "categoria": "Pilhas e Baterias", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 436.0, "mapeado": true},
  {"id": 56, "codigo": "ACS-0003", "suprimento": "NOTEBOOK ACER ACER N17C4", "categoria": "Acessórios", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 900.0, "mapeado": true},
  {"id": 57, "codigo": "ACS-0001", "suprimento": "NOTEBOOK LG LG LGS43", "categoria": "Acessórios", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 700.0, "mapeado": true},
  {"id": 58, "codigo": "6", "suprimento": "PAINEL PATCH CAT Redes SECLAN", "categoria": "RED-0007", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 0, "valorUnit": 0.0, "mapeado": true},
  {"id": 59, "codigo": "RED-0005", "suprimento": "PAINEL PATCH CAT5E SOHO PLUS 24 PORTAS", "categoria": "Redes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 389.9, "mapeado": true},
  {"id": 60, "codigo": "RED-0006", "suprimento": "PANEL PATCH CAT.5E SOHO PLUS", "categoria": "Redes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 389.99, "mapeado": false},
  {"id": 61, "codigo": "CMP-0002", "suprimento": "SSD 240GB KINGDIAN 240GB", "categoria": "Componentes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 220.0, "mapeado": true},
  {"id": 62, "codigo": "CMP-0003", "suprimento": "SSD DE 240GB SMITOSP SSDA", "categoria": "Componentes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 300.0, "mapeado": true},
  {"id": 63, "codigo": "PER-0015", "suprimento": "SUPORTE ARTICULADO DE MESA PARA MONITOR ELG T80N", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 158.0, "mapeado": true},
  {"id": 64, "codigo": "PER-0016", "suprimento": "SUPORTE PARA NOTEBOOK TGWN84721", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 11, "valorUnit": 140.0, "mapeado": false},
  {"id": 65, "codigo": "RED-0003", "suprimento": "SWITCH TP-LINK TP-LINK TL-SG1024D", "categoria": "Redes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 456.0, "mapeado": true},
  {"id": 66, "codigo": "TON-0090", "suprimento": "TECLADO C3PLUS", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 60.0, "mapeado": false},
  {"id": 67, "codigo": "PER-0031", "suprimento": "TECLADO INTELBRAS", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 0.0, "mapeado": false},
  {"id": 68, "codigo": "PER-0017", "suprimento": "TECLADO C3PLUS KB-11V2", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 43.0, "mapeado": true},
  {"id": 69, "codigo": "PER-0023", "suprimento": "TECLADO GENIUS KB-06XE", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 0, "valorUnit": 64.9, "mapeado": true},
  {"id": 70, "codigo": "PER-0024", "suprimento": "TECLADO LOGITECH MK270", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 149.99, "mapeado": true},
  {"id": 71, "codigo": "TON-0089", "suprimento": "TECLADO MOVITEC", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 80.0, "mapeado": false},
  {"id": 72, "codigo": "PER-0011", "suprimento": "TECLADO MBTECH MB54264", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 84.0, "mapeado": true},
  {"id": 73, "codigo": "TON-0091", "suprimento": "TECLADO MEGAWARE · MK1882", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 60.0, "mapeado": true},
  {"id": 74, "codigo": "PER-0012", "suprimento": "TECLADO VINIK", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 47.9, "mapeado": false},
  {"id": 75, "codigo": "PER-0007", "suprimento": "TECLADO MULTI MULTI TF150", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 74.0, "mapeado": true},
  {"id": 76, "codigo": "PER-0004", "suprimento": "TECLADO MULTILASER MULTILASER", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 31.0, "mapeado": false},
  {"id": 77, "codigo": "AVD-0002", "suprimento": "TELEFONE INTELBRAS TS40 D", "categoria": "Áudio e Vídeo", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 40.0, "mapeado": true},
  {"id": 78, "codigo": "AVD-0001", "suprimento": "TELEFONE INTELBRAS INTALBRAS TIP 120I", "categoria": "Áudio e Vídeo", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 226.0, "mapeado": true},
  {"id": 79, "codigo": "GEN-0001", "suprimento": "TESTE TESTE TESTE", "categoria": "Outros", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 0, "valorUnit": 0.0, "mapeado": true},
  {"id": 80, "codigo": "TON-0099", "suprimento": "TINTA A AMARELA EPSON · 664", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 4, "valorUnit": 65.0, "mapeado": true},
  {"id": 81, "codigo": "TON-0098", "suprimento": "TINTA AZUL EPSON · 664", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 60.0, "mapeado": true},
  {"id": 82, "codigo": "TON-0100", "suprimento": "TINTA MAGENTA EPSON · 664", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 10, "valorUnit": 80.0, "mapeado": true},
  {"id": 83, "codigo": "TON-0101", "suprimento": "TINTA PRETA EPSON · 664", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 30, "valorUnit": 75.0, "mapeado": true},
  {"id": 84, "codigo": "TON-0094", "suprimento": "TINTA PRETA EPSON · 544", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 10, "valorUnit": 65.0, "mapeado": true},
  {"id": 85, "codigo": "TON-0105", "suprimento": "TONER UNISON · 56F0Z00", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 450.0, "mapeado": true},
  {"id": 86, "codigo": "TON-0088", "suprimento": "TONER PQTC · 205E", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 115.0, "mapeado": true},
  {"id": 87, "codigo": "TON-0093", "suprimento": "TONER PREMIUM · 201", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 60.0, "mapeado": true},
  {"id": 88, "codigo": "TON-0078", "suprimento": "TONER LEXMARK · 50FBX0E", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 0, "valorUnit": 468.71, "mapeado": true},
  {"id": 89, "codigo": "TON-0077", "suprimento": "TONER PREMIUM · D104", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 46.45, "mapeado": true},
  {"id": 90, "codigo": "TON-0103", "suprimento": "TONER MTSI · 60FBH00", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 280.0, "mapeado": true},
  {"id": 91, "codigo": "TON-0106", "suprimento": "TONER MONOCRON · 3442", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 160.0, "mapeado": true},
  {"id": 92, "codigo": "TON-0087", "suprimento": "TONER PREMIUM · 208L", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 84.72, "mapeado": true},
  {"id": 93, "codigo": "TON-0076", "suprimento": "TONER 2340/2370", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 43.53, "mapeado": false},
  {"id": 94, "codigo": "TON-0084", "suprimento": "TONER 880/890", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 0, "valorUnit": 55.39, "mapeado": false},
  {"id": 95, "codigo": "TON-0104", "suprimento": "TONER PREMIUM · 3472", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 144.0, "mapeado": true},
  {"id": 96, "codigo": "PER-0029", "suprimento": "TONER M375", "categoria": "Periféricos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 37.0, "mapeado": false},
  {"id": 97, "codigo": "TON-0102", "suprimento": "TONER SUPLI · 3472", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 40.0, "mapeado": true},
  {"id": 98, "codigo": "TON-0083", "suprimento": "TONER 101S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 49.78, "mapeado": false},
  {"id": 99, "codigo": "TON-0086", "suprimento": "TONER SUPLI · 208L", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 84.72, "mapeado": true},
  {"id": 100, "codigo": "TON-0092", "suprimento": "TONER PQTC · 101S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 160.0, "mapeado": true},
  {"id": 101, "codigo": "TON-0069", "suprimento": "TONER BROTHER BROTHER · 1060", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 136.15, "mapeado": true},
  {"id": 102, "codigo": "TON-0063", "suprimento": "TONER BROTHER BROTHER · TN2370", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 178.42, "mapeado": true},
  {"id": 103, "codigo": "TON-0107", "suprimento": "TONER BROTHER BROTHER · TN3662XLS", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 8, "valorUnit": 450.0, "mapeado": true},
  {"id": 104, "codigo": "TON-0070", "suprimento": "TONER BROTHER BROTHER · 2340S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 339.0, "mapeado": true},
  {"id": 105, "codigo": "TON-0071", "suprimento": "TONER BROTHER BROTHER · 3492S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 417.99, "mapeado": true},
  {"id": 106, "codigo": "TON-0073", "suprimento": "TONER BROTHER BROTHER · 3472S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 497.0, "mapeado": true},
  {"id": 107, "codigo": "TON-0108", "suprimento": "TONER BROTHER CAIXA COM 3 UNI BROTHER · TN3662XLS", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 1100.0, "mapeado": true},
  {"id": 108, "codigo": "TON-0032", "suprimento": "TONER BYQUALY BYQUALY · TN750", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 59.0, "mapeado": true},
  {"id": 109, "codigo": "TON-0031", "suprimento": "TONER BYQUALY BYQUALY · TN780", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 5, "valorUnit": 71.15, "mapeado": true},
  {"id": 110, "codigo": "TON-0012", "suprimento": "TONER BYQUALY BYQUALY · BQ-DR 2340", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 34.62, "mapeado": true},
  {"id": 111, "codigo": "TON-0040", "suprimento": "TONER BYQUALY BYQUALY · D101S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 4, "valorUnit": 69.9, "mapeado": true},
  {"id": 112, "codigo": "TON-0049", "suprimento": "TONER CHINAMATE CHINAMATE · CB435/436/285A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 37.13, "mapeado": true},
  {"id": 113, "codigo": "TON-0043", "suprimento": "TONER CHINAMATE CHINAMATE · D101S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 45.9, "mapeado": true},
  {"id": 114, "codigo": "TON-0041", "suprimento": "TONER CHINAMATE CHINAMATE · 285A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 38.0, "mapeado": true},
  {"id": 115, "codigo": "TON-0054", "suprimento": "TONER EVOLUT EVOLUT · 283A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 30.92, "mapeado": true},
  {"id": 116, "codigo": "TON-0051", "suprimento": "TONER GOLD COLLECTION GOLD COLLECTION · CF217A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 32.0, "mapeado": true},
  {"id": 117, "codigo": "TON-0046", "suprimento": "TONER GOLD COLLECTION GOLD COLLECTION · CE278A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 36.86, "mapeado": true},
  {"id": 118, "codigo": "TON-0008", "suprimento": "TONER GOLD COLLECTION GOLD COLLECTION · 208L", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 30, "valorUnit": 84.72, "mapeado": true},
  {"id": 119, "codigo": "TON-0013", "suprimento": "TONER GOLD COLLECTION GOLD COLLECTION · B-DR630", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 49.34, "mapeado": true},
  {"id": 120, "codigo": "TON-0006", "suprimento": "TONER GOLD COLLECTION GOLD COLLECTION · SP3710X", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 80.01, "mapeado": true},
  {"id": 121, "codigo": "TON-0047", "suprimento": "TONER GOLD COLLECTION GOLD COLLECTION · TN1000/1050/1060/1070/1075", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 28.0, "mapeado": true},
  {"id": 122, "codigo": "TON-0062", "suprimento": "TONER HP HP · 258XC", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 7, "valorUnit": 289.9, "mapeado": true},
  {"id": 123, "codigo": "TON-0035", "suprimento": "TONER LASER SUPLI · CF283/83A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 32, "valorUnit": 33.9, "mapeado": true},
  {"id": 124, "codigo": "TON-0033", "suprimento": "TONER LASER SUPLI · D104S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 16, "valorUnit": 42.2, "mapeado": true},
  {"id": 125, "codigo": "TON-0030", "suprimento": "TONER LAZER EVOLUT · D104", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 40.0, "mapeado": true},
  {"id": 126, "codigo": "TON-0015", "suprimento": "TONER LAZER CHINAMATE CHINAMATE · DR880/890", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 106.6, "mapeado": true},
  {"id": 127, "codigo": "TON-0016", "suprimento": "TONER LAZER CHINAMATE CHINAMATE", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 59.99, "mapeado": false},
  {"id": 128, "codigo": "TON-0020", "suprimento": "TONER LEXMARK LEXMARK · 56F0Z00", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 616.8, "mapeado": true},
  {"id": 129, "codigo": "TON-0005", "suprimento": "TONER MONOCRON MONOCRON · 203U", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 0, "valorUnit": 286.7, "mapeado": true},
  {"id": 130, "codigo": "TON-0067", "suprimento": "TONER MTSI MTSI · TN3492", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 76.95, "mapeado": true},
  {"id": 131, "codigo": "TON-0042", "suprimento": "TONER MTSI MTSI · 101S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 53.55, "mapeado": true},
  {"id": 132, "codigo": "TON-0061", "suprimento": "TONER PANTUM PLANTUM · 411X", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 5, "valorUnit": 264.0, "mapeado": true},
  {"id": 133, "codigo": "TON-0060", "suprimento": "TONER PANTUM PLANTUM · 425U", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 267.84, "mapeado": true},
  {"id": 134, "codigo": "TON-0079", "suprimento": "TONER PQTC PQTC · 2612A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 256.0, "mapeado": true},
  {"id": 135, "codigo": "TON-0055", "suprimento": "TONER PQTC PQTC · 1660/1665", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 47.44, "mapeado": true},
  {"id": 136, "codigo": "TON-0002", "suprimento": "TONER PQTC PQTC · D203L", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 4, "valorUnit": 80.9, "mapeado": true},
  {"id": 137, "codigo": "TON-0045", "suprimento": "TONER PQTC PQTC · CB-435/436/285/278A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 22, "valorUnit": 73.4, "mapeado": true},
  {"id": 138, "codigo": "TON-0010", "suprimento": "TONER PQTC PQTC · TN2340", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 8, "valorUnit": 323.3, "mapeado": true},
  {"id": 139, "codigo": "TON-0001", "suprimento": "TONER PQTC PQTC · D201", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 103.0, "mapeado": true},
  {"id": 140, "codigo": "TON-0050", "suprimento": "TONER PREMIUM PREMIUM · SCX5635", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 10, "valorUnit": 223.3, "mapeado": true},
  {"id": 141, "codigo": "TON-0081", "suprimento": "TONER PREMIUM PREMIUM · TN1000", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 51.47, "mapeado": true},
  {"id": 142, "codigo": "TON-0044", "suprimento": "TONER PREMIUM PREMIUM · CE278A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 3, "valorUnit": 40.0, "mapeado": true},
  {"id": 143, "codigo": "TON-0056", "suprimento": "TONER PREMIUM PREMIUM · 1660/1665", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 60.0, "mapeado": true},
  {"id": 144, "codigo": "TON-0003", "suprimento": "TONER PREMIUM CARTRIDGE · D203L", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 108.3, "mapeado": true},
  {"id": 145, "codigo": "TON-0014", "suprimento": "TONER PREMIUM PREMIUM · DR2340", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 7, "valorUnit": 123.4, "mapeado": true},
  {"id": 146, "codigo": "TON-0004", "suprimento": "TONER PREMIUM CARTRIDGE · SP3710", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 56.0, "mapeado": true},
  {"id": 147, "codigo": "TON-0052", "suprimento": "TONER PREMIUM PREMIUM · SCX4600", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 66.0, "mapeado": true},
  {"id": 148, "codigo": "TON-0085", "suprimento": "TONER PREMIUM PREMIUM · D111", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 53.0, "mapeado": true},
  {"id": 149, "codigo": "TON-0028", "suprimento": "TONER SAMSUNG SAMSUNG · 101S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 10, "valorUnit": 106.0, "mapeado": true},
  {"id": 150, "codigo": "TON-0059", "suprimento": "TONER SAMSUNG SAMSUNG · 105", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 7, "valorUnit": 51.56, "mapeado": true},
  {"id": 151, "codigo": "TON-0027", "suprimento": "TONER SAMSUNG SAMSUNG · 104S", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 9, "valorUnit": 136.66, "mapeado": true},
  {"id": 152, "codigo": "TON-0068", "suprimento": "TONER SUPLI SUPLI · TN660/2340/2370", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 5, "valorUnit": 291.0, "mapeado": true},
  {"id": 153, "codigo": "TON-0038", "suprimento": "TONER WP WP · SCX4600", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 66.66, "mapeado": true},
  {"id": 154, "codigo": "TON-0039", "suprimento": "TONER WP WP · TN1035/1000/1060", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 2, "valorUnit": 330.0, "mapeado": true},
  {"id": 155, "codigo": "TON-0009", "suprimento": "TONER WP WP · CF258A", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 6, "valorUnit": 383.33, "mapeado": true},
  {"id": 156, "codigo": "TON-0075", "suprimento": "UNIDADE DE IMAGEM LEXMARK · 50F0Z00", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 403.9, "mapeado": true},
  {"id": 157, "codigo": "TON-0074", "suprimento": "UNIDADE DE IMAGEM BROTHER · 3440", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 12, "valorUnit": 192.0, "mapeado": true},
  {"id": 158, "codigo": "TON-0029", "suprimento": "UNIDADE DE IMAGEM PREMIUM PREMIUM · DR2340", "categoria": "Toners e Cartuchos", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 8, "valorUnit": 452.0, "mapeado": true},
  {"id": 159, "codigo": "RED-0002", "suprimento": "UNIFI UBIQUITI UBIQUITI UAP-AC-PRO", "categoria": "Redes", "secretaria": "DTI", "local": "Sala da DTI", "quantidade": 1, "valorUnit": 966.66, "mapeado": true}
];

export const estoqueResumo = {
  total: estoque.length,
  mapeados: estoque.filter((e) => e.mapeado).length,
  naoMapeados: estoque.filter((e) => !e.mapeado).length,
  unidades: estoque.reduce((s, e) => s + e.quantidade, 0),
  valorTotal: estoque.reduce((s, e) => s + e.quantidade * e.valorUnit, 0),
};

// ===== Parque de Impressoras =====
// estoqueAtual é DERIVADO do estoque real — cada chave de toner soma as
// quantidades das linhas de `estoque[]` cujo suprimento casa com um dos
// aliases abaixo. Não editar manualmente: para alterar o saldo, edite o item
// correspondente em `estoque[]`.
const TONER_ALIASES: Record<string, string[]> = {
  "Epson T544 Preto": ["EPSON 544"],
  "Epson T664 Preto": ["EPSON 664", "EPSON 644"],
  "Brother TN1060": ["BROTHER 1060", "TN1060"],
  "Brother TN2370": ["TN2370", "2340/2370", "BROTHER 2340"],
  "Brother TN3472": ["BROTHER 3472", "TN750", "TN780"],
  "Brother TN3492": ["BROTHER 3492", "TN3662", "3492"],
  "HP CB435A": ["CB435", "CB436", "285A"],
  "HP 17A": ["HP 17A", "CF217"],
  "HP 78A": ["78A", "CE278"],
  "HP 83A": ["HP 83A", "CF283"],
  "HP 85A": ["85A", "CE285"],
  "HP 258X": ["258X", "CF258"],
  "HP 410A Preto": ["PRETA HP 410A", "PRETO HP 410A", "410A PRETO"],
  "Samsung D101": ["D101"],
  "Samsung D104S": ["D104"],
  "Samsung D111L": ["D111"],
  "Samsung D203U": ["D203"],
  "Samsung D208L": ["D208", "208L"],
  "Samsung D201L": ["D201"],
  "Samsung D205L": ["D205", "205E"],
  "Pantum PB211EV": ["PB211", "PA210"],
  "Pantum TL411X": ["TL411", "TL-411", "411X"],
  // Toner genuíno da família Lexmark MX421/MX521/MX622 (56F1000 rendimento
  // padrão, 56F1H00 alta capacidade ~15k pág., 56F1X00 extra alta ~20k pág.).
  "Lexmark 56F1H00": ["56F1000", "56F1H00", "56F1X00"],
  // ATENÇÃO: "56F0Z00" NÃO é toner — é a Unidade de Imagem (cilindro/fotocondutor)
  // da linha Lexmark MX, com troca bem mais rara (~60.000 páginas). Mantido aqui
  // apenas para não deixar o item do estoque órfão do mapeamento.
  "Lexmark 56F0Z00 (Unidade de Imagem)": ["56F0Z"],
  "Ricoh SP3710X": ["SP3710", "RICOH"],
  "Kit Plotter T3170": ["T3170", "PLOTTER"],
};

const norm = (s: string) =>
  s.toUpperCase().replace(/·/g, " ").replace(/\s+/g, " ").trim();

export const estoqueAtual: Record<string, number> = Object.fromEntries(
  Object.entries(TONER_ALIASES).map(([key, aliases]) => [
    key,
    estoque
      .filter((e) => aliases.some((a) => norm(e.suprimento).includes(norm(a))))
      .reduce((sum, e) => sum + e.quantidade, 0),
  ])
);


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
  { secretaria: "SAD", local: "Licitação", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SAD", local: "Almoxarifado Externo", modelo: "Brother 6912DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEFIP", local: "Finanças/CAC", modelo: "MX-410", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEFIP", local: "Finanças/CAC", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEFIP", local: "Finanças/CAC", modelo: "DCP-5652DN", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEFIP", local: "Finanças/SAREN", modelo: "SCX-5835", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEFIP", local: "Fiscalização/Obras", modelo: "SLM-4070", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEFIP", local: "Fiscalização/Obras", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEFIP", local: "Auditoria Tributária", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEFIP", local: "Auditoria Tributária", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEFIP", local: "Auditoria Tributária", modelo: "SLM-4070 USB", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEFIP", local: "Auditoria Tributária", modelo: "Samsung ML-2165 USB", tipo: "Laser PB", toner: "Samsung D101" },
  { secretaria: "SEFIP", local: "Contabilidade", modelo: "Brother DCP-5652DN", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEFIP", local: "Contabilidade", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEINFRA", local: "SEINFRA/DEMUTRAN", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEINFRA", local: "SEINFRA/DEMUTRAN", modelo: "HP 1102W", tipo: "Laser PB", toner: "HP 17A" },
  { secretaria: "SEINFRA", local: "SEINFRA/DEMUTRAN", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEINFRA", local: "SEINFRA/DEMUTRAN", modelo: "Plotter SC-T3170", tipo: "Plotter", toner: "Kit Plotter T3170" },
  { secretaria: "SEMEJUL", local: "Esporte", modelo: "M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SEMEJUL", local: "Esporte", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
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
  { secretaria: "SEGOV", local: "PROCON", modelo: "HP M277", tipo: "Laser Colorido", toner: "HP 410A Preto" },
  { secretaria: "SEGOV", local: "PROCON", modelo: "SLM-4070", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "Brother 5652DN", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "HP M102W", tipo: "Laser PB", toner: "HP 17A" },
  { secretaria: "SMS", local: "Paço Municipal/SMS", modelo: "HP P1005", tipo: "Laser PB", toner: "HP CB435A" },
  { secretaria: "SMS", local: "CEM - Recepção", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Coord. Enfermagem", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Ultrassom", modelo: "Pantum P2500W", tipo: "Laser PB", toner: "Pantum PB211EV" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Consultórios (x7)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Sala de Gesso", modelo: "HP 1102", tipo: "Laser PB", toner: "HP 17A" },
  { secretaria: "SMS", local: "CEM - Raio X", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Recepção", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Coord. Enfermagem", modelo: "HP 2165", tipo: "Laser PB", toner: "Samsung D101" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Saúde Mulher Consultórios (x5)", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "CEM - Ultrassom", modelo: "HP 452", tipo: "Laser Colorido", toner: "HP 410A Preto" },
  { secretaria: "SMS", local: "ESF Flamboyant - Recepção", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "ESF Flamboyant - Dentista", modelo: "Samsung 1865", tipo: "Laser PB", toner: "Samsung D104S" },
  { secretaria: "SMS", local: "ESF Flamboyant - Farmácia", modelo: "HP 1606", tipo: "Laser PB", toner: "HP 78A" },
  { secretaria: "SMS", local: "ESF Flamboyant - Enfermagem", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "ESF Flamboyant - Consultório", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção", modelo: "Pantum P3305", tipo: "Laser PB", toner: "Pantum TL411X" },
  { secretaria: "SMS", local: "UBS Esplanada - Farmacêutica", modelo: "Brother 6700", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "UBS Esplanada - Gerência", modelo: "Brother 6700", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "UBS Esplanada - Consultório 01", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "UBS Esplanada - Consultório 02", modelo: "Samsung 2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "UBS Esplanada - Consultório 03", modelo: "Brother 6700", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "UBS Esplanada - Farmácia", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "UBS Esplanada - Enfermagem 01", modelo: "Brother 1222", tipo: "Laser PB", toner: "Brother TN1060" },
  { secretaria: "SMS", local: "UBS Esplanada - Enfermagem 02", modelo: "Brother 6700", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "UBS Esplanada - Enfermagem 03", modelo: "Brother 1222", tipo: "Laser PB", toner: "Brother TN1060" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção 02", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção 02", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SMS", local: "UBS Esplanada - Recepção 02", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "ESF Central - Recepção", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "ESF Central - Pré-Consulta", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D101" },
  { secretaria: "SMS", local: "ESF Central - Odontológico", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D101" },
  { secretaria: "SMS", local: "ESF Central - Farmácia", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D101" },
  { secretaria: "SMS", local: "ESF Central - Enfermagem 01", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Central - Enfermagem 02", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Central - Consultório 01", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D101" },
  { secretaria: "SMS", local: "ESF Central - Consultório 02", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D101" },
  { secretaria: "SMS", local: "CAPS - Recepção", modelo: "Brother 2540", tipo: "Laser PB", toner: "Brother TN2370" },
  { secretaria: "SMS", local: "CAPS - Consultório 01", modelo: "Samsung 2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "CAPS - Psicólogo", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "ESF Planalto - Recepção", modelo: "Samsung M2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Planalto - Fonoaudiologia", modelo: "Samsung M2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Planalto - Odontológico", modelo: "Samsung M2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Planalto - Consultório", modelo: "Pantum P2500", tipo: "Laser PB", toner: "Pantum PB211EV" },
  { secretaria: "SMS", local: "ESF Planalto - Enfermagem", modelo: "Brother 1222", tipo: "Laser PB", toner: "Brother TN1060" },
  { secretaria: "SMS", local: "ESF Planalto - Farmácia", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Esperança - Vacina", modelo: "Samsung 2165", tipo: "Laser PB", toner: "Samsung D101" },
  { secretaria: "SMS", local: "ESF Esperança - Recepção", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Esperança - Enfermagem", modelo: "Epson 5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "ESF Esperança - Consultório 01", modelo: "Pantum P3305", tipo: "Laser PB", toner: "Pantum TL411X" },
  { secretaria: "SMS", local: "ESF Esperança - Consultório 02", modelo: "Pantum P2500", tipo: "Laser PB", toner: "Pantum PB211EV" },
  { secretaria: "SMS", local: "CAF - Alto Custo", modelo: "Brother L5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "CAF", modelo: "Brother 1602", tipo: "Laser PB", toner: "Brother TN1060" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Recepção", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Farmácia", modelo: "Brother L1222", tipo: "Laser PB", toner: "Brother TN1060" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Preventivo", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "ESF Saúde Lar - ECG", modelo: "Brother L1222", tipo: "Laser PB", toner: "Brother TN1060" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Consultório 01", modelo: "HP 428", tipo: "Laser PB", toner: "HP 258X" },
  { secretaria: "SMS", local: "ESF Saúde Lar - Consultório 02", modelo: "Samsung 2020", tipo: "Laser PB", toner: "Samsung D111L" },
  { secretaria: "SMS", local: "ESF Sibipiruna - Recepção", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMS", local: "ESF Sibipiruna - Enfermagem", modelo: "Epson 5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMS", local: "ESF Sibipiruna - Consultório 01", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMS", local: "ESF Sibipiruna - Consultório 02", modelo: "Pantum P3305", tipo: "Laser PB", toner: "Pantum TL411X" },
  { secretaria: "SMS", local: "Prático/Transporte - Cartão SUS", modelo: "—", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SMS", local: "Prático/Transporte - Regulação", modelo: "—", tipo: "Laser Colorido", toner: "Brother TN3492" },
  { secretaria: "SMS", local: "Prático/Transporte - Coord. Transporte", modelo: "—", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SMS", local: "Prático/Transporte - Núcleo PME", modelo: "Brother 6912DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SMS", local: "Prático/Transporte - Recepção Transporte", modelo: "—", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Secretaria de Educação", modelo: "Brother 6902W (parada)", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Biblioteca", modelo: "Brother 6912 USB", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "SESI", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "SESI", modelo: "Brother 2540", tipo: "Laser PB", toner: "Brother TN2370" },
  { secretaria: "SEMEC", local: "CEAMES - Sala 01", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "CEAMES - Núcleo", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEAMES - Direção", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEAMES - Direção", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Cozinha Piloto", modelo: "Brother 6912DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Cultura - Recepção", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Cultura - Adm", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "SEMEAR - Coord. Pedagógica", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "SEMEAR - Coord. Pedagógica", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "SEMEAR - Secretaria", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "SEMEAR - Secretaria", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "SEMEAR - Coord. Especial", modelo: "Epson L3210", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "SEMEAR - Direção", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "SEMEAR - Direção", modelo: "Epson L3210", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Rurais - Secretaria", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Rurais - Direção", modelo: "Brother 6902DW", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Rurais - Direção", modelo: "Epson L396", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Escola Pedra Branca", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Escola Pedra Branca", modelo: "Epson L380", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Escola Pedra Branca", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Escola Ribeirão", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Escola Ribeirão", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Escola Aroeira", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Escola Aroeira", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Secretaria", modelo: "Brother 6912", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Secretaria", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Secretaria", modelo: "HP 1132", tipo: "Laser PB", toner: "HP 85A" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Direção", modelo: "DCP 2540W", tipo: "Laser PB", toner: "Brother TN2370" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Direção", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. EJA", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. EJA", modelo: "Epson L380", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. Técnica", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 6-9", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 6-9", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 6-9", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 6-9", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 1-2", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 1-2", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 3-4", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Cecília Meireles - Coord. 3-4", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Recepção", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Epson L396", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Coordenação", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Direção", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Direção", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Busca Ativa", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Busca Ativa", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Carlos Drummond - Ed. Especial", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Secretaria", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Secretaria", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Sala 02", modelo: "Epson L6490", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Sala 03", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Coordenação", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Manoel de Barros - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 01", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 01", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 02", modelo: "Brother 6912", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 02", modelo: "Brother L2540", tipo: "Laser PB", toner: "Brother TN2370" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 02", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 03", modelo: "Samsung 6555", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 04", modelo: "Epson L3150", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Esc. Érico Veríssimo - Sala 05", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "Banda", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Érica Schwetter", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Érica Schwetter", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Érica Schwetter", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Álide Belotti", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Álide Belotti", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "CEI Álide Belotti", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Nice Archila - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Nice Archila - Coordenação", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Nice Archila - Secretaria", modelo: "Epson L210", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Nice Archila - Direção", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Dona Dalila", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEMEC", local: "CEI Flamboyant", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEMEC", local: "CEI Sibipiruna - Sala 01", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEMEC", local: "CEI Sibipiruna - Sala 01", modelo: "Epson L210", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "CEI Sibipiruna - Sala 02", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Transporte Escolar", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SEMEC", local: "Transporte Escolar", modelo: "Brother L6912", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SMAS", local: "Assist. Social - Recepção", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Progride", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Coord. Mulher", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Estágio", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Criança Feliz", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Habitação", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Cad. Habitacional", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "Assist. Social - Coord. Social", modelo: "Epson L396", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Gestão Trabalho", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Sec. Gabinete", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Assist. Social - Gestão Compras", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "Assist. Social - Conselhos Ext.", modelo: "HP M127", tipo: "Laser PB", toner: "HP 83A" },
  { secretaria: "SMAS", local: "Assist. Social - Conselhos Ext.", modelo: "Epson L3290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Epson L5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "CRAS Parque União", modelo: "Epson L5590", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Samsung 4833", tipo: "Laser PB", toner: "Samsung D205L" },
  { secretaria: "SMAS", local: "CREAS", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "Casa Abrigo", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Casa Abrigo", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Casa Abrigo", modelo: "Epson L3110", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Conviver", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "Conviver", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 01", modelo: "Epson 5190", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 02", modelo: "Samsung M4080", tipo: "Laser PB", toner: "Samsung D201L" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 03", modelo: "Epson L575", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 03", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "CRAS Cerrado - Sala 04", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SMAS", local: "Conselho Tutelar", modelo: "Samsung 5835", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SMAS", local: "Conselho Tutelar", modelo: "Epson L5290", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SESOP", local: "Pátio de Obras - COP", modelo: "Brother L6912", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SESOP", local: "Pátio de Obras - GFCC", modelo: "Samsung 5835", tipo: "Laser PB", toner: "Samsung D208L" },
  { secretaria: "SESOP", local: "Pátio de Obras - Oficina", modelo: "Samsung M4070", tipo: "Laser PB", toner: "Samsung D203U" },
  { secretaria: "SEDEMA", local: "CANIL", modelo: "Lexmark MX421", tipo: "Laser PB", toner: "Lexmark 56F0Z00" },
  { secretaria: "SEDEMA", local: "CTR", modelo: "Brother 5652", tipo: "Laser PB", toner: "Brother TN3472" },
  { secretaria: "SEDEMA", local: "AGIPEQ/SEDEMA", modelo: "Epson L3250", tipo: "Jato de Tinta", toner: "Epson T544 Preto" },
  { secretaria: "SEDEMA", local: "SEDEMA", modelo: "Brother 6902W", tipo: "Laser PB", toner: "Brother TN3492" },
  { secretaria: "SEDEMA", local: "SEDEMA", modelo: "Epson L695", tipo: "Jato de Tinta", toner: "Epson T664 Preto" },
];

export function statusImpressora(imp: Impressora): "verde" | "amarelo" | "vermelho" {
  const q = estoqueAtual[imp.toner] ?? 0;
  if (q === 0) return "vermelho";
  if (q <= 2) return "amarelo";
  return "verde";
}
