import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cenarios, situacaoDe, type ItemCenario } from "@/lib/data";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/cenarios")({
  component: Cenarios,
});

function SituacaoBadge({ item }: { item: ItemCenario }) {
  const s = situacaoDe(item);
  if (s === "atendido")
    return (
      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Atendido
      </Badge>
    );
  if (s === "parcial")
    return (
      <Badge className="bg-warning/20 text-warning border border-warning/40 hover:bg-warning/20">
        <AlertCircle className="h-3 w-3 mr-1" /> Parcial
      </Badge>
    );
  return (
    <Badge variant="destructive">
      <XCircle className="h-3 w-3 mr-1" /> Não atendido
    </Badge>
  );
}

function CenarioView({
  titulo,
  descricao,
  items,
}: {
  titulo: string;
  descricao: string;
  items: ItemCenario[];
}) {
  const stats = useMemo(() => {
    const total = items.length;
    let atendidos = 0,
      parciais = 0,
      nao = 0,
      necessario = 0,
      atendido = 0;
    for (const it of items) {
      necessario += it.necessaria;
      atendido += it.atendida;
      const s = situacaoDe(it);
      if (s === "atendido") atendidos++;
      else if (s === "parcial") parciais++;
      else nao++;
    }
    const cobertura = necessario === 0 ? 0 : Math.round((atendido / necessario) * 100);
    return { total, atendidos, parciais, nao, cobertura };
  }, [items]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Demandas</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Cobertura</div>
            <div className="text-2xl font-semibold text-success">{stats.cobertura}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Atendidos</div>
            <div className="text-2xl font-semibold text-success">{stats.atendidos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Parciais</div>
            <div className="text-2xl font-semibold text-warning">{stats.parciais}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase">Não atendidos</div>
            <div className="text-2xl font-semibold text-destructive">{stats.nao}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Secretaria</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Suprimento</TableHead>
                <TableHead className="text-right">Qtd Necessária</TableHead>
                <TableHead className="text-right">Qtd Atendida</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{it.secretaria}</TableCell>
                  <TableCell>{it.local}</TableCell>
                  <TableCell>{it.suprimento}</TableCell>
                  <TableCell className="text-right">{it.necessaria}</TableCell>
                  <TableCell className="text-right">{it.atendida}</TableCell>
                  <TableCell>
                    <SituacaoBadge item={it} />
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
  return (
    <div className="p-6 space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Cenários de Atendimento</CardTitle>
          <p className="text-sm text-muted-foreground">
            Simulações de cobertura de demanda por estratégia de suprimento.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="c1" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="c1">C1 · Estoque Saúde+Edu</TabsTrigger>
              <TabsTrigger value="c2">C2 · Estoque Todas</TabsTrigger>
              <TabsTrigger value="c3">C3 · Ata Saúde+Edu</TabsTrigger>
              <TabsTrigger value="c4">C4 · Ata Todas</TabsTrigger>
            </TabsList>
            <TabsContent value="c1" className="mt-5">
              <CenarioView {...cenarios.c1} />
            </TabsContent>
            <TabsContent value="c2" className="mt-5">
              <CenarioView {...cenarios.c2} />
            </TabsContent>
            <TabsContent value="c3" className="mt-5">
              <CenarioView {...cenarios.c3} />
            </TabsContent>
            <TabsContent value="c4" className="mt-5">
              <CenarioView {...cenarios.c4} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
