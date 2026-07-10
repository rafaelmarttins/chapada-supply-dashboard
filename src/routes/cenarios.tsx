import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/cenarios")({
  component: Cenarios,
});

function StatusBadge({ status }: { status: AutonomiaStatus }) {
  if (status === "critico")
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" /> Crítico
      </Badge>
    );
  if (status === "atencao")
    return (
      <Badge className="bg-warning/20 text-warning border border-warning/40 hover:bg-warning/20">
        <AlertCircle className="h-3 w-3 mr-1" /> Atenção
      </Badge>
    );
  if (status === "ok")
    return (
      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15">
        <CheckCircle2 className="h-3 w-3 mr-1" /> OK
      </Badge>
    );
  return (
    <Badge variant="secondary">
      <MinusCircle className="h-3 w-3 mr-1" /> Sem consumo estimado
    </Badge>
  );
}

function SituacaoBadge({ situacao }: { situacao: CoberturaLocal["situacao"] }) {
  if (situacao === "atendido")
    return (
      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Atendido
      </Badge>
    );
  if (situacao === "parcial")
    return (
      <Badge className="bg-warning/20 text-warning border border-warning/40 hover:bg-warning/20">
        <AlertCircle className="h-3 w-3 mr-1" /> Parcial
      </Badge>
    );
  if (situacao === "nao_atendido")
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" /> Não atendido
      </Badge>
    );
  return (
    <Badge variant="secondary">
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

  // ============= Simulador =============
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

  // ============= Resumo executivo =============
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

  const locaisComProblema = useMemo(() => {
    return [...naoAtendidos, ...parciais].sort((a, b) => {
      if (a.situacao === b.situacao) return 0;
      return a.situacao === "nao_atendido" ? -1 : 1;
    });
  }, [naoAtendidos, parciais]);

  // ============= Alocação Manual de Estoque =============
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Topo */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Com o estoque de hoje, o que conseguimos atender?
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Marque as secretarias que são prioridade. O restante fica com a sobra
          do estoque que sobrar.
        </p>
      </div>

      {/* Seleção de secretarias */}
      <div className="flex flex-wrap justify-center gap-3">
        {secretariasDisponiveis.map((s) => {
          const checked = prioritarias.includes(s);
          return (
            <label
              key={s}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm sm:text-base font-medium cursor-pointer transition-colors ${
                checked
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => togglePrio(s)}
                className={checked ? "border-primary-foreground" : ""}
              />
              {s}
            </label>
          );
        })}
      </div>

      {/* Resultado em destaque */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardContent className="p-6 sm:p-10 text-center space-y-4">
          <div className="text-6xl sm:text-8xl font-extrabold text-primary">
            {pctAtendidos}%
          </div>
          <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto">
            <strong>{atendidos.length}</strong> de{" "}
            <strong>{locaisPrioritarios.length}</strong> locais de{" "}
            <strong>{nomeSecretarias(prioritarias)}</strong> têm toner
            suficiente pra imprimir o mês inteiro.
          </p>
          <div className="max-w-xl mx-auto">
            <Progress value={pctAtendidos} className="h-4" />
          </div>
          <div className="flex justify-center gap-6 sm:gap-10 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {atendidos.length}
              </div>
              <div className="text-xs uppercase text-muted-foreground">
                Atendidos
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {parciais.length}
              </div>
              <div className="text-xs uppercase text-muted-foreground">
                Parcial
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {naoAtendidos.length}
              </div>
              <div className="text-xs uppercase text-muted-foreground">
                Sem toner
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* O que fica sem toner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">O que fica sem toner este mês</CardTitle>
        </CardHeader>
        <CardContent>
          {locaisComProblema.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                Nenhum local ficará sem toner este mês com a seleção atual.
              </span>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {locaisComProblema.map((l, i) => (
                <li
                  key={i}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <div>
                    <span className="font-semibold text-foreground">
                      {l.secretaria}
                    </span>
                    <span className="text-muted-foreground"> — {l.local}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
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

      {/* Detalhes técnicos */}
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
            Ver detalhes técnicos
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-5 pt-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase">
                  Toners críticos (&lt;1 mês)
                </div>
                <div className="text-2xl font-semibold text-destructive">
                  {resumo.toners.critico}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase">
                  Toners em atenção (1-2 meses)
                </div>
                <div className="text-2xl font-semibold text-warning">
                  {resumo.toners.atencao}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase">
                  Locais críticos
                </div>
                <div className="text-2xl font-semibold text-destructive">
                  {resumo.locais.critico}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase">
                  Locais em atenção
                </div>
                <div className="text-2xl font-semibold text-warning">
                  {resumo.locais.atencao}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Autonomia de Estoque</CardTitle>
              <p className="text-sm text-muted-foreground">
                Autonomia estimada com base no estoque atual, rendimento médio
                de mercado por suprimento e volume médio de impressão por tipo
                de impressora. Ajuste as constantes em{" "}
                <code>src/lib/data.ts</code> ({" "}
                <code>RENDIMENTO_PAGINAS</code>,{" "}
                <code>VOLUME_MENSAL_ESTIMADO</code>) quando houver dados reais
                de consumo.
              </p>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Secretarias Priorizadas
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {sim.resumoPrioridade.total} locais nas secretarias marcadas.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-success">
                      {sim.resumoPrioridade.atendidos}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      Atendidos
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-warning">
                      {sim.resumoPrioridade.parciais}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      Parciais
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-destructive">
                      {sim.resumoPrioridade.naoAtendidos}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      Não atendidos
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Demais Secretarias
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {sim.resumoRestante.total} locais recebem apenas a sobra do
                  estoque.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-success">
                      {sim.resumoRestante.atendidos}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      Atendidos
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-warning">
                      {sim.resumoRestante.parciais}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      Parciais
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-destructive">
                      {sim.resumoRestante.naoAtendidos}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      Não atendidos
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Autonomia por Toner</CardTitle>
              <p className="text-sm text-muted-foreground">
                {porToner.length} suprimentos analisados (ordenados do mais
                crítico ao mais folgado).
              </p>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Toner</TableHead>
                    <TableHead className="text-right">Estoque (un.)</TableHead>
                    <TableHead className="text-right">
                      Páginas disponíveis
                    </TableHead>
                    <TableHead className="text-right">Impressoras</TableHead>
                    <TableHead className="text-right">
                      Consumo/mês (pág.)
                    </TableHead>
                    <TableHead className="text-right">Autonomia</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {porToner.map((t) => (
                    <TableRow key={t.toner}>
                      <TableCell className="font-medium">{t.toner}</TableCell>
                      <TableCell className="text-right">
                        {t.estoqueUnidades}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtNum(t.paginasDisponiveis)}
                      </TableCell>
                      <TableCell className="text-right">
                        {t.impressorasCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtNum(t.consumoMensalPaginas)}
                      </TableCell>
                      <TableCell className="text-right">
                        {fmtDias(t.diasRestantes)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Autonomia por Secretaria / Local</CardTitle>
              <p className="text-sm text-muted-foreground">
                Baseado no toner mais crítico de cada local (gargalo de
                impressão).
              </p>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Secretaria</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-right">Nº impressoras</TableHead>
                    <TableHead>Toner mais crítico</TableHead>
                    <TableHead className="text-right">Autonomia</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {porLocais.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {l.secretaria}
                      </TableCell>
                      <TableCell>{l.local}</TableCell>
                      <TableCell className="text-right">
                        {l.impressorasCount}
                      </TableCell>
                      <TableCell>{l.tonerCritico ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {fmtDias(l.diasRestantes)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={l.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cobertura por Toner (alocação simulada)</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Toner</TableHead>
                    <TableHead className="text-right">Estoque (un.)</TableHead>
                    <TableHead className="text-right">
                      Necess. prioridade (un./mês)
                    </TableHead>
                    <TableHead className="text-right">
                      Cobertura prioridade
                    </TableHead>
                    <TableHead className="text-right">
                      Necess. restante (un./mês)
                    </TableHead>
                    <TableHead className="text-right">
                      Cobertura restante
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sim.porToner.map((t) => (
                    <TableRow key={t.toner}>
                      <TableCell className="font-medium">{t.toner}</TableCell>
                      <TableCell className="text-right">
                        {t.estoqueUnidades}
                      </TableCell>
                      <TableCell className="text-right">
                        {t.necessidadePrioridade.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${coberturaClasse(
                          t.coberturaPrioridade,
                        )}`}
                      >
                        {t.necessidadePrioridade === 0
                          ? "—"
                          : fmtPct(t.coberturaPrioridade)}
                      </TableCell>
                      <TableCell className="text-right">
                        {t.necessidadeRestante.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${coberturaClasse(
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
            <CardHeader>
              <CardTitle>Situação por Local (com priorização)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Locais não atendidos e parcialmente atendidos aparecem primeiro.
              </p>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Secretaria</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Prioridade?</TableHead>
                    <TableHead>Toner mais crítico</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sim.porLocal.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {l.secretaria}
                      </TableCell>
                      <TableCell>{l.local}</TableCell>
                      <TableCell>
                        {l.prioridade ? (
                          <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/15">
                            Sim
                          </Badge>
                        ) : (
                          <Badge variant="outline">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell>{l.tonerCritico ?? "—"}</TableCell>
                      <TableCell>
                        <SituacaoBadge situacao={l.situacao} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
