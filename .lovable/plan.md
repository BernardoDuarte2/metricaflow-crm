

# Profissionalização Visual — Software Enterprise

O sistema precisa perder a cara de "produto de IA/startup gamificada" e ganhar aspecto de software enterprise sério. Duas frentes principais: **remover emojis** e **reduzir ruído visual** (animações desnecessárias, gradientes excessivos, efeitos chamativos).

## 1. Remover emojis de toda a UI visível

**Arquivos e mudanças:**

| Arquivo | Emojis a remover/substituir |
|---|---|
| `src/pages/Auth.tsx` | `✅` dos toasts, `❌` dos erros → texto limpo |
| `src/pages/Users.tsx` | `✅` dos toasts → texto limpo |
| `src/pages/Goals.tsx` | `🎉` de "Meta Atingida" → apenas "Meta Atingida" |
| `src/pages/Pricing.tsx` | `🎉` do banner → remover |
| `src/pages/ResetPassword.tsx` | `💡` da dica → remover |
| `src/pages/Diagnostics.tsx` | `✅` e `❌` dos toasts → texto limpo |
| `src/pages/Integrations.tsx` | `❌`, `✅`, `🔗` → texto limpo |
| `src/pages/Prospecting.tsx` | `🎯` do toast → texto limpo |
| `src/pages/ReportSettings.tsx` | `📊`, `📅` dos títulos → remover |
| `src/components/dashboard/GamificationPanel.tsx` | `🎮`, `🏆`, `⭐`, `🎯`, `📈`, `💬`, `🚀`, `📊` → remover dos títulos e badges (manter Lucide icons) |
| `src/components/dashboard/GoalsProgressCard.tsx` | `🎉` do "Parabéns" → remover |
| `src/components/dashboard/cockpit/ChartDrilldownDialog.tsx` | `🥇🥈🥉` → usar `#1`, `#2`, `#3` com styling |
| `src/components/gamification/AllBadgesDisplay.tsx` | Emojis como ícones de badge → substituir por Lucide icon names (Trophy, Target, Gem, etc.) |
| `src/components/gamification/SaleCelebration.tsx` | `🔥💎⭐` → substituir por Lucide icons |

**Nota:** Emojis em `console.log` (hooks, providers) ficam — não são visíveis ao usuário.

## 2. Reduzir animações excessivas

| Arquivo | Mudança |
|---|---|
| `src/components/dashboard/GamificationPanel.tsx` | Remover `animate-pulse` do Trophy icon |
| `src/components/dashboard/cockpit/CriticalAlertsPanel.tsx` | Remover `animate-pulse` e `animate-ping` decorativos (manter apenas 1 indicador) |
| `src/components/dashboard/cockpit/MoneyLeakAlerts.tsx` | Remover `animate-pulse` do header icon, remover `animate-ping` |
| `src/components/dashboard/cockpit/CommandKPI.tsx` | Remover `animate-pulse` do alert state, remover `hover:translate-y-[-2px]` |
| `src/pages/Auth.tsx` | Remover partículas flutuantes com `animate-pulse` (6+ divs decorativas) |

## 3. Simplificar gradientes excessivos nos cards do dashboard

| Arquivo | Mudança |
|---|---|
| `src/components/dashboard/ForecastCard.tsx` | `bg-gradient-to-br from-card to-card/50 border-primary/20` → `bg-card border-border` |
| `src/components/dashboard/GamificationPanel.tsx` | `bg-gradient-to-br from-primary/5 via-background` → `bg-card border-border` |
| `src/components/dashboard/cockpit/CommandKPI.tsx` | Remover glow shadows, simplificar corner gradient |
| `src/components/dashboard/cockpit/MoneyLeakAlerts.tsx` | `bg-gradient-to-r from-red-500/5` → `bg-card` |

## 4. Tipografia mais sóbria nos toasts

Todos os toasts perdem emojis e ganham títulos diretos:
- `"✅ Usuário criado!"` → `"Usuário criado"`
- `"❌ Erro na configuração"` → `"Erro na configuração"`
- `"🎯 Prospecção finalizada!"` → `"Prospecção finalizada"`

## Resumo

- **~15 arquivos** alterados
- **Apenas texto e classes CSS** — zero mudanças em lógica, queries, ou estrutura
- **Resultado**: UI limpa, profissional, sem emojis infantis, sem animações exageradas, aspecto de software enterprise

