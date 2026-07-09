import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { impressoras, estoqueAtual, statusImpressora } from "@/lib/data";

export const Route = createFileRoute("/impressoras")({
  component: ImpressorasPage,
});

function ImpressorasPage() {
  const [secretaria, setSecretaria] = useState<string>("todas");
  const [status, setStatus] = useState<"todos" | "verde" | "amarelo" | "vermelho">("todos");
  const [busca, setBusca] = useState("");

  const secretarias = useMemo(
    () => Array.from(new Set(impressoras.map((i) => i.secretaria))).sort(),
    []
  );

  const resumo = useMemo(() => {
    let verde = 0, amarelo = 0, vermelho = 0;
    for (const imp of impressoras) {
      const s = statusImpressora(imp);
      if (s === "verde") verde++;
      else if (s === "amarelo") amarelo++;
      else vermelho++;
    }
    return { total: impressoras.length, verde, amarelo, vermelho };
  }, []);

  const items = useMemo(() => {
    return impressoras.filter((imp) => {
      if (secretaria !== "todas" && imp.secretaria !== secretaria) return false;
      if (status !== "todos" && statusImpressora(imp) !== status) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (
          !imp.local.toLowerCase().includes(q) &&
          !imp.modelo.toLowerCase().includes(q) &&
          !imp.toner.toLowerCase().includes(q) &&
          !imp.secretaria.toLowerCase().includes(q) &&
          !imp.tipo.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [secretaria, status, busca]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Parque de Impressoras</h1>
        <p className="text-sm text-muted-foreground">
          Inventário completo do parque de impressão da Prefeitura de Chapadão do Sul.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Total de Impressoras</div>
            <div className="text-2xl font-semibold">{resumo.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Com Estoque de Toner</div>
            <div className="text-2xl font-semibold text-success">{resumo.verde}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Estoque Baixo (≤2)</div>
            <div className="text-2xl font-semibold text-warning">{resumo.amarelo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Sem Estoque</div>
            <div className="text-2xl font-semibold text-destructive">{resumo.vermelho}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Impressoras Cadastradas</CardTitle>
            <p className="text-sm text-muted-foreground">
              {items.length} de {impressoras.length} equipamentos exibidos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:w-auto w-full">
            <Input
              placeholder="Buscar por local, modelo, toner..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="sm:w-64"
            />
            <Select value={secretaria} onValueChange={setSecretaria}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas secretarias</SelectItem>
                {secretarias.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos status</SelectItem>
                <SelectItem value="verde">Com estoque</SelectItem>
                <SelectItem value="amarelo">Estoque baixo</SelectItem>
                <SelectItem value="vermelho">Sem estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Secretaria</TableHead>
                <TableHead>Local / Setor</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Toner/Tinta</TableHead>
                <TableHead className="text-right">Qtd Estoque</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((imp, idx) => {
                const qtd = estoqueAtual[imp.toner] ?? 0;
                const st = statusImpressora(imp);
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{imp.secretaria}</TableCell>
                    <TableCell>{imp.local}</TableCell>
                    <TableCell>{imp.modelo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{imp.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{imp.toner}</TableCell>
                    <TableCell className="text-right font-mono">{qtd}</TableCell>
                    <TableCell>
                      {st === "verde" && (
                        <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15">
                          🟢 Com estoque
                        </Badge>
                      )}
                      {st === "amarelo" && (
                        <Badge className="bg-warning/20 text-warning border border-warning/40 hover:bg-warning/20">
                          🟡 Estoque baixo
                        </Badge>
                      )}
                      {st === "vermelho" && (
                        <Badge className="bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/20">
                          🔴 Sem estoque
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma impressora corresponde aos filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
