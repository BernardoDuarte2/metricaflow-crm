# MetricaFlow CRM - Instruções de Desenvolvimento

## 📋 Visão Geral do Projeto
 
MetricaFlow CRM é uma plataforma SaaS moderna para gestão de vendas com design **Futurista Premium**. O projeto utiliza React + TypeScript + Vite com TailwindCSS e Shadcn/UI para criar uma experiência premium e moderna.

---

## 🎨 Sistema de Design

### **Tema: Futurista Premium**

O design system é baseado em uma estética cyber premium com foco em alta performance visual.

#### **Paleta de Cores (HSL)**

Todas as cores DEVEM ser definidas em formato HSL no arquivo `src/index.css`.

**Light Mode:**

- **Primary (Electric Blue)**: `229 92% 62%` - #5D7BFF
- **Accent (Lilac)**: `270 70% 68%` - #A78BFA
- **Background**: `220 40% 98%`
- **Foreground**: `221 50% 12%`
- **Card**: `0 0% 100%`
- **Border**: `220 30% 90%`
- **Muted**: `220 30% 94%`
- **Success**: `142 70% 45%`
- **Warning**: `38 90% 50%`
- **Destructive**: `0 75% 55%`

**Dark Mode:**

- **Primary**: `229 92% 62%`
- **Accent**: `270 70% 68%`
- **Background**: `221 44% 9%`
- **Foreground**: `220 30% 96%`
- **Card**: `221 42% 12%`
- **Border**: `221 35% 22%`
- **Muted**: `221 35% 16%`

**Gradientes Padrão:**

```css
--gradient-primary: linear-gradient(135deg, hsl(229 92% 62%), hsl(270 70% 68%));
--gradient-success: linear-gradient(
  135deg,
  hsl(142 70% 50%),
  hsl(158 100% 65%)
);
```

#### **Cores do Cockpit Design System**

Variáveis específicas para componentes de dashboard:

- `--cockpit-accent`: `229 92% 62%`
- `--cockpit-success`: `142 70% 45%`
- `--cockpit-danger`: `0 75% 55%`
- `--cockpit-warning`: `38 90% 50%`
- `--cockpit-glow`: `229 92% 62%`

---

## 🔤 Tipografia

### **Fontes**

```css
--font-sans: "Inter", "Poppins", sans-serif;
```

**Família de Fontes:**

- **Principal**: `Inter` (sans-serif)
- **Alternativa**: `Poppins`
- **Jakarta**: `Plus Jakarta Sans` (para headings especiais)

**Importação:**

```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap");
```

### **Pesos de Fonte**

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### **Hierarquia Tipográfica**

- Headings (`h1-h6`): `font-weight: 600`, `letter-spacing: -0.02em`
- Body text: `font-weight: 400`, `letter-spacing: 0.015em`
- Buttons: `font-weight: 600` (primary), `500` (secondary/outline)

---

## 🧩 Componentes UI

### **Estrutura de Componentes**

Todos os componentes UI seguem o padrão Shadcn/UI com customizações para o tema Futurista.

**Localização:** `src/components/ui/`

**Aliases de Importação:**

```typescript
"@/components"; // Componentes gerais
"@/components/ui"; // Componentes UI base
"@/lib"; // Utilitários
"@/hooks"; // Custom hooks
```

### **Button Component**

**Variantes:**

```typescript
variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
size: "default" | "sm" | "lg" | "icon";
```

**Estilos Futurista:**

- **Default**: Gradiente `linear-gradient(135deg, hsl(229 92% 62%), hsl(270 70% 68%))`
- **Outline**: Border `1.5px solid hsl(229 92% 62% / 0.4)` com hover glow
- Box-shadow com glow effect
- `data-variant` attribute para customização específica

**Exemplo:**

```tsx
<Button
  variant="default"
  size="lg"
  className="bg-gradient-to-r from-primary to-accent"
>
  Começar Grátis
</Button>
```

### **Card Component**

**Estrutura:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

**Estilos Futurista:**

- Border radius: `1rem`
- Box-shadow com glow: `0 4px 16px rgba(31, 38, 135, 0.1), 0 0 15px hsl(229 92% 62% / 0.08)`
- Hover: Aumenta border-color e shadow intensity

### **Badge Component**

**Estilos Futurista:**

- Background: `linear-gradient(135deg, hsl(229 92% 62% / 0.15), hsl(270 70% 68% / 0.15))`
- Color: `hsl(229 92% 48%)`
- Border: `1px solid hsl(229 92% 62% / 0.3)`
- Font-weight: `500`

---

## 🎬 Animações

### **Framer Motion**

Biblioteca principal para animações: `framer-motion`

**Padrões de Animação:**

