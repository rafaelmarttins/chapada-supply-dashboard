import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Upload,
  FileText,
} from "lucide-react";
import {
  resumo,
  fases,
  autonomiaEstoque,
  simularPriorizacao,
  impressoras,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  component: Painel,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDias = (d: number) => {
  if (!isFinite(d)) return "—";
  if (d < 1) return "< 1 dia";
  if (d < 30) return `${Math.round(d)} dias`;
  const meses = d / 30;
  return `${meses.toFixed(1)} meses`;
};

function Painel() {
  // Score de Prontidão: % de toners com autonomia OK
  const porToner = autonomiaEstoque.porToner;
  const tonersComConsumo = porToner.filter((t) => t.status !== "sem_consumo");
  const prontidao = tonersComConsumo.length
    ? Math.round(
        (tonersComConsumo.filter((t) => t.status === "ok").length /
          tonersComConsumo.length) *
          100
      )
    : 0;

  // Cobertura: simulação sem priorização
  const simGeral = simularPriorizacao([]);
  const locaisComDado = simGeral.porLocal.filter((l) => l.situacao !== "sem_dado");
  const cobertura = locaisComDado.length
    ? Math.round(
        (locaisComDado.filter((l) => l.situacao === "atendido").length /
          locaisComDado.length) *
          100
      )
    : 0;

  // Alertas críticos por toner (autonomia real)
  const alertasToner = porToner
    .filter((t) => t.status === "critico" || t.status === "atencao")
    .slice(0, 10);

  const semEstoque = porToner.filter(
    (t) => t.status === "critico" && t.estoqueUnidades === 0
  ).length;
  const emAtencao = porToner.filter((t) => t.status === "atencao").length;

  // Locais mais críticos
  const locaisCriticos = autonomiaEstoque.porLocais
    .filter((l) => l.status === "critico" || l.status === "atencao")
    .slice(0, 8);

  const impCount = (toner: string) =>
    impressoras.filter((i) => i.toner === toner).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header municipal */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Prefeitura de Chapadão do Sul
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                Painel Executivo de Suprimentos
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Visão consolidada do parque de impressoras, estoque e alertas operacionais.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="h-8 gap-1.5 border-primary/30 bg-primary/10 px-3 text-xs font-semibold text-primary"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Sincronizado: agora
              </Badge>
              <Button size="sm" className="gap-1.5">
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <FileText className="h-4 w-4" />
                Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs + Alertas */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Score de Prontidão
                </h3>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 flex items-end gap-4">
                <span className="text-5xl font-black leading-none text-foreground font-mono-display">
                  {prontidao}%
                </span>
                <div className="flex-1 self-center">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${prontidao}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Toners com autonomia OK sobre o total com consumo estimado.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Printer className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Impressoras
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground font-mono-display">
                  {resumo.impressoras}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Cobertura
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground font-mono-display">
                  {cobertura}%
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Locais atendidos sem priorização
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-primary text-primary-foreground shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <DollarSign className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Valor do Estoque
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold font-mono-display">
                {brl(resumo.valorEstoque)}
              </p>
              <p className="mt-1 text-xs text-primary-foreground/80">
                {resumo.estoqueUnidades} unidades em estoque
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas por toner */}
        <div className="lg:col-span-8">
          <Card className="h-full shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Alertas Críticos por Toner
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Autonomia calculada a partir do estoque, rendimento e consumo mensal estimado.
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-destructive/30 bg-destructive/10 text-destructive"
                >
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  {semEstoque} sem estoque
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1.5 border-warning/30 bg-warning/10 text-warning"
                >
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  {emAtencao} em atenção
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-bold">Toner</th>
                      <th className="px-4 py-3 font-bold text-right">Estoque</th>
                      <th className="px-4 py-3 font-bold text-right">Impressoras</th>
                      <th className="px-4 py-3 font-bold text-right">Autonomia</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {alertasToner.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-sm text-muted-foreground"
                        >
                          Nenhum toner em situação crítica ou de atenção.
                        </td>
                      </tr>
                    )}
                    {alertasToner.map((t) => (
                      <tr key={t.toner} className="hover:bg-accent/40 transition-colors">
                        <td className="px-4 py-3 font-medium">{t.toner}</td>
                        <td className="px-4 py-3 text-right font-mono-display">
                          {t.estoqueUnidades}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {impCount(t.toner)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {fmtDias(t.diasRestantes)}
                        </td>
                        <td className="px-4 py-3">
                          {t.status === "critico" ? (
                            <Badge variant="destructive">Crítico</Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-warning/30 bg-warning/10 text-warning"
                            >
                              Atenção
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Locais mais críticos */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Locais Mais Críticos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Onde o suprimento aperta primeiro, considerando o toner de menor autonomia em cada local.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-bold">Secretaria</th>
                  <th className="px-4 py-3 font-bold">Local</th>
                  <th className="px-4 py-3 font-bold">Toner crítico</th>
                  <th className="px-4 py-3 font-bold text-right">Autonomia</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {locaisCriticos.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Nenhum local em situação crítica ou de atenção.
                    </td>
                  </tr>
                )}
                {locaisCriticos.map((l, i) => (
                  <tr
                    key={`${l.secretaria}-${l.local}-${i}`}
                    className="hover:bg-accent/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{l.secretaria}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.local}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {l.tonerCritico ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {fmtDias(l.diasRestantes)}
                    </td>
                    <td className="px-4 py-3">
                      {l.status === "critico" ? (
                        <Badge variant="destructive">Crítico</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-warning/30 bg-warning/10 text-warning"
                        >
                          Atenção
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card className="shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Roadmap de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute left-0 top-4 hidden h-0.5 w-full bg-border md:block" />
            {fases.map((f, i) => {
              const done = i < 2;
              const current = i === 1;
              return (
                <div key={f.fase} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : "border-2 border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="mt-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {i === 0 ? "Concluído" : current ? "Em curso" : "Próxima fase"}
                    </div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      {f.titulo}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{f.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
