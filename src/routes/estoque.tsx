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
import { estoque, estoqueResumo } from "@/lib/data";

export const Route = createFileRoute("/estoque")({
  component: Estoque,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Estoque() {
  const [status, setStatus] = useState<"todos" | "mapeado" | "nao_mapeado">("todos");
  const [busca, setBusca] = useState("");

  const items = useMemo(() => {
    return estoque.filter((e) => {
      if (status === "mapeado" && !e.mapeado) return false;
      if (status === "nao_mapeado" && e.mapeado) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (
          !e.suprimento.toLowerCase().includes(q) &&
          !e.codigo.toLowerCase().includes(q) &&
          !e.secretaria.toLowerCase().includes(q) &&
          !e.local.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [status, busca]);

  return (
    <div className="p-6 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Itens Cadastrados</div>
            <div className="text-2xl font-semibold">{estoqueResumo.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Mapeados</div>
            <div className="text-2xl font-semibold text-primary">{estoqueResumo.mapeados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Não Mapeados</div>
            <div className="text-2xl font-semibold text-warning">{estoqueResumo.naoMapeados}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase text-muted-foreground">Valor Total</div>
            <div className="text-2xl font-semibold text-info">{brl(estoqueResumo.valorTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle>Estoque de Suprimentos</CardTitle>
            <p className="text-sm text-muted-foreground">
              {items.length} de {estoque.length} itens exibidos
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:w-auto w-full">
            <Input
              placeholder="Buscar por suprimento, código, local..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="sm:w-72"
            />
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="mapeado">Mapeados</SelectItem>
                <SelectItem value="nao_mapeado">Não mapeados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Suprimento</TableHead>
                <TableHead>Secretaria</TableHead>
                <TableHead>Local</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.codigo}</TableCell>
                  <TableCell className="font-medium">{e.suprimento}</TableCell>
                  <TableCell>{e.secretaria}</TableCell>
                  <TableCell>{e.local}</TableCell>
                  <TableCell className="text-right">{e.quantidade}</TableCell>
                  <TableCell className="text-right">{brl(e.valorUnit)}</TableCell>
                  <TableCell className="text-right">{brl(e.valorUnit * e.quantidade)}</TableCell>
                  <TableCell>
                    {e.mapeado ? (
                      <Badge className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/20">
                        Mapeado
                      </Badge>
                    ) : (
                      <Badge className="bg-warning/20 text-warning border border-warning/40 hover:bg-warning/20">
                        Não mapeado
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum item corresponde aos filtros.
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
