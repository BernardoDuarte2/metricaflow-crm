

# Tema ORKA: Dark/Light Mode com Botao de Alternancia

## Resumo
Substituir a identidade visual atual "Futurista Premium" pelo tema ORKA, com modo noturno como padrao e um botao sol/lua no header para alternar. As cores serao baseadas na paleta fornecida (inspirada na Gene Digital). A mudanca e segura pois o sistema de variaveis CSS ja existe -- estamos apenas trocando os valores.

## Arquivos a alterar

### 1. `src/index.css` - Paleta ORKA
Substituir todos os valores das variaveis CSS em `:root` (light) e `.dark` (dark) pelos valores ORKA:

**Modo Diurno (`:root`)**
- `--background`: branco `#FFFFFF` -> `0 0% 100%`
- `--foreground`: `#1E293B` -> `215 28% 17%`
- `--card`: `#F8FAFC` -> `210 40% 98%`
- `--primary`: `#0057FF` -> `220 100% 50%`
- `--border`: `#E2E8F0` -> `214 32% 91%`
- `--muted`: `#F8FAFC` -> `210 40% 98%`
- `--muted-foreground`: `#64748B` -> `215 16% 47%`
- Gradientes: `#0057FF` -> `#003599`
- Remover/suavizar efeitos de glow no modo light

**Modo Noturno (`.dark`) - PADRAO**
- `--background`: `#08090B` -> `220 16% 4%`
- `--foreground`: `#FFFFFF` -> `0 0% 100%`
- `--card`: `#111317` -> `220 14% 8%`
- `--primary`: `#0057FF` -> `220 100% 50%`
- `--border`: `#1E293B` -> `217 33% 17%`
- `--muted-foreground`: `#94A3B8` -> `215 20% 65%`
- Gradientes: `#0057FF` -> `#003599`
- Manter efeitos de glow azul sutis

Atualizar tambem: sidebar, cockpit, chart colors, e utility classes para usar azul puro (sem purple/lilac).

Remover referencias a `hsl(270 70% 68%)` (lilac) em todo o arquivo -- substituir por tons de azul.

Atualizar `body.theme-futurista` para remover gradientes purple nos botoes e badges.

### 2. `src/lib/themes.ts` - Valores ORKA
Atualizar os valores de cores light e dark do tema `futurista` para corresponder a paleta ORKA.

### 3. `src/hooks/useTheme.ts` - Suporte a Dark Mode Toggle
- Adicionar funcao `toggleDarkMode()` que alterna a classe `dark` no `<html>`
- Persistir preferencia em `localStorage` (chave `color-mode`)
- Inicializar como dark por padrao
- Exportar `isDark` e `toggleDarkMode`

### 4. `src/components/layout/Sidebar.tsx` - Botao Sol/Lua
Adicionar um botao de toggle antes do avatar dropdown:
- Icone `Sun` quando em dark mode (clica para ir ao light)
- Icone `Moon` quando em light mode (clica para ir ao dark)
- Estilo sutil, ghost button, tamanho icon

### 5. `src/pages/ProtectedRoute.tsx` - Inicializar dark mode
Garantir que o dark mode e aplicado no mount (classe `dark` no `<html>` baseado no localStorage).

### 6. `src/components/ui/sonner.tsx` - Manter compativel
Ja usa `next-themes` mas apenas para ler o tema. Verificar compatibilidade.

## O que NAO muda
- Estrutura de componentes (cards, buttons, tables)
- Logica de negocios (dashboard, leads, kanban)
- Layout do sidebar (continua horizontal no topo)
- Funcionalidade de nenhuma feature

## Detalhes tecnicos

### Conversao de cores hex -> HSL
| Hex | HSL |
|---|---|
| `#08090B` | `220 16% 4%` |
| `#111317` | `220 14% 8%` |
| `#0057FF` | `220 100% 50%` |
| `#003599` | `220 100% 30%` |
| `#1E293B` | `217 33% 17%` |
| `#94A3B8` | `215 20% 65%` |
| `#F8FAFC` | `210 40% 98%` |
| `#E2E8F0` | `214 32% 91%` |
| `#64748B` | `215 16% 47%` |
| `#1E293B` (text) | `215 28% 17%` |

### Inicializacao do dark mode
```text
// No mount da app, antes do render:
const savedMode = localStorage.getItem('color-mode');
if (!savedMode || savedMode === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
```

### Botao no header
```text
// No Sidebar.tsx, antes do DropdownMenu:
<Button variant="ghost" size="icon" onClick={toggleDarkMode}>
  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
</Button>
```

### Efeitos de glow
- Modo noturno: `box-shadow: 0 0 15px rgba(0, 87, 255, 0.3)` no hover de botoes primarios
- Modo diurno: sem glow, apenas `box-shadow` padrao sutil

## Risco
Baixo. Estamos apenas trocando valores de variaveis CSS que ja sao consumidas por todos os componentes. O toggle usa a classe `dark` que o Tailwind ja suporta (`darkMode: ["class"]`).
