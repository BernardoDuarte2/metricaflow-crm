

# Melhorar Exportação de Relatórios em PDF

## Problemas atuais

**Dashboard PDF**: Exporta apenas 5 linhas de texto simples (total leads, vendas, conversão, receita, ticket médio). Não inclui funil, fontes, perdas, ranking de equipe, metas, nem gráficos.

**Lead Detail PDF**: Exporta histórico de notas em texto puro sem formatação visual. Não inclui valores do negócio, tarefas vinculadas, nem linha do tempo visual.

## Solução proposta

### 1. Dashboard PDF — Relatório completo e bem formatado

Reescrever `handleExportPDF` em `src/pages/Dashboard.tsx` para incluir:

- **Cabeçalho**: Logo/nome da empresa, período filtrado, data de geração
- **KPIs principais**: Tabela formatada com Total Leads, Vendas, Conversão, Receita, Ticket Médio, Forecast
- **Funil de conversão**: Tabela com cada etapa, quantidade e taxa de conversão entre etapas
- **Fontes de leads**: Tabela com fonte, quantidade, conversões e taxa
- **Motivos de perda**: Tabela com motivo, quantidade e percentual
- **Ranking da equipe** (se gestor): Tabela com vendedor, leads, conversões, receita, ticket médio
- **Metas vs realizado**: Tabela com vendedor, meta, realizado, % atingido
- **Alertas ativos**: Lista de alertas críticos do período

Usar `jsPDF` com tabelas manuais (retângulos + texto) para layout profissional, sem depender de html2canvas (que gera imagens borradas).

### 2. Lead Detail PDF — Ficha completa do lead

Reescrever `handleExportPDF` em `src/pages/LeadDetail.tsx` para incluir:

- **Cabeçalho**: Nome do lead com badge de status colorido
- **Dados cadastrais**: Tabela com nome, empresa, email, telefone, origem, vendedor responsável
- **Dados comerciais**: Valor estimado, valores cadastrados (da tabela `lead_values`), probabilidade
- **Linha do tempo**: Notas formatadas com ícones de tipo, data, autor e conteúdo
- **Rodapé**: Data de criação, última atualização, empresa

### 3. Criar helper reutilizável

Novo arquivo `src/lib/pdf-helpers.ts` com funções utilitárias:

- `drawHeader(doc, title, subtitle)` — cabeçalho azul padronizado
- `drawTable(doc, headers, rows, y)` — renderiza tabela com cabeçalho colorido, linhas alternadas, retorna novo Y
- `drawSection(doc, title, y)` — título de seção com linha divisória
- `checkPageBreak(doc, y, needed)` — adiciona página se necessário
- `drawFooter(doc, companyName)` — rodapé com nome e número da página

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/lib/pdf-helpers.ts` | **Novo** — funções utilitárias de PDF |
| `src/pages/Dashboard.tsx` | Reescrever `handleExportPDF` com relatório completo |
| `src/pages/LeadDetail.tsx` | Reescrever `handleExportPDF` com ficha completa |

### Resultado esperado

- PDF do Dashboard: 2-4 páginas com todas as métricas, tabelas formatadas e visual profissional
- PDF do Lead: 1-2 páginas com ficha completa do lead incluindo valores e histórico
- Ambos com cabeçalho azul ORKA, tabelas com linhas alternadas, e rodapé com paginação

