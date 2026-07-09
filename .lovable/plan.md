## Objetivo

Corrigir a tela **Parque de Impressoras** para que cada equipamento esteja vinculado ao suprimento realmente compatível e que a coluna **Qtd Estoque** reflita a soma real das unidades daquele suprimento cadastradas no módulo de Estoque.

## Diagnóstico

Ao cruzar `impressoras[]` × `estoque[]` em `src/lib/data.ts` encontrei três classes de erro:

1. **Compatibilidade errada de tinta Epson** — todas as Epson EcoTank da linha L3xxx/L5xxx (L3110, L3150, L3210, L3250, L5190, L5290, L5590) estão apontadas para "Epson T664 Preto", quando o correto é **Epson T544 Preto**. Apenas L110, L120, L200/210/220, L355/365/375/380/395/396/455/475/555/565/575 e L1300 usam T664.
2. **Toner errado em modelos laser**, por exemplo:
   - Brother HL-1222 / L1222 → hoje "TN116BR"; correto **TN1060**.
   - Samsung/HP ML-2165 ("HP 2165", "Samsung 2165") → hoje "D111L"; correto **D101**.
   - HP M277 (color) → hoje "Samsung D208L"; correto **HP 410A**.
   - HP M452 → hoje "HP 58X"; correto **HP 410A**.
3. **`estoqueAtual` desalinhado do estoque real** — o mapa hoje é preenchido "à mão" com valores que não batem com a soma das linhas em `estoque[]` (ex.: soma real de "TINTA PRETA EPSON 544" + "KIT COMPLETO DE TINTA EPSON 544" ≠ 10; TN3662XLS existe em estoque mas nenhuma impressora aponta para ele, e vice-versa).

## Escopo da correção (somente `src/lib/data.ts` + tela)

### 1. Padronizar chaves de suprimento
Definir a lista canônica de `toner` usada por impressoras, alinhada 1-a-1 com nomes que existem em `estoque[]`:

```
Epson T544 Preto, Epson T664 Preto,
Brother TN1060, Brother TN2370, Brother TN3472, Brother TN3492, Brother TN3662XLS,
HP CB435A, HP 17A, HP 78A, HP 83A, HP 85A, HP 258X, HP 410A Preto,
Samsung D101, Samsung D104S, Samsung D111L, Samsung D203U, Samsung D208L, Samsung D201L, Samsung D205L,
Pantum PB211EV, Pantum TL411X,
Lexmark 56F0Z00, Ricoh SP3710X, Kit Plotter T3170
```

### 2. Reescrever `impressoras[]` com o toner correto por modelo
Regras aplicadas a todas as 232 linhas:

- Epson L3110/L3150/L3160/L3210/L3250/L5190/L5290/L5590/L3560 → **T544 Preto**
- Epson L110/L120/L200/L210/L220/L355/L365/L375/L380/L395/L396/L455/L475/L555/L565/L575/L1300 → **T664 Preto**
- Brother HL/DCP-1222, 1602, 1600 → **TN1060**
- Brother 2540, 2340 → **TN2370**
- Brother 5652DN, 6700, L5652 → **TN3472**
- Brother 6902W, 6912DW → **TN3492**
- HP 1102/1212 → **HP 85A**; HP M127 → **HP 83A**; HP M102W → **HP 17A**; HP P1005 → **HP CB435A**; HP 1606 → **HP 78A**; HP M277/M452 → **HP 410A**; HP 428 → **HP 258X**
- Samsung/HP ML-2165 → **D101**; M2020/1865 → **D104S** ou **D111L** conforme modelo real; M4070/4080 → **D203U** (D201L apenas onde já correto); SCX-5835/SLM-4070 → **D208L**
- Pantum P2500 → **PB211EV**; Pantum P3305 → **TL411X**
- Plotter SC-T3170 → **Kit Plotter T3170**

Linhas com modelo "—" (Prático/Transporte) permanecem com o toner atual (não temos dado do modelo real).

### 3. Recalcular `estoqueAtual` a partir do estoque real
Substituir o objeto hoje preenchido à mão por um mapa derivado de `estoque[]`: para cada chave canônica, somar `quantidade` das linhas de estoque cujo `suprimento` casa (com um dicionário de aliases, ex.: `"TINTA PRETA EPSON 544"` + `"KIT COMPLETO DE TINTA EPSON 544"` → `Epson T544 Preto`; `"TONER BROTHER BROTHER 3492S"` + `"LASER TONER EVOLUT 3492"` → `Brother TN3492`; etc.).

O cálculo fica declarativo no próprio arquivo:

```ts
const ALIASES: Record<string, string[]> = {
  "Epson T544 Preto": ["TINTA PRETA EPSON 544", "KIT COMPLETO DE TINTA EPSON 544"],
  "Epson T664 Preto": ["TINTA PRETA EPSON 664", "KIT CONPLETO DE TINTA EPSON 644", "KIT TINTA PRETA 2UNI EPSON 644"],
  "Brother TN3492": ["TONER BROTHER BROTHER 3492S", ...],
  // ...
};
export const estoqueAtual = Object.fromEntries(
  Object.entries(ALIASES).map(([k, names]) => [
    k,
    estoque
      .filter(e => names.some(n => e.suprimento.toUpperCase().includes(n.toUpperCase())))
      .reduce((s, e) => s + e.quantidade, 0),
  ])
);
```

Assim `Qtd Estoque` sempre reflete `estoque[]` — nunca mais fica dessincronizado.

### 4. Validação
- Rodar `bunx tsgo` para confirmar tipos.
- Abrir `/impressoras` via Playwright, capturar screenshot e conferir:
  - L5290 mostra "Epson T544 Preto" com a quantidade real somada;
  - HL-1222 mostra "Brother TN1060";
  - HP M452 mostra "HP 410A";
  - contadores do topo (Com estoque / Baixo / Sem estoque) recalculam a partir do novo `estoqueAtual`.

## Arquivos alterados
- `src/lib/data.ts` — reescreve `estoqueAtual` (agora derivado) e revisa o campo `toner` de todas as impressoras.

Nenhuma mudança em `src/routes/impressoras.tsx` (a lógica de status/leitura já é correta — o bug está nos dados).