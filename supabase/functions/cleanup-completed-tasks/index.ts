import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate the date for yesterday (tasks completed before today)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    console.log('Cleaning up tasks completed before:', yesterday.toISOString());

    // Count completed tasks before deletion
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluida')
      .lt('updated_at', yesterday.toISOString());

    // Delete completed tasks that were updated before yesterday
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('status', 'concluida')
      .lt('updated_at', yesterday.toISOString());

    if (error) {
      console.error('Error deleting completed tasks:', error);
      throw error;
    }

    const deletedCount = count || 0;
    console.log(`Successfully deleted ${deletedCount} completed tasks`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        message: `Deleted ${deletedCount} completed tasks from previous days`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in cleanup-completed-tasks:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
