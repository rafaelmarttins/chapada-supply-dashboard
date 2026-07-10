import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  impressoras,
  simularPriorizacao,
  type AutonomiaStatus,
  type CoberturaLocal,
} from "@/lib/data";
import { CheckCircle2, AlertCircle, XCircle, MinusCircle } from "lucide-react";

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

  return (
    <div className="p-6 space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Autonomia de Estoque</CardTitle>
          <p className="text-sm text-muted-foreground">
            Autonomia estimada com base no estoque atual, rendimento médio de
            mercado por suprimento e volume médio de impressão por tipo de
            impressora. Ajuste as constantes em <code>src/lib/data.ts</code>{" "}
            (<code>RENDIMENTO_PAGINAS</code>, <code>VOLUME_MENSAL_ESTIMADO</code>)
            quando houver dados reais de consumo.
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Toners críticos (&lt;1 mês)</div>
            <div className="text-2xl font-semibold text-destructive">{resumo.toners.critico}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Toners em atenção (1-2 meses)</div>
            <div className="text-2xl font-semibold text-warning">{resumo.toners.atencao}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Locais críticos</div>
            <div className="text-2xl font-semibold text-destructive">{resumo.locais.critico}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Locais em atenção</div>
            <div className="text-2xl font-semibold text-warning">{resumo.locais.atencao}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Autonomia por Toner</CardTitle>
          <p className="text-sm text-muted-foreground">
            {porToner.length} suprimentos analisados (ordenados do mais crítico ao mais folgado).
          </p>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Toner</TableHead>
                <TableHead className="text-right">Estoque (un.)</TableHead>
                <TableHead className="text-right">Páginas disponíveis</TableHead>
                <TableHead className="text-right">Impressoras</TableHead>
                <TableHead className="text-right">Consumo/mês (pág.)</TableHead>
                <TableHead className="text-right">Autonomia</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {porToner.map((t) => (
                <TableRow key={t.toner}>
                  <TableCell className="font-medium">{t.toner}</TableCell>
                  <TableCell className="text-right">{t.estoqueUnidades}</TableCell>
                  <TableCell className="text-right">{fmtNum(t.paginasDisponiveis)}</TableCell>
                  <TableCell className="text-right">{t.impressorasCount}</TableCell>
                  <TableCell className="text-right">{fmtNum(t.consumoMensalPaginas)}</TableCell>
                  <TableCell className="text-right">{fmtDias(t.diasRestantes)}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
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
            Baseado no toner mais crítico de cada local (gargalo de impressão).
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
                  <TableCell className="font-medium">{l.secretaria}</TableCell>
                  <TableCell>{l.local}</TableCell>
                  <TableCell className="text-right">{l.impressorasCount}</TableCell>
                  <TableCell>{l.tonerCritico ?? "—"}</TableCell>
                  <TableCell className="text-right">{fmtDias(l.diasRestantes)}</TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* Simulador de Priorização                                     */}
      {/* ============================================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Priorização</CardTitle>
          <p className="text-sm text-muted-foreground">
            Simula o que acontece se o estoque de cada toner for alocado primeiro
            para as secretarias marcadas como prioridade, usando a sobra (se
            houver) para as demais. Mostra o efeito direto de priorizar um grupo
            sobre o resto.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
              Secretarias prioritárias
            </div>
            <div className="flex flex-wrap gap-3">
              {secretariasDisponiveis.map((s) => {
                const checked = prioritarias.includes(s);
                return (
                  <label
                    key={s}
                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                      checked
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => togglePrio(s)}
                    />
                    {s}
                  </label>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Secretarias Priorizadas</CardTitle>
            <p className="text-xs text-muted-foreground">
              {sim.resumoPrioridade.total} locais nas secretarias marcadas.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-semibold text-success">{sim.resumoPrioridade.atendidos}</div>
                <div className="text-xs text-muted-foreground uppercase">Atendidos</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-warning">{sim.resumoPrioridade.parciais}</div>
                <div className="text-xs text-muted-foreground uppercase">Parciais</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-destructive">{sim.resumoPrioridade.naoAtendidos}</div>
                <div className="text-xs text-muted-foreground uppercase">Não atendidos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demais Secretarias</CardTitle>
            <p className="text-xs text-muted-foreground">
              {sim.resumoRestante.total} locais recebem apenas a sobra do estoque.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-2xl font-semibold text-success">{sim.resumoRestante.atendidos}</div>
                <div className="text-xs text-muted-foreground uppercase">Atendidos</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-warning">{sim.resumoRestante.parciais}</div>
                <div className="text-xs text-muted-foreground uppercase">Parciais</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-destructive">{sim.resumoRestante.naoAtendidos}</div>
                <div className="text-xs text-muted-foreground uppercase">Não atendidos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <TableHead className="text-right">Necess. prioridade (un./mês)</TableHead>
                <TableHead className="text-right">Cobertura prioridade</TableHead>
                <TableHead className="text-right">Necess. restante (un./mês)</TableHead>
                <TableHead className="text-right">Cobertura restante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sim.porToner.map((t) => (
                <TableRow key={t.toner}>
                  <TableCell className="font-medium">{t.toner}</TableCell>
                  <TableCell className="text-right">{t.estoqueUnidades}</TableCell>
                  <TableCell className="text-right">{t.necessidadePrioridade.toFixed(2)}</TableCell>
                  <TableCell className={`text-right ${coberturaClasse(t.coberturaPrioridade)}`}>
                    {t.necessidadePrioridade === 0 ? "—" : fmtPct(t.coberturaPrioridade)}
                  </TableCell>
                  <TableCell className="text-right">{t.necessidadeRestante.toFixed(2)}</TableCell>
                  <TableCell className={`text-right ${coberturaClasse(t.coberturaRestante)}`}>
                    {t.necessidadeRestante === 0 ? "—" : fmtPct(t.coberturaRestante)}
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
                  <TableCell className="font-medium">{l.secretaria}</TableCell>
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
                  <TableCell><SituacaoBadge situacao={l.situacao} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
