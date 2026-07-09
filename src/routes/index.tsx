import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Upload,
  FileText,
  Sparkles,
} from "lucide-react";
import { resumo, alertasCriticos, fases } from "@/lib/data";

export const Route = createFileRoute("/")({
  component: Painel,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "warning" | "destructive" | "info" | "success";
}) {
  const tones = {
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/15 text-destructive",
    info: "bg-info/15 text-info",
    success: "bg-success/15 text-success",
  } as const;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-4xl font-bold tracking-tight text-foreground">{value}</div>
        {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Painel() {
  const prontidao = 62;
  return (
    <div className="p-6 space-y-6">
      {/* Hero dark — estilo PCA Inteligente */}
      <div className="relative overflow-hidden rounded-2xl bg-brand text-brand-foreground p-8 shadow-lg">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--lime) 35%, transparent), transparent 70%)",
          }}
        />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-center">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-widest text-white/60">
              Exercício 2026 · Consolidado
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Painel Executivo de Suprimentos
            </h1>
            <p className="mt-1 text-sm text-white/70 max-w-xl">
              Visão consolidada do parque de impressoras, estoque e alertas operacionais das
              secretarias municipais.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button className="bg-lime text-lime-foreground hover:bg-lime/90 font-semibold">
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
              <Button
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 border-0"
              >
                <FileText className="h-4 w-4" />
                Gerar relatório
              </Button>
            </div>
          </div>

          {/* Score de prontidão — gauge circular */}
          <div className="flex flex-col items-center justify-center">
            <div
              className="relative flex h-28 w-28 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(var(--lime) ${prontidao * 3.6}deg, rgba(255,255,255,0.08) 0)`,
              }}
            >
              <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-brand">
                <span className="text-2xl font-bold text-lime">{prontidao}%</span>
                <span className="text-[9px] uppercase tracking-wider text-white/60">
                  prontidão
                </span>
              </div>
            </div>
            <span className="mt-2 text-[10px] uppercase tracking-widest text-white/60">
              Score operacional
            </span>
          </div>

          <HeroStat label="Impressoras" value={String(resumo.impressoras)} sub="parque ativo" />
          <HeroStat
            label="Valor do estoque"
            value={brl(resumo.valorEstoque).replace("R$", "R$ ")}
            sub={`${resumo.estoqueUnidades} unidades`}
            highlight
          />
          <HeroStat
            label="Cobertura"
            value="74%"
            sub={`${resumo.itensCriticos} itens em risco`}
            bar
          />
        </div>
      </div>

      {/* Sugestões (estilo "Atena sugere") */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-lime" />
          Análise automática · sugestões
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SuggestionCard
            title="8 itens críticos exigem ação imediata"
            desc="Concentre a compra emergencial em Saúde e Educação para restabelecer o nível de serviço."
            cta="Resolver"
          />
          <SuggestionCard
            title="Ata vigente cobre 62% da demanda"
            desc="Aciona a ata para os 12 itens de maior giro e evita nova licitação neste exercício."
            cta="Registrar"
          />
          <SuggestionCard
            title="4 modelos concentram 58% do custo"
            desc="Padronizar substituição eleva a previsibilidade orçamentária dos próximos ciclos."
            cta="Ver análise"
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Itens sem estoque"
          value="8"
          sub="priorizar reposição"
          icon={AlertTriangle}
          tone="destructive"
        />
        <KpiCard
          label="Estoque baixo"
          value="14"
          sub="≤ 2 unidades disponíveis"
          icon={Package}
          tone="warning"
        />
        <KpiCard
          label="Impressoras mapeadas"
          value={String(resumo.impressoras)}
          sub="100% do parque"
          icon={Printer}
          tone="info"
        />
        <KpiCard
          label="Cobertura por ata"
          value="62%"
          sub="dos itens com contrato vigente"
          icon={DollarSign}
          tone="success"
        />
      </div>

      {/* Alertas críticos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alertas Críticos
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Suprimentos zerados ou com risco iminente de ruptura.
            </p>
          </div>
          <Badge variant="destructive">{alertasCriticos.length} itens</Badge>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {alertasCriticos.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.suprimento}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {a.secretaria} · {a.local}
                  </div>
                </div>
                <Badge variant="destructive" className="shrink-0">
                  {a.situacao}
                </Badge>
                <div className="hidden sm:block text-xs text-muted-foreground w-20 text-right">
                  {a.dias === 0 ? "Zerado" : `~${a.dias} dias`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Linha do tempo — 3 fases */}
      <Card>
        <CardHeader>
          <CardTitle>Estratégia em 3 Fases</CardTitle>
          <p className="text-sm text-muted-foreground">
            Roadmap de continuidade operacional do serviço de impressão municipal.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 relative">
            {fases.map((f, i) => {
              const border =
                f.cor === "success"
                  ? "border-success/40"
                  : f.cor === "info"
                  ? "border-info/40"
                  : "border-warning/40";
              const dot =
                f.cor === "success"
                  ? "bg-success text-success-foreground"
                  : f.cor === "info"
                  ? "bg-info text-info-foreground"
                  : "bg-warning text-warning-foreground";
              return (
                <div key={f.fase} className="relative">
                  <div className={`rounded-lg border ${border} bg-card p-5 h-full`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${dot}`}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          Fase {i + 1}
                        </div>
                        <div className="text-base font-semibold">{f.fase}</div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm font-medium">{f.titulo}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{f.descricao}</p>
                  </div>
                  {i < fases.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-1/2 -right-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HeroStat({
  label,
  value,
  sub,
  highlight,
  bar,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  bar?: boolean;
}) {
  return (
    <div className="min-w-[140px]">
      <div className="text-xs text-white/60">{label}</div>
      <div
        className={`mt-1 text-2xl font-bold tracking-tight ${
          highlight ? "text-lime" : "text-white"
        }`}
      >
        {value}
      </div>
      {bar && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[74%] rounded-full bg-lime" />
        </div>
      )}
      {sub && <div className="mt-1 text-[11px] text-white/50">{sub}</div>}
    </div>
  );
}

function SuggestionCard({
  title,
  desc,
  cta,
}: {
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-start gap-3 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-lime">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </div>
        <button className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-lime-foreground hover:underline">
          {cta}
          <ArrowRight className="h-3 w-3" />
        </button>
      </CardContent>
    </Card>
  );
}
