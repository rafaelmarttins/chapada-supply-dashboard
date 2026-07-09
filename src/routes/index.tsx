import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { resumo, alertasCriticos, fases } from "@/lib/data";

export const Route = createFileRoute("/")({
  component: Painel,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "info" | "warning" | "destructive";
}) {
  const tones = {
    primary: { bg: "bg-success/15", fg: "text-success", border: "border-l-success" },
    info: { bg: "bg-info/15", fg: "text-info", border: "border-l-info" },
    warning: { bg: "bg-warning/15", fg: "text-warning", border: "border-l-warning" },
    destructive: { bg: "bg-destructive/15", fg: "text-destructive", border: "border-l-destructive" },
  };
  const t = tones[tone];
  return (
    <Card className={`border-l-4 ${t.border} shadow-sm`}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${t.bg} ${t.fg}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Painel() {
  return (
    <div className="p-6 space-y-6">
      {/* Header escuro */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-card via-card to-card/60 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              CEGIT / DTI · Prefeitura de Chapadão do Sul
            </div>
            <h1 className="mt-1 text-2xl font-bold">Painel Executivo de Suprimentos</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Visão consolidada do parque de impressoras, estoque de suprimentos e alertas
              operacionais das secretarias municipais.
            </p>
          </div>
          <Badge className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/20">
            Atualizado agora
          </Badge>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Impressoras" value={String(resumo.impressoras)} icon={Printer} tone="info" />
        <StatCard label="Unidades em Estoque" value={String(resumo.estoqueUnidades)} icon={Package} tone="primary" />
        <StatCard label="Valor do Estoque" value={brl(resumo.valorEstoque)} icon={DollarSign} tone="warning" />
        <StatCard label="Itens Críticos" value={String(resumo.itensCriticos)} icon={AlertTriangle} tone="destructive" />
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
                  ? "border-primary/40"
                  : f.cor === "info"
                  ? "border-info/40"
                  : "border-warning/40";
              const dot =
                f.cor === "success"
                  ? "bg-primary text-primary-foreground"
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
