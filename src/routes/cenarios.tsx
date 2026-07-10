import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { autonomiaEstoque, type AutonomiaStatus } from "@/lib/data";
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

const fmtDias = (d: number) =>
  d === Infinity ? "—" : `${Math.round(d)} dias`;
const fmtNum = (n: number) => n.toLocaleString("pt-BR");

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
    </div>
  );
}
