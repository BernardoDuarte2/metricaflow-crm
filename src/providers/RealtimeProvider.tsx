import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * RealtimeProvider: Gerencia UMA ÚNICA conexão WebSocket para toda a aplicação.
 * Substitui múltiplos hooks dispersos que abriam várias conexões.
 */
export const RealtimeProvider = () => {
  const queryClient = useQueryClient();
  // Timer para debounce global de invalidações
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Função Debounced específica para Leads
  const invalidateLeads = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      logger.debug('🔄 Executando invalidação de queries de LEADS');

      // Listas
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['kanban-leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead-stats'] });

      // Dashboard (pode afetar funil)
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      // NÃO invalida gamification ou lead-detail específico (update otimista cuida do detalhe)
      // Apenas se for DELETE/INSERT que precisaria invalidar lista, que já fazemos acima.

    }, 1000);
  };

  useEffect(() => {
    logger.info('🔌 Inicializando RealtimeProvider Global');

    const channel = supabase
      .channel('app-global-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          logger.debug('⚡ Mudança detectada em LEADS:', payload.eventType);

          // Otimização: Atualização otimista para Lead Detail
          if (payload.eventType === 'UPDATE' && payload.new) {
            const newLead = payload.new;
            // Cast to any to avoid strict type checking on partial updates
            queryClient.setQueryData(['lead', newLead.id], (oldData: any) => {
              if (!oldData) return undefined;
              // Mescla dados novos mantendo relações carregadas (ex: profiles) se não vierem no payload
              return { ...oldData, ...newLead };
            });
          }

          invalidateLeads();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lead_observations' },
        (payload) => {
          logger.debug('⚡ Mudança detectada em OBSERVAÇÕES:', payload.eventType);
          // Observações afetam detalhes do lead e possivelmente ultima interação na lista
          queryClient.invalidateQueries({ queryKey: ['lead-notes'] });
          invalidateLeads();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          logger.debug('⚡ Mudança detectada em TAREFAS:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          queryClient.invalidateQueries({ queryKey: ['lead-tasks'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.info('✅ Conectado ao canal Realtime Global');
        }
      });

    return () => {
      logger.info('🔌 Desconectando RealtimeProvider Global');
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null; // Componente lógico, sem renderização visual
};