**Entrada (Fade In + Slide Up):**

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
>
  {/* Conteúdo */}
</motion.div>
```

**Sequências com Delays:**

- Primeiro elemento: `delay: 0`
- Segundo elemento: `delay: 0.1`
- Terceiro elemento: `delay: 0.2`
- E assim por diante (incremento de 0.1s)

### **CSS Keyframes**

**Glow Pulse:**

```css
@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 20px hsl(229 92% 62% / 0.4), 0 0 40px hsl(229 92% 62% / 0.2);
  }
  50% {
    box-shadow: 0 0 30px hsl(229 92% 62% / 0.6), 0 0 60px hsl(229 92% 62% / 0.3);
  }
}
```

**Shimmer Effect:**

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
```

**Gradient Shift:**

```css
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

**Float Animation:**

```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### **Animações do Tailwind**

Configuração em `tailwind.config.ts`:

```typescript
keyframes: {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" }
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" }
  }
}
```

---

## 🎯 Utility Classes

### **Classes Premium do Tema Futurista**

**Glassmorphism:**

```css
.glassmorphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glassmorphism-dark {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Glow Border:**

```css
.glow-border/* Aplicar em elemento */
.glow-border: hover;
.glow-border/* Ativa glow com pulse animation */;
```

**Gradient Backgrounds:**

```css
.gradient-bg-animated /* Background animado com gradient-shift */
/* Background animado com gradient-shift */
.text-gradient; /* Texto com gradiente usando background-clip */
```

**Cyber Effects:**

```css
.cyber-glow /* Glow suave */
/* Glow suave */
.cyber-glow-intense /* Glow intenso com inset shadow */
.cyber-line-vertical; /* Linha vertical com gradient */
```

**Premium Card:**

```css
.premium-card/* Card com glassmorphism e shadows */
.premium-card: hover;
.premium-card/* Aumenta glow no hover */;
```

**Futurista Button:**

```css
.futurista-button/* Button com gradiente e shimmer effect */
.futurista-button: hover;
.futurista-button/* Ativa shimmer animation */;
```

---

## 📐 Espaçamento e Layout

### **Border Radius**

```css
--radius: 0.75rem; /* 12px */
```

**Variações:**

- `lg`: `var(--radius)` = 0.75rem
- `md`: `calc(var(--radius) - 2px)` = 0.625rem
- `sm`: `calc(var(--radius) - 4px)` = 0.5rem

### **Container**

```typescript
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px"
  }
}
```

### **Grid Background**

O tema Futurista utiliza grid background:

```css
body.theme-futurista {
  background-image: linear-gradient(
      hsl(var(--border) / 0.4) 1px,
      transparent 1px
    ), linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size);
}
```

**Radial Gradients (overlays):**

```css
body.theme-futurista::before {
  background: radial-gradient(
      circle at 50% 0%,
      hsl(229 92% 62% / 0.06) 0%,
      transparent 50%
    ), radial-gradient(circle at 0% 50%, hsl(270 70% 68% / 0.04) 0%, transparent
        50%);
}
```

---

## 🔧 Bibliotecas e Dependências Principais

### **Core**

- **React**: `^18.3.1`
- **TypeScript**: `^5.8.3`
- **Vite**: `^5.4.19`

### **UI Libraries**

- **Radix UI**: Componentes primitivos (dialog, dropdown, select, etc.)
- **Shadcn/UI**: Sistema de componentes
- **Lucide React**: `^0.462.0` - Ícones
- **Framer Motion**: `^12.23.24` - Animações
- **Tailwind CSS**: `^3.4.17`
- **tailwindcss-animate**: `^1.0.7`

### **Utilities**

- **clsx**: `^2.1.1` - Condicionais de classes
- **tailwind-merge**: `^2.6.0` - Merge de classes Tailwind
- **class-variance-authority**: `^0.7.1` - Variantes de componentes
- **date-fns**: `^4.1.0` - Manipulação de datas
- **zod**: `^3.25.76` - Validação de schemas

### **State & Data**

- **@tanstack/react-query**: `^5.83.0` - Gerenciamento de estado servidor
- **@supabase/supabase-js**: `^2.58.0` - Backend e database
- **react-hook-form**: `^7.61.1` - Formulários
- **@hookform/resolvers**: `^3.10.0` - Resolvers para formulários

### **Visualização**

- **Recharts**: `^2.15.4` - Gráficos e charts
- **Leaflet**: `^1.9.4` - Mapas
- **react-leaflet**: `^5.0.0`

### **UI Enhancements**

- **Sonner**: `^1.7.4` - Toasts/notificações
- **canvas-confetti**: `^1.9.4` - Celebrações
- **vaul**: `^0.9.9` - Drawer component
- **cmdk**: `^1.1.1` - Command palette

### **Drag & Drop**

- **@dnd-kit/core**: `^6.3.1`
- **@dnd-kit/sortable**: `^10.0.0`

### **Export**

- **html2canvas**: `^1.4.1` - Screenshots
- **jspdf**: `^3.0.3` - Geração de PDFs

---

## 🏗️ Estrutura de Pastas

```
src/
├── components/
│   ├── ui/              # Componentes base Shadcn/UI
│   ├── admin/           # Componentes administrativos
│   ├── agenda/          # Agenda e calendário
│   ├── company/         # Gestão de empresas
│   ├── dashboard/       # Dashboard components
│   ├── gamification/    # Sistema de gamificação
│   ├── kpi/             # Indicadores de performance
│   ├── layout/          # Layout e navegação
│   ├── leads/           # Gestão de leads
│   ├── onboarding/      # Onboarding de usuários
│   ├── pricing/         # Planos e preços
│   ├── profile/         # Perfil de usuário
│   ├── prospecting/     # Prospecção automática com IA
│   ├── sales/           # Vendas e propostas
│   ├── settings/        # Configurações
│   ├── support/         # Suporte
│   ├── tasks/           # Tarefas
│   └── whatsapp/        # Integração WhatsApp
├── hooks/               # Custom React hooks
├── integrations/
│   └── supabase/        # Cliente Supabase
├── lib/                 # Utilitários e helpers
│   ├── confetti-animations.ts
│   ├── gamification.ts
│   ├── schemas.ts
│   ├── themes.ts
│   ├── utils.ts
│   └── validation.ts
├── pages/               # Páginas da aplicação
├── App.tsx
├── index.css            # Estilos globais e design system
└── main.tsx
```

---

## 💻 Padrões de Código

### **Importações**

Sempre use path aliases:

```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
```

### **Componentes**

**Estrutura padrão:**

```tsx
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface MyComponentProps extends ComponentProps<"div"> {
  title: string;
  description?: string;
}

