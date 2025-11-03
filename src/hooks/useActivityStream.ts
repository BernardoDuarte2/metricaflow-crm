import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export interface ActivityEvent {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  event_type: string;
  points: number;
  created_at: string;
  metadata: any;
}

export function useActivityStream() {
  const [recentActivities, setRecentActivities] = useState<ActivityEvent[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Fetch initial activities
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('gamification_events')
        .select(`
          id,
          user_id,
          event_type,
          points,
          created_at,
          metadata,
          profiles!inner(name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        const activities: ActivityEvent[] = data.map((event: any) => ({
          id: event.id,
          user_id: event.user_id,
          user_name: event.profiles.name,
          user_avatar: event.profiles.avatar_url,
          event_type: event.event_type,
          points: event.points,
          created_at: event.created_at,
          metadata: event.metadata,
        }));
        setRecentActivities(activities);
      }
    };

    fetchActivities();

    // Subscribe to new activities
    const channel = supabase
      .channel('activity-stream')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gamification_events'
        },
        async (payload) => {
          console.log('📢 Nova atividade detectada:', payload);

          // Fetch user profile for the new event
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          if (profile) {
            const newActivity: ActivityEvent = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              user_name: profile.name,
              user_avatar: profile.avatar_url,
              event_type: payload.new.event_type,
              points: payload.new.points,
              created_at: payload.new.created_at,
              metadata: payload.new.metadata,
            };

            setRecentActivities(prev => [newActivity, ...prev].slice(0, 10));
            
            // Invalidate leaderboard queries
            queryClient.invalidateQueries({ queryKey: ['gamification-leaderboard'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { recentActivities };
}
