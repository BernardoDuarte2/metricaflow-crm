
# Barra de Rolagem Horizontal na Navegacao

## Problema
Quando a tela esta com zoom ou em resolucao menor, as abas de navegacao empurram o avatar para fora da tela, tornando impossivel ver a foto ou acessar o dropdown do usuario.

## Solucao
Tornar a area das abas de navegacao com scroll horizontal, mantendo o logo (esquerda) e o avatar (direita) sempre visiveis.

## Detalhes Tecnicos

### Arquivo alterado
`src/components/layout/Sidebar.tsx`

### Mudanca
A `div` que contem os links de navegacao (linha 122) recebera:
- `overflow-x-auto` para permitir scroll horizontal
- `scrollbar-thin` ou estilo customizado para uma barra de rolagem fina e discreta
- `flex-shrink` adequado para que o logo e o avatar nunca sejam comprimidos

Estrutura resultante:
```text
[Logo (fixo)] [===== Abas com scroll horizontal =====] [Avatar (fixo)]
```

### CSS adicional
Adicionar no `src/index.css` uma classe para estilizar a scrollbar da navegacao de forma discreta (fina, com cores do tema).

### O que NAO sera alterado
- Nenhuma outra pagina ou componente
- Nenhuma logica de navegacao
- Nenhuma tabela do banco
