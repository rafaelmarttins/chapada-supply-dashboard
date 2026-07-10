import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  autonomiaEstoque,
  estoqueAtual,
  impressoras,
  simularPriorizacao,
  type AutonomiaStatus,
  type CoberturaLocal,
} from "@/lib/data";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
} from "lucide-react";

export const Route = createFileRoute("/cenarios")({
  component: Cenarios,
});

function StatusBadge({ status }: { status: AutonomiaStatus }) {
  if (status === "critico")
    return (
      <Badge variant="destructive" className="text-xs">
        <XCircle className="h-3 w-3 mr-1" /> Crítico
      </Badge>
    );
  if (status === "atencao")
    return (
      <Badge className="bg-warning/20 text-warning border border-warning/40 hover:bg-warning/20 text-xs">
        <AlertCircle className="h-3 w-3 mr-1" /> Atenção
      </Badge>
    );
  if (status === "ok")
    return (
      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15 text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" /> OK
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-xs">
      <MinusCircle className="h-3 w-3 mr-1" /> S/consumo
    </Badge>
  );
}

function SituacaoBadge({ situacao }: { situacao: CoberturaLocal["situacao"] }) {
  if (situacao === "atendido")
    return (
      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15 text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Atendido
      </Badge>
    );
  if (situacao === "parcial")
    return (
      <Badge className="bg-warning/20 text-warning border border-warning/40 hover:bg-warning/20 text-xs">
        <AlertCircle className="h-3 w-3 mr-1" /> Parcial
      </Badge>
    );
  if (situacao === "nao_atendido")
    return (
      <Badge variant="destructive" className="text-xs">
        <XCircle className="h-3 w-3 mr-1" /> Não atendido
      </Badge>
    );
  return (
    <Badge variant="secondary" className="text-xs">
      <MinusCircle className="h-3 w-3 mr-1" /> Sem dado
    </Badge>
  );
}

const fmtDias = (d: number) => (d === Infinity ? "—" : `${Math.round(d)} dias`);
const fmtNum = (n: number) => n.toLocaleString("pt-BR");
const fmtPct = (n: number) => `${Math.round(n * 100)}%`;

function coberturaClasse(c: number): string {
  if (c >= 0.999) return "text-success font-semibold";
  if (c > 0) return "text-warning font-semibold";
  return "text-destructive font-semibold";
}

function nomeSecretarias(lista: string[]) {
  if (lista.length === 0) return "nenhuma secretaria";
  if (lista.length === 1) return lista[0];
  return `${lista.slice(0, -1).join(", ")} e ${lista[lista.length - 1]}`;
}

type Sim = ReturnType<typeof simularPriorizacao>;

