

# Mover Itens de Configuracao para o Dropdown do Avatar

## Problema
As abas de Usuarios, Integracoes, Configuracoes, Ajuda e Ao Vivo ficam misturadas com as abas principais do sistema (Dashboard, Leads, Kanban, etc.), poluindo a navegacao e ocupando espaco.

## Solucao
Mover esses itens para dentro do dropdown que abre ao clicar na foto/avatar do usuario, separando visualmente a navegacao principal das opcoes administrativas.

## O que muda

### Abas que PERMANECEM na barra de navegacao:
- Dashboard
- Leads
- Prospeccao
- Kanban
- Agenda
- Tarefas
- KPI
- Metas
- Administracao (super admin)

### Itens que VÃO para o dropdown do avatar:
- Usuarios (gestor/owner)
- Integracoes (gestor/owner)
- Ao Vivo (gestor/owner)
- Configuracoes (gestor/owner)
- Ajuda (todos)

### Estrutura do dropdown apos a mudanca:

```text
+--------------------------+
| Nome do Usuario          |
| Nome da Empresa          |
| Funcao (ex: Gestor)      |
+--------------------------+
| Usuarios        (icone)  |  <- apenas gestor/owner
| Integracoes      (icone) |  <- apenas gestor/owner
| Ao Vivo          (icone) |  <- apenas gestor/owner
| Configuracoes    (icone) |  <- apenas gestor/owner
+--------------------------+
| Ajuda            (icone) |  <- todos
+--------------------------+
| v1.0.0                   |
+--------------------------+
| Sair do sistema  (verm.) |
+--------------------------+
```

## Detalhes Tecnicos

### Arquivo alterado
`src/components/layout/Sidebar.tsx`

### Mudancas
1. Separar o array `allNavItems` em dois grupos:
   - `mainNavItems`: itens que ficam na barra horizontal (Dashboard ate Metas + Admin)
   - `dropdownNavItems`: itens que vao para o dropdown (Usuarios, Integracoes, Ao Vivo, Configuracoes, Ajuda)

2. Renderizar apenas `mainNavItems` na barra de navegacao horizontal

3. No `DropdownMenuContent`, adicionar os `dropdownNavItems` como `DropdownMenuItem` com seus icones, usando `useNavigate` para navegar ao clicar. Respeitar as mesmas regras de permissao (requiresOwnerOrGestor, requiresSuperAdmin)

4. Adicionar separadores visuais (`DropdownMenuSeparator`) entre os grupos

### O que NAO sera alterado
- Nenhuma tabela do banco de dados
- Nenhuma rota
- Nenhum outro componente
- As permissoes de acesso continuam identicas

