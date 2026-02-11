

## Conectar Alertas "Onde Estamos Perdendo Dinheiro" aos Leads Filtrados

### Problema
Os cards de alerta navegam para URLs como `/leads?status=proposta&stalled_days=14`, mas a pagina de Leads **ignora completamente os query params da URL**. Ela usa apenas `useState` local, sem ler `useSearchParams`. Resultado: ao clicar, abre a lista de leads sem nenhum filtro aplicado.

### Solucao

Modificar **apenas** `src/pages/Leads.tsx` para:

1. **Ler query params da URL** ao carregar a pagina (`useSearchParams`)
2. **Aplicar filtros automaticamente** baseados nos params
3. **Mostrar banner** indicando qual filtro esta ativo
4. **Permitir limpar** o filtro com um botao no banner

---

### Detalhes Tecnicos

#### Arquivo: `src/pages/Leads.tsx`

**A. Importar `useSearchParams`** de `react-router-dom` (ja importa `useNavigate`)

**B. Ler params no carregamento:**
```
const [searchParams, setSearchParams] = useSearchParams();
const urlStatus = searchParams.get('status');
const urlStalledDays = searchParams.get('stalled_days');
const urlNoContactDays = searchParams.get('no_contact_days');
const urlNoTasks = searchParams.get('no_tasks');
```

**C. Inicializar filtros a partir dos params:**
- Se `urlStatus` existe, setar `statusFilter` com esse valor
- Criar estado `urlFilterActive` para saber se veio do Dashboard

**D. Modificar a query de leads** para aplicar filtros adicionais:
- `stalled_days=14`: adicionar `.lte('updated_at', dataLimite)` onde dataLimite = now() - 14 dias
- `no_contact_days=3`: adicionar `.lte('updated_at', dataLimite)` onde dataLimite = now() - 3 dias (e filtrar leads ativos, sem status ganho/fechado/perdido)
- `no_tasks=true` com `status=qualificado`: filtrar leads qualificados e depois no frontend verificar quais nao tem tarefas futuras (ou fazer join com tasks)

**E. Exibir banner de filtro ativo:**
Um banner colorido no topo da lista com texto descritivo e botao "Limpar filtro". Exemplos:
- "Filtro aplicado: Propostas paradas ha +14 dias"
- "Filtro aplicado: Negociacoes paradas ha +10 dias"
- "Filtro aplicado: Leads sem contato ha +3 dias"
- "Filtro aplicado: SQL sem tarefa de follow-up"

**F. Limpar filtro:** Ao clicar "Limpar filtro", remover os search params da URL e resetar os estados de filtro.

---

### Mapeamento de Params para Filtros

| URL Param | Filtro SQL na Query |
|-----------|-------------------|
| `status=proposta&stalled_days=14` | `.eq('status', 'proposta').lte('updated_at', now - 14d)` |
| `status=negociacao&stalled_days=10` | `.eq('status', 'negociacao').lte('updated_at', now - 10d)` |
| `no_contact_days=3` | `.in('status', [ativos]).lte('updated_at', now - 3d)` |
| `status=qualificado&no_tasks=true` | `.eq('status', 'qualificado')` + sub-query sem tarefas futuras |

Para `no_tasks=true`, a abordagem mais simples: buscar leads qualificados e depois fazer uma query separada para verificar quais tem tarefas pendentes, filtrando no frontend. Alternativa: usar a logica que a edge function ja calcula.

### Arquivos Alterados

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Leads.tsx` | Adicionar leitura de URL params, filtros condicionais na query, banner de filtro ativo |

Nenhum outro arquivo sera alterado. O componente `MoneyLeakAlerts.tsx` ja navega corretamente com os params certos.
