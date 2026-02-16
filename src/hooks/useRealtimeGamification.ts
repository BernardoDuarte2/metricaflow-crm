import { useState, useEffect } from 'react';

/**
 * Hook de compatibilidade para useRealtimeGamification.
 * A funcionalidade realtime foi movida para src/providers/RealtimeProvider.tsx
 * Mantido apenas para evitar quebras em imports existentes.
 */
export function useRealtimeGamification() {
  // Retorna uma data fixa ou atualizada periodicamente se necessário,
  // mas sem abrir conexão WebSocket duplicada.
  const [lastUpdate] = useState<Date>(new Date());
  
  return { lastUpdate };
}
