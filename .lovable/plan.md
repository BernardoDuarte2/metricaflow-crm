

# Sidebar Expandível com Azul Marinho + Laranja Elétrico

## Conceito Visual
Sidebar azul marinho escuro (`#0A1628`) com icones brancos. Ao passar o mouse, expande de `w-16` para `w-56` revelando os labels. O item ativo usa laranja elétrico (`#FF6B00`) como indicador lateral (barra de 3px na esquerda) e texto laranja, enquanto o fundo permanece azul marinho. As duas cores trabalham juntas sem se misturar: azul marinho = estrutura/fundo, laranja elétrico = ação/destaque.

## Mudanças

### 1. Sidebar.tsx — Reescrever visual e comportamento

- **Hover expand**: Estado `isHovered` via `onMouseEnter`/`onMouseLeave` no `<nav>`. Largura transiciona de `w-16` para `w-56` com `transition-all duration-300`.
- **Background**: `bg-[#0A1628]` (azul marinho profundo).
- **Borda direita**: `border-r border-[#FF6B00]/30` (toque sutil de laranja na borda).
- **Icones**: Todos `text-white/70`, hover `text-white`.
- **Item ativo**: Barra laranja `border-l-3 border-[#FF6B00]` + `text-[#FF6B00]` + `bg-white/5`. Sem gradiente.
- **Labels**: Aparecem com `opacity` e `translate` quando expandido, hidden quando colapsado.
- **Logo fallback**: Fundo `bg-[#FF6B00]` com texto branco.
- **Separador**: `bg-white/10` ao invés de azul.
- **Avatar fallback**: `bg-[#FF6B00]` com texto branco.
- **Seção inferior**: Borda `border-white/10`.

### 2. ProtectedRoute.tsx — Ajustar padding dinâmico

- O `pl-16` precisa acompanhar a expansão. Como a sidebar é fixa e sobrepõe (não empurra conteúdo), o `pl-16` pode ficar fixo e a sidebar expande por cima do conteúdo (overlay style). Sem mudança necessária.

### Paleta em uso
| Elemento | Cor |
|---|---|
| Fundo sidebar | `#0A1628` (azul marinho) |
| Icones default | `white/70` |
| Icones hover | `white` |
| Item ativo - indicador | `#FF6B00` (laranja elétrico) |
| Item ativo - texto | `#FF6B00` |
| Item ativo - fundo | `white/5` |
| Borda direita | `#FF6B00/30` |
| Separadores | `white/10` |
| Logo/Avatar fallback | `#FF6B00` bg, white text |

