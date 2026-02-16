/**
 * Hook de compatibilidade para useRealtimeLeads.
 * A funcionalidade foi movida para src/providers/RealtimeProvider.tsx
 * Mantido apenas para evitar quebras em imports existentes.
 */
export function useRealtimeLeads(specificQueryKey?: any[]) {
  // No-op: A lógica realtime agora é centralizada no RealtimeProvider
}
