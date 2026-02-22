
# Verificacao: Fechar lead no Kanban e nas notas computa no dashboard

## Resultado da analise

### 1. Fechar pelo Kanban (ClosedLeadDialog) -- Funciona parcialmente

- O status e atualizado para `"fechado"` e o dashboard reconhece esse status corretamente (`WON_STATUSES = ['ganho', 'fechado']`).
- Os valores do negocio (`lead_values`) sao exigidos antes de confirmar o fechamento, entao eles existem.
- O `buildWonQuery` filtra por `updated_at`, entao a venda aparece no periodo correto.
- **Problema encontrado**: O trigger de banco de dados `update_kpi_on_sale` so dispara quando o status muda para `'ganho'`, mas o Kanban seta `'fechado'`. Isso significa que a tabela `seller_kpi_monthly` (usada no painel de metas/KPIs) **nao e atualizada** quando se fecha pelo Kanban.

### 2. Fechar pela pagina de detalhe do lead (LeadDetail) -- Funciona parcialmente

- O usuario pode manualmente alterar o status para qualquer valor, incluindo `'fechado'` ou `'ganho'`.
- Se colocar como `'ganho'`, o trigger de KPI dispara. Se colocar como `'fechado'`, nao dispara (mesmo problema).
- Os graficos do dashboard funcionam para ambos os status.

### 3. Fechar pelas notas (TaskLeadNotesDrawer) -- NAO fecha o lead

- O drawer de notas apenas adiciona uma observacao e marca a tarefa como concluida.
- **Ele NAO altera o status do lead**. Entao, adicionar uma nota nunca vai fazer o lead aparecer como "fechado" no dashboard.

## Correcoes necessarias

### Correcao 1: Trigger `update_kpi_on_sale` deve aceitar `'fechado'`

Atualizar o trigger no banco de dados para tambem disparar quando o status mudar para `'fechado'`:

```text
ANTES:
  IF NEW.status = 'ganho' AND (OLD.status IS NULL OR OLD.status != 'ganho') THEN

DEPOIS:
  IF (NEW.status = 'ganho' OR NEW.status = 'fechado') 
     AND (OLD.status IS NULL OR (OLD.status != 'ganho' AND OLD.status != 'fechado')) THEN
```

Isso garante que os KPIs mensais do vendedor sejam atualizados independente de o status final ser `'ganho'` ou `'fechado'`.

### Correcao 2: Trigger `log_gamification_event` deve aceitar `'fechado'`

O mesmo problema existe na gamificacao. O trigger `log_gamification_event` so da pontos de `sale_closed` quando o status muda para `'ganho'`:

```text
ANTES:
  IF NEW.status = 'ganho' AND OLD.status != 'ganho' THEN

DEPOIS:
  IF (NEW.status IN ('ganho', 'fechado')) 
     AND (OLD.status NOT IN ('ganho', 'fechado')) THEN
```

### Sem alteracao no frontend

O `TaskLeadNotesDrawer` **nao precisa** fechar o lead -- esse nao e o proposito dele. Para fechar um lead, o caminho correto e pelo Kanban (drag & drop) ou pela edicao de status na pagina de detalhe.

## Resumo das alteracoes

| Arquivo/Local | Alteracao |
|---|---|
| Migration SQL (trigger `update_kpi_on_sale`) | Aceitar status `'fechado'` alem de `'ganho'` |
| Migration SQL (trigger `log_gamification_event`) | Aceitar status `'fechado'` alem de `'ganho'` |
| Frontend | Nenhuma alteracao necessaria |