export const MyComponent = ({
  title,
  description,
  className,
  ...props
}: MyComponentProps) => {
  return (
    <div className={cn("base-classes", className)} {...props}>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
};
```

### **Utility Function - cn()**

Sempre use `cn()` para combinar classes CSS:

```typescript
import { cn } from "@/lib/utils";

<div
  className={cn(
    "base-class",
    condition && "conditional-class",
    className // Props className
  )}
/>;
```

### **Formulários**

Use `react-hook-form` + `zod`:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    email: "",
    name: "",
  },
});
```

### **Toasts**

Use `sonner` para notificações:

```typescript
import { toast } from "sonner";

toast.success("Operação realizada com sucesso!");
toast.error("Erro ao processar solicitação");
toast.info("Informação importante");
toast.warning("Atenção necessária");
```

### **Animations**

Padrão para animações de entrada:

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Conteúdo */}
</motion.div>;
```

Para listas com stagger:

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
>
  {items.map((item) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 🎨 Convenções de Estilo

### **Nomenclatura de Classes**

- Use kebab-case para classes customizadas
- Use PascalCase para componentes React
- Use camelCase para variáveis e funções

### **Cores**

❌ **NUNCA USE:**

- Hex colors (`#5D7BFF`)
- RGB colors (`rgb(93, 123, 255)`)

✅ **SEMPRE USE:**

- HSL com CSS variables: `hsl(var(--primary))`
- HSL direto: `hsl(229 92% 62%)`
- Com opacidade: `hsl(229 92% 62% / 0.5)`

### **Responsividade**

Use breakpoints do Tailwind:

```tsx
<div className="
  px-4 sm:px-6 lg:px-8
  text-base sm:text-lg lg:text-xl
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
```

Breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1400px (customizado)

---

## 🎮 Gamificação

### **Sistema de Celebrações**

Arquivo: `src/lib/confetti-animations.ts`

**Tipos de Celebração:**

```typescript
type CelebrationType = "small" | "medium" | "large" | "mega";
```

**Uso:**

```typescript
import { triggerConfetti, getCelebrationType } from "@/lib/confetti-animations";

const saleValue = 75000;
const celebrationType = getCelebrationType(saleValue);
triggerConfetti(celebrationType);
```

**Regras:**

- `saleValue >= 100000`: `mega` - "🔥 VENDA ÉPICA! MEGA FECHAMENTO! 🔥"
- `saleValue >= 50000`: `large` - "💎 EXCELENTE VENDA! HIGH TICKET! 💎"
- `saleValue >= 10000`: `medium` - "⭐ ÓTIMA VENDA! PARABÉNS! ⭐"
- `saleValue < 10000`: `small` - "🎉 VENDA FECHADA! 🎉"

