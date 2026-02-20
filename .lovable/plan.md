

# Corrigir Drop no Kanban - Permitir Soltar em Qualquer Posicao da Coluna

## Problema
Quando uma coluna do Kanban tem muitos leads, o usuario precisa rolar ate o final da coluna para conseguir soltar o card. Isso acontece porque a area de drop (`droppable`) cresce junto com o conteudo, forcando o usuario a ir ate o fim.

## Solucao
Limitar a altura das colunas com scroll interno (`max-height` + `overflow-y: auto`). Assim, a area de drop fica sempre visivel na tela e o usuario pode soltar o card em qualquer ponto da coluna sem precisar rolar a pagina inteira.

## Detalhes Tecnicos

### Arquivo alterado
`src/components/leads/KanbanColumn.tsx`

### Mudanca
Na `div` que recebe o `ref={setNodeRef}` (linha 74-81):
- Adicionar `max-h-[70vh]` para limitar a altura da coluna
- Adicionar `overflow-y-auto` para scroll interno dos cards
- Manter o `min-h-[400px]` existente

A area de drop passa a ter tamanho fixo na tela, entao o usuario consegue arrastar e soltar em qualquer parte visivel da coluna. Os cards que excedem a altura ficam acessiveis via scroll interno.

### O que NAO sera alterado
- Nenhuma logica de drag-and-drop
- Nenhuma rota ou banco de dados
- Nenhum outro componente

