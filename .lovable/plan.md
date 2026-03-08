

# Reformulação Visual ORKA — Design Limpo GitHub-Dark

A foto de referência mostra um design **flat, limpo e profissional** inspirado no GitHub Dark. O sistema atual tem excesso de efeitos visuais (glow, shimmer, gradient text, transform animations) que não existem na referência. A mudança é puramente visual — nenhuma lógica de negócio será alterada.

## Diferenças principais entre o atual e a referência

| Elemento | Atual | Referência (foto) |
|---|---|---|
| Valores nos cards | Gradient text multicolorido | Texto sólido champagne (#E8E2D6) |
| Títulos dos cards | Gradient text coral→accent | Texto sólido cinza (#8B949E) |
| Cards hover | Glow border + shimmer + gradient BG | Hover sutil, sem efeitos |
| Botões hover | Transform translateY + glow shadow | Cor de fundo escurece apenas |
| Badges | Todos forçados coral | Variam por contexto (verde, amarelo, etc) |
| Inputs/selects | bg-background (= #0D1117) | bg-card (#161B22) para melhor contraste |
| Nav bar | bg-card (#161B22) | bg-background (#0D1117) sem borda visível |
| Cards border | border-primary/20 (coral sutil) | border sólido #30363D |
| Progress bar | bg-secondary track | bg #30363D track |

## Arquivos a alterar

### 1. `src/index.css` — Limpar efeitos globais do tema

- **Remover** todo o bloco `body.theme-futurista button[class*="bg-primary"]` com `!important`, transform, glow
- **Remover** o bloco `body.theme-futurista button[class*="border"]` com `!important`
- **Remover** o bloco de badges que força coral em todos (`body.theme-futurista [class*="badge"]`)
- **Simplificar** card hover: apenas `border-color` sutil, sem glow-pulse
- **Manter** keyframes e utility classes (glassmorphism etc) pois podem ser usadas pontualmente
- Adicionar regra para inputs/textareas no dark usarem `bg-card` ao invés de `bg-background`

### 2. `src/components/dashboard/MetricCard.tsx` — Simplificar completamente

- Remover `glow-border`, `border-primary/20`
- Remover divs de gradient background e shimmer effect
- Trocar texto gradient (`bg-gradient-to-br from-foreground via-primary...`) por texto sólido `text-foreground`
- Simplificar ícone: remover blur, pulse, glow. Manter apenas o ícone com bg sutil
- Remover barra de progresso animada inferior
- Remover bottom accent line gradient

### 3. `src/components/layout/Sidebar.tsx` — Alinhar nav com referência

- Mudar `bg-card` para `bg-background` na nav
- Mudar `border-b border-border` para `border-b border-border/50` (mais sutil)
- Logo fallback: `from-primary to-red-600` (coral, sem purple)

### 4. `src/components/ui/button.tsx` — Ajuste de border-radius

- Mudar `rounded-md` base para `rounded-lg` (8px = o `--radius` de 0.75rem)
- Sem mudanças funcionais

### 5. `src/components/ui/input.tsx` e `src/components/ui/textarea.tsx`

- No dark mode, inputs devem usar bg mais claro que o body para contraste
- Adicionar CSS global: `.dark input, .dark textarea, .dark select { background-color: hsl(var(--card)); }`

### 6. `src/components/ui/progress.tsx`

- Track: `bg-[hsl(213,14%,21%)]` (= #30363D) ao invés de `bg-secondary`
- Fill: manter `bg-primary` (coral)

### 7. Dashboard chart cards — Remover gradient titles

Nos seguintes arquivos, trocar `bg-gradient-to-r from-X to-Y bg-clip-text text-transparent` por `text-foreground`:
- `src/components/dashboard/LeadsStatusChart.tsx`
- `src/components/dashboard/SalesPerformanceChart.tsx`
- `src/components/dashboard/SalesPerformanceDetailedChart.tsx`
- `src/components/dashboard/FinancialMetricsChart.tsx`

E remover a div `absolute inset-0 bg-gradient-to-br` de hover nesses mesmos arquivos.
Simplificar `className` dos Cards para `bg-card border-border`.

### 8. `src/components/dashboard/cockpit/GoalHeroCard.tsx`

- Remover o gradient accent line no top (`linear-gradient... hsl(270 70% 68%)`) — substituir por borda sólida coral
- Simplificar background glow

## Resumo de impacto

- **~12 arquivos** alterados
- **Apenas CSS e classes Tailwind** — nenhuma prop, estado, lógica ou query alterada
- **Resultado**: visual flat, limpo, profissional, idêntico à referência da Paleta A