function SecretariaChips({
  secretarias,
  prioritarias,
  onToggle,
}: {
  secretarias: string[];
  prioritarias: string[];
  onToggle: (s: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {secretarias.map((s) => {
        const checked = prioritarias.includes(s);
        return (
          <label
            key={s}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
              checked
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent"
            }`}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={() => onToggle(s)}
              className={`h-3.5 w-3.5 ${checked ? "border-primary-foreground" : ""}`}
            />
            {s}
          </label>
        );
      })}
    </div>
  );
}

function TabResumo({ prioritarias, sim }: { prioritarias: string[]; sim: Sim }) {
  const locaisPrioritarios = sim.porLocal.filter((l) => l.prioridade);
  const atendidos = locaisPrioritarios.filter((l) => l.situacao === "atendido");
  const parciais = locaisPrioritarios.filter((l) => l.situacao === "parcial");
  const naoAtendidos = locaisPrioritarios.filter(
    (l) => l.situacao === "nao_atendido",
  );
  const pctAtendidos =
    locaisPrioritarios.length === 0
      ? 0
      : Math.round((atendidos.length / locaisPrioritarios.length) * 100);

  const locaisComProblema = [...naoAtendidos, ...parciais].sort((a, b) =>
    a.situacao === b.situacao ? 0 : a.situacao === "nao_atendido" ? -1 : 1,
  );

  return (
    <div className="space-y-3">
      <Card className="border-2 border-primary/20">
        <CardContent className="p-4 sm:p-6 text-center space-y-3">
          <div className="text-4xl sm:text-5xl font-extrabold text-primary">
            {pctAtendidos}%
          </div>
          <p className="text-sm sm:text-base text-foreground max-w-2xl mx-auto">
            <strong>{atendidos.length}</strong> de{" "}
            <strong>{locaisPrioritarios.length}</strong> locais de{" "}
            <strong>{nomeSecretarias(prioritarias)}</strong> têm toner
            suficiente pra imprimir o mês inteiro.
          </p>
          <div className="max-w-xl mx-auto">
            <Progress value={pctAtendidos} className="h-3" />
          </div>
          <div className="flex justify-center gap-6 pt-1">
            <div className="text-center">
              <div className="text-xl font-bold text-success">
                {atendidos.length}
              </div>
              <div className="text-[10px] uppercase text-muted-foreground">
                Atendidos
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-warning">
                {parciais.length}
              </div>
              <div className="text-[10px] uppercase text-muted-foreground">
                Parcial
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-destructive">
                {naoAtendidos.length}
              </div>
              <div className="text-[10px] uppercase text-muted-foreground">
                Sem toner
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">
            O que fica sem toner este mês
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {locaisComProblema.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">
                Nenhum local ficará sem toner este mês com a seleção atual.
              </span>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {locaisComProblema.map((l, i) => (
                <li
                  key={i}
                  className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold text-foreground">
                      {l.secretaria}
                    </span>
                    <span className="text-muted-foreground"> — {l.local}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <SituacaoBadge situacao={l.situacao} />
                    {l.tonerCritico && (
                      <span className="text-muted-foreground">
                        sem {l.tonerCritico}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground px-1">
        Locais clínicos de Saúde usam volume real observado (tanque recarregado
        semanalmente). Educação usa uma estimativa provisória 2x maior que a
        média — ajustar quando houver dado de campo.
      </p>
    </div>
  );
}

function TabPriorizacao({
  secretariasDisponiveis,
  prioritarias,
  togglePrio,
  sim,
}: {
  secretariasDisponiveis: string[];
  prioritarias: string[];
  togglePrio: (s: string) => void;
  sim: Sim;
}) {
  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Secretarias prioritárias</CardTitle>
          <p className="text-xs text-muted-foreground">
            Marque as que recebem o estoque primeiro. O restante fica com a
            sobra.
          </p>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <SecretariaChips
            secretarias={secretariasDisponiveis}
            prioritarias={prioritarias}
            onToggle={togglePrio}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">
            Cobertura por Toner (alocação simulada)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-xs">Toner</TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Estoque
                </TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Nec. prio.
                </TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Cob. prio.
                </TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Nec. rest.
                </TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Cob. rest.
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sim.porToner.map((t) => (
                <TableRow key={t.toner}>
                  <TableCell className="py-1.5 text-xs font-medium">
                    {t.toner}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {t.estoqueUnidades}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {t.necessidadePrioridade.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`py-1.5 text-xs text-right ${coberturaClasse(
                      t.coberturaPrioridade,
                    )}`}
                  >
                    {t.necessidadePrioridade === 0
                      ? "—"
                      : fmtPct(t.coberturaPrioridade)}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {t.necessidadeRestante.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`py-1.5 text-xs text-right ${coberturaClasse(
                      t.coberturaRestante,
                    )}`}
                  >
                    {t.necessidadeRestante === 0
                      ? "—"
                      : fmtPct(t.coberturaRestante)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">
            Situação por Local (com priorização)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Não atendidos e parciais aparecem primeiro.
          </p>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-xs">Secretaria</TableHead>
                <TableHead className="h-8 text-xs">Local</TableHead>
                <TableHead className="h-8 text-xs">Prio.?</TableHead>
                <TableHead className="h-8 text-xs">Toner crítico</TableHead>
                <TableHead className="h-8 text-xs">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sim.porLocal.map((l, i) => (
                <TableRow key={i}>
                  <TableCell className="py-1.5 text-xs font-medium">
                    {l.secretaria}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs">{l.local}</TableCell>
                  <TableCell className="py-1.5 text-xs">
                    {l.prioridade ? (
                      <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15 text-xs">
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs">
                    {l.tonerCritico ?? "—"}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <SituacaoBadge situacao={l.situacao} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function TabAlocacao() {
  const tonersEscassos = useMemo(() => {
    const byToner = new Map<string, number[]>();
    impressoras.forEach((imp, idx) => {
      const arr = byToner.get(imp.toner) ?? [];
      arr.push(idx);
      byToner.set(imp.toner, arr);
    });
    const list: {
      toner: string;
      estoque: number;
      printers: {
        idx: number;
        secretaria: string;
        local: string;
        modelo: string;
      }[];
    }[] = [];
    byToner.forEach((idxs, toner) => {
      const est = estoqueAtual[toner] ?? 0;
      if (est < idxs.length) {
        list.push({
          toner,
          estoque: est,
          printers: idxs.map((i) => ({
            idx: i,
            secretaria: impressoras[i].secretaria,
            local: impressoras[i].local,
            modelo: impressoras[i].modelo,
          })),
        });
      }
    });
    return list.sort((a, b) => a.estoque - b.estoque);
  }, []);

  const [alocacao, setAlocacao] = useState<Record<string, number[]>>({});

  const toggleAloc = (toner: string, idx: number, estoque: number) => {
    setAlocacao((prev) => {
      const cur = prev[toner] ?? [];
      if (cur.includes(idx)) {
        return { ...prev, [toner]: cur.filter((i) => i !== idx) };
      }
      if (cur.length >= estoque) return prev;
      return { ...prev, [toner]: [...cur, idx] };
    });
  };

  const sugerirAloc = (
    toner: string,
    printers: { idx: number; secretaria: string }[],
    estoque: number,
  ) => {
    const isPrio = (s: string) => s === "SMS" || s === "SEMEC";
    const prio = printers.filter((p) => isPrio(p.secretaria));
    const others = printers.filter((p) => !isPrio(p.secretaria));
    const chosen = [...prio, ...others].slice(0, estoque).map((p) => p.idx);
    setAlocacao((prev) => ({ ...prev, [toner]: chosen }));
  };

  const naoAtendidasTotal = tonersEscassos.reduce((sum, t) => {
    const alocadas = (alocacao[t.toner] ?? []).length;
    return sum + (t.printers.length - alocadas);
  }, 0);

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">Alocação Manual de Estoque</CardTitle>
        <p className="text-xs text-muted-foreground">
          Para cada toner com estoque insuficiente, escolha quais impressoras
          recebem unidade nessa rodada.
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {tonersEscassos.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-xs">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">
              Todos os toners têm estoque suficiente — nenhuma escolha manual
              necessária.
            </span>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
              <strong>{tonersEscassos.length}</strong> toner(s) com estoque
              insuficiente —{" "}
              <strong className="text-destructive">{naoAtendidasTotal}</strong>{" "}
              impressora(s) não vão receber toner nessa rodada.
            </div>

            {tonersEscassos.map((t) => {
              const marcadas = alocacao[t.toner] ?? [];
              const cheio = marcadas.length >= t.estoque;
              return (
                <div
                  key={t.toner}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-muted/40 px-3 py-2 border-b border-border">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {t.toner}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {t.estoque} un. em estoque para {t.printers.length}{" "}
                        impressoras
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-xs ${
                          cheio
                            ? "bg-success/15 text-success border border-success/30 hover:bg-success/15"
                            : "bg-warning/20 text-warning border border-warning/40 hover:bg-warning/20"
                        }`}
                      >
                        {marcadas.length}/{t.estoque} alocadas
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() =>
                          sugerirAloc(t.toner, t.printers, t.estoque)
                        }
                      >
                        Sugerir
                      </Button>
                    </div>
                  </div>
                  <ul className="divide-y divide-border">
                    {t.printers.map((p) => {
                      const checked = marcadas.includes(p.idx);
                      const disabled = !checked && cheio;
                      return (
                        <li
                          key={p.idx}
                          className={`flex items-center justify-between gap-3 px-3 py-1.5 text-xs ${
                            disabled ? "opacity-50" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-medium text-foreground">
                              {p.secretaria}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              — {p.local}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              · {p.modelo}
                            </span>
                          </div>
                          <label
                            className={`flex items-center gap-1.5 ${
                              disabled ? "cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={disabled}
                              onCheckedChange={() =>
                                toggleAloc(t.toner, p.idx, t.estoque)
                              }
                              className="h-3.5 w-3.5"
                            />
                            Alocar
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TabDetalhes({
  resumo,
}: {
  resumo: {
    toners: { critico: number; atencao: number; ok: number; sem: number };
    locais: { critico: number; atencao: number; ok: number; sem: number };
  };
}) {
  const { porToner, porLocais } = autonomiaEstoque;
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="text-[10px] text-muted-foreground uppercase">
              Toners críticos (&lt;1 mês)
            </div>
            <div className="text-xl font-semibold text-destructive">
              {resumo.toners.critico}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-[10px] text-muted-foreground uppercase">
              Toners em atenção (1-2 meses)
            </div>
            <div className="text-xl font-semibold text-warning">
              {resumo.toners.atencao}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-[10px] text-muted-foreground uppercase">
              Locais críticos
            </div>
            <div className="text-xl font-semibold text-destructive">
              {resumo.locais.critico}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-[10px] text-muted-foreground uppercase">
              Locais em atenção
            </div>
            <div className="text-xl font-semibold text-warning">
              {resumo.locais.atencao}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Autonomia por Toner</CardTitle>
          <p className="text-xs text-muted-foreground">
            {porToner.length} suprimentos analisados (do mais crítico ao mais
            folgado).
          </p>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-xs">Toner</TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Estoque
                </TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Pág. disp.
                </TableHead>
                <TableHead className="h-8 text-xs text-right">Impr.</TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Cons./mês
                </TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Autonomia
                </TableHead>
                <TableHead className="h-8 text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {porToner.map((t) => (
                <TableRow key={t.toner}>
                  <TableCell className="py-1.5 text-xs font-medium">
                    {t.toner}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {t.estoqueUnidades}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {fmtNum(t.paginasDisponiveis)}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {t.impressorasCount}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {fmtNum(t.consumoMensalPaginas)}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {fmtDias(t.diasRestantes)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <StatusBadge status={t.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">
            Autonomia por Secretaria / Local
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Baseado no toner mais crítico de cada local.
          </p>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-xs">Secretaria</TableHead>
                <TableHead className="h-8 text-xs">Local</TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Nº impr.
                </TableHead>
                <TableHead className="h-8 text-xs">Toner crítico</TableHead>
                <TableHead className="h-8 text-xs text-right">
                  Autonomia
                </TableHead>
                <TableHead className="h-8 text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {porLocais.map((l, i) => (
                <TableRow key={i}>
                  <TableCell className="py-1.5 text-xs font-medium">
                    {l.secretaria}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs">{l.local}</TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {l.impressorasCount}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs">
                    {l.tonerCritico ?? "—"}
                  </TableCell>
                  <TableCell className="py-1.5 text-xs text-right">
                    {fmtDias(l.diasRestantes)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    <StatusBadge status={l.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Cenarios() {
  const { porToner, porLocais } = autonomiaEstoque;

  const resumo = useMemo(() => {
    const count = (arr: { status: AutonomiaStatus }[]) => ({
      critico: arr.filter((x) => x.status === "critico").length,
      atencao: arr.filter((x) => x.status === "atencao").length,
      ok: arr.filter((x) => x.status === "ok").length,
      sem: arr.filter((x) => x.status === "sem_consumo").length,
    });
    return { toners: count(porToner), locais: count(porLocais) };
  }, [porToner, porLocais]);

  const secretariasDisponiveis = useMemo(
    () => Array.from(new Set(impressoras.map((i) => i.secretaria))).sort(),
    [],
  );
  const [prioritarias, setPrioritarias] = useState<string[]>(() =>
    secretariasDisponiveis.filter((s) => s === "SMS" || s === "SEMEC"),
  );
  const sim = useMemo(() => simularPriorizacao(prioritarias), [prioritarias]);

  const togglePrio = (s: string) =>
    setPrioritarias((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  return (
    <div className="p-4 space-y-3 max-w-5xl mx-auto">
      <div className="text-center space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Com o estoque de hoje, o que conseguimos atender?
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
          Marque as secretarias que são prioridade. O restante fica com a sobra
          do estoque.
        </p>
      </div>

      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="resumo" className="text-xs sm:text-sm">
            Resumo
          </TabsTrigger>
          <TabsTrigger value="priorizacao" className="text-xs sm:text-sm">
            Priorização
          </TabsTrigger>
          <TabsTrigger value="alocacao" className="text-xs sm:text-sm">
            Alocação Manual
          </TabsTrigger>
          <TabsTrigger value="detalhes" className="text-xs sm:text-sm">
            Detalhes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-3">
          <TabResumo prioritarias={prioritarias} sim={sim} />
        </TabsContent>
        <TabsContent value="priorizacao" className="mt-3">
          <TabPriorizacao
            secretariasDisponiveis={secretariasDisponiveis}
            prioritarias={prioritarias}
            togglePrio={togglePrio}
            sim={sim}
          />
        </TabsContent>
        <TabsContent value="alocacao" className="mt-3">
          <TabAlocacao />
        </TabsContent>
        <TabsContent value="detalhes" className="mt-3">
          <TabDetalhes resumo={resumo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
