import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

// Initialize dark mode before render to prevent flash
const savedMode = localStorage.getItem('color-mode');
if (!savedMode || savedMode === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Configuração otimizada do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 minutos padrão
      gcTime: 5 * 60 * 1000, // Cache de 5 minutos
      refetchOnWindowFocus: false, // Não refetch ao focar
      refetchOnReconnect: true, // Refetch ao reconectar
      retry: 1, // Apenas 1 retry
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
);
