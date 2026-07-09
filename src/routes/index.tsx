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
import { resumo, alertasCriticos, fases } from "@/lib/data";

export const Route = createFileRoute("/")({
  component: Painel,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Painel() {
  const prontidao = 62;
  const cobertura = 74;

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

      {/* Main grid: KPIs + Alertas */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left column — score + quick stats + valor */}
        <div className="space-y-6 lg:col-span-4">
          {/* Score de prontidão */}
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
                Baseado em estoque disponível, cobertura de ata e itens críticos.
              </p>
            </CardContent>
          </Card>

          {/* Quick stats */}
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
              </CardContent>
            </Card>
          </div>

          {/* Valor do estoque */}
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

        {/* Right column — alertas críticos */}
        <div className="lg:col-span-8">
          <Card className="h-full shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Alertas Críticos e Disponibilidade
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Suprimentos zerados ou com risco iminente de ruptura.
                </p>
              </div>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="gap-1.5 border-destructive/30 bg-destructive/10 text-destructive"
                >
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  {resumo.itensCriticos} sem estoque
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1.5 border-warning/30 bg-warning/10 text-warning"
                >
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  14 baixo
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-bold">Secretaria</th>
                      <th className="px-4 py-3 font-bold">Local / Setor</th>
                      <th className="px-4 py-3 font-bold">Suprimento</th>
                      <th className="px-4 py-3 font-bold">Situação</th>
                      <th className="px-4 py-3 font-bold text-right">Prazo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {alertasCriticos.map((a, i) => (
                      <tr key={i} className="hover:bg-accent/40 transition-colors">
                        <td className="px-4 py-3 font-medium">{a.secretaria}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.local}</td>
                        <td className="px-4 py-3">{a.suprimento}</td>
                        <td className="px-4 py-3">
                          {a.situacao === "Sem estoque" ? (
                            <Badge variant="destructive">{a.situacao}</Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-warning/30 bg-warning/10 text-warning"
                            >
                              {a.situacao}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {a.dias === 0 ? "Zerado" : `~${a.dias} dias`}
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

      {/* Roadmap de 3 fases */}
      <Card className="shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Roadmap de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="relative grid gap-8 md:grid-cols-3">
            {/* connecting line */}
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
