import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, type DragEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/importar")({
  component: Importar,
});

interface PreviewItem {
  codigo: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnit: number;
}

const previewMock: PreviewItem[] = [
  { codigo: "12345", descricao: "Toner HP CF283A Original", unidade: "UN", quantidade: 20, valorUnit: 189.9 },
  { codigo: "12346", descricao: "Toner Brother TN-1060 Original", unidade: "UN", quantidade: 15, valorUnit: 154.5 },
  { codigo: "12347", descricao: "Toner Samsung MLT-D111S", unidade: "UN", quantidade: 30, valorUnit: 132.0 },
  { codigo: "12348", descricao: "Cilindro Brother DR-1060", unidade: "UN", quantidade: 8, valorUnit: 289.9 },
  { codigo: "12349", descricao: "Toner Lexmark 50F4H00", unidade: "UN", quantidade: 12, valorUnit: 412.0 },
  { codigo: "12350", descricao: "Toner HP CE285A", unidade: "UN", quantidade: 25, valorUnit: 178.5 },
];

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Importar() {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const total = previewMock.reduce((s, i) => s + i.quantidade * i.valorUnit, 0);

  return (
    <div className="p-6 space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Importar Extrato do SouChapSul</CardTitle>
          <p className="text-sm text-muted-foreground">
            Envie o PDF do relatório de suprimentos gerado pelo sistema SouChapSul para
            atualizar o estoque automaticamente.
          </p>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
              drag
                ? "border-primary bg-primary/10"
                : "border-border bg-card/50 hover:border-primary/50 hover:bg-accent/30"
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div>
                <div className="text-base font-semibold">
                  Arraste e solte o PDF aqui
                </div>
                <div className="text-sm text-muted-foreground">
                  ou clique para selecionar um arquivo (.pdf até 20MB)
                </div>
              </div>
              <Button variant="secondary" className="mt-1" type="button">
                Selecionar arquivo
              </Button>
            </div>
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-info/15 text-info">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB · pronto para processar
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/20">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Reconhecido
              </Badge>
              <Button size="icon" variant="ghost" onClick={() => setFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Prévia dos Dados Extraídos</CardTitle>
            <p className="text-sm text-muted-foreground">
              {previewMock.length} itens identificados · Total {brl(total)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Descartar</Button>
            <Button>Confirmar importação</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Un.</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewMock.map((i) => (
                <TableRow key={i.codigo}>
                  <TableCell className="font-mono text-xs">{i.codigo}</TableCell>
                  <TableCell className="font-medium">{i.descricao}</TableCell>
                  <TableCell>{i.unidade}</TableCell>
                  <TableCell className="text-right">{i.quantidade}</TableCell>
                  <TableCell className="text-right">{brl(i.valorUnit)}</TableCell>
                  <TableCell className="text-right">
                    {brl(i.quantidade * i.valorUnit)}
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