---

## 📊 Charts

### **Recharts**

Cores dos gráficos:

```css
--chart-1: 229 92% 62%; /* Primary */
--chart-2: 270 70% 68%; /* Accent */
--chart-3: 142 70% 45%; /* Success */
--chart-4: 38 90% 50%; /* Warning */
--chart-5: 217 85% 68%; /* Secondary */
--chart-6: 221 20% 40%; /* Muted */
```

**Uso:**

```tsx
<AreaChart data={data}>
  <Area
    dataKey="value"
    fill="hsl(var(--chart-1))"
    stroke="hsl(var(--chart-1))"
  />
</AreaChart>
```

---

## 🔐 Ambiente e Configuração

### **TypeScript**

Configuração (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": false,
    "strictNullChecks": false
  }
}
```

### **Vite**

Server config:

```typescript
server: {
  host: "::",
  port: 8080
}
```

### **ESLint**

Use as configurações padrão do projeto. Não desabilite regras sem necessidade.

---

## 🎯 Boas Práticas

### **Performance**

1. Use `React.memo()` para componentes que renderizam listas grandes
2. Use `useMemo()` e `useCallback()` para cálculos pesados
3. Lazy load páginas com `React.lazy()`:

```tsx
const Dashboard = lazy(() => import("@/pages/Dashboard"));
```

### **Acessibilidade**

1. Sempre use labels em formulários
2. Use atributos ARIA quando necessário
3. Garanta contraste adequado de cores
4. Teste navegação por teclado

### **SEO**

1. Use tags semânticas (`<header>`, `<nav>`, `<main>`, `<footer>`)
2. Defina `title` e `description` em meta tags
3. Use headings hierárquicos (`h1` → `h2` → `h3`)

### **Segurança**

1. NUNCA commitar `.env` (já está no `.gitignore`)
2. Validar inputs com Zod
3. Sanitizar dados antes de renderizar
4. Use HTTPS em produção

---

## 🚀 Comandos de Desenvolvimento

```bash
# Desenvolvimento
npm run dev          # ou: yarn dev / bun dev
# Build
npm run build        # Build para produção
npm run build:dev    # Build em modo desenvolvimento
# Preview
npm run preview      # Preview da build
# Lint
npm run lint         # Verificar código
```

---

## 📝 Commits

### **Conventional Commits**

Use o padrão:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types:**

- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, missing semi colons, etc
- `refactor`: Refatoração de código
- `test`: Adição de testes
- `chore`: Manutenção

**Exemplos:**

```
feat(leads): adicionar filtro por data
fix(dashboard): corrigir cálculo de KPIs
docs(readme): atualizar instruções de instalação
style(button): ajustar espaçamento do componente
refactor(api): simplificar chamadas ao Supabase
```

---

## 🎨 Design Principles

### **1. Consistência**

Mantenha consistência visual em todos os componentes usando o design system definido.

### **2. Hierarquia Visual**

Use tamanhos, pesos e cores para estabelecer hierarquia clara de informações.

### **3. Feedback Visual**

Sempre forneça feedback para ações do usuário (loading states, success/error messages, hover states).

### **4. Progressive Disclosure**

Mostre informações progressivamente, não sobrecarregue o usuário.

### **5. Mobile First**

Desenvolva pensando primeiro em mobile, depois expanda para desktop.

---

## 🔄 State Management

### **React Query**

Para dados do servidor:

```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["leads"],
  queryFn: fetchLeads,
  staleTime: 5000,
});
```

### **Local State**

Use `useState` para estado local do componente.

### **Form State**

Use `react-hook-form` para formulários complexos.

---

## 📚 Recursos

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Framer Motion](https://www.framer.com/motion)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Supabase Docs](https://supabase.com/docs)

---

## ⚠️ Importantes

### **NUNCA:**

- ❌ Commitar `.env` ou secrets
- ❌ Usar cores em formato hex ou rgb
- ❌ Ignorar TypeScript errors
- ❌ Desabilitar ESLint rules sem justificativa
- ❌ Usar inline styles ao invés de Tailwind
- ❌ Criar componentes sem type safety

### **SEMPRE:**

- ✅ Usar HSL para cores
- ✅ Seguir o design system Futurista
- ✅ Validar formulários com Zod
- ✅ Usar path aliases (@/)
- ✅ Adicionar animações com Framer Motion
- ✅ Testar responsividade
- ✅ Documentar componentes complexos
- ✅ Usar a função `cn()` para classes condicionais

---

**Versão:** 1.0  
**Última Atualização:** Janeiro 2026  
**Maintainer:** MetricaFlow Team
