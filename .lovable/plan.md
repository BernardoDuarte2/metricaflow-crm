
# Item 1: Identificacao do Usuario no Topo Direito

## Situacao Atual

O layout usa o componente `Sidebar.tsx` como barra de navegacao fixa no topo (nao e uma sidebar lateral). No lado direito, existe apenas um botao "Sair". Nao ha nenhuma identificacao visual de quem esta logado, qual empresa, ou qual funcao.

O componente `Header.tsx` existe no codigo mas NAO e usado no layout principal (`ProtectedRoute.tsx`).

## O que sera feito

Substituir o botao "Sair" simples no canto direito do `Sidebar.tsx` por um **avatar clicavel com dropdown** contendo:

- **Avatar** com foto do usuario (ou iniciais como fallback)
- **Dropdown ao clicar** com:
  - Nome completo do usuario
  - Nome da empresa
  - Funcao (Gestor Owner / Gestor / Vendedor)
  - Versao do sistema (ex: v1.0.0)
  - Separador visual
  - Botao "Sair do sistema"

## Detalhes Tecnicos

### Dados ja disponiveis (sem queries adicionais)

O hook `useUserSession()` ja carrega tudo que precisamos:
- `profile.name` - nome do usuario
- `profile.avatar_url` - foto do avatar
- `profile.companies.theme` - tema (ja carregado)
- `sessionData.role` - funcao (gestor_owner, gestor, vendedor)

Porem, o nome da empresa NAO esta sendo carregado. O `useUserSession` faz `companies(id, theme)` -- falta o campo `name`.

### Arquivos que serao alterados

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useUserSession.ts` | Adicionar campo `name` no select de `companies` (de `companies(id, theme)` para `companies(id, theme, name)`) |
| `src/components/layout/Sidebar.tsx` | Substituir o botao "Sair" por Avatar + DropdownMenu com as informacoes do usuario |

### O que NAO sera alterado

- Nenhuma tabela do banco de dados
- Nenhuma outra pagina ou componente
- Nenhuma rota
- O componente `Header.tsx` permanece inalterado (embora nao esteja em uso)

### Componentes UI utilizados (ja existem no projeto)

- `Avatar`, `AvatarImage`, `AvatarFallback` (de `@/components/ui/avatar`)
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator` (de `@/components/ui/dropdown-menu`)

### Mapeamento de funcoes para exibicao

```text
gestor_owner -> "Gestor (Proprietario)"
gestor       -> "Gestor"
vendedor     -> "Vendedor"
```

### Versao do sistema

Sera definida como constante no componente: `const APP_VERSION = "v1.0.0"`. Pode ser atualizada manualmente quando necessario.
