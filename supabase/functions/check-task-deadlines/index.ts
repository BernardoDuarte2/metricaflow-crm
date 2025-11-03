import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  assigned_to: string;
  lead_id: string | null;
  company_id: string;
  assigned_profile: Array<{
    name: string;
  }> | null;
  lead: Array<{
    name: string;
  }> | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking task deadlines...');

    // Get tasks that are due in the next 24 hours and not completed
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const now = new Date();

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        due_date,
        assigned_to,
        lead_id,
        company_id,
        assigned_profile:profiles!tasks_assigned_to_fkey(name),
        lead:leads!tasks_lead_id_fkey(name)
      `)
      .eq('status', 'aberta')
      .gte('due_date', now.toISOString())
      .lte('due_date', tomorrow.toISOString());

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    console.log(`Found ${tasks?.length || 0} tasks due in the next 24 hours`);

    // Here you would send notifications
    // For now, we'll just log them
    // In a future implementation, you could integrate with:
    // - Resend for emails
    // - Push notification service
    // - WhatsApp via Evolution API

    const notifications = tasks?.map((task: Task) => ({
      task_id: task.id,
      user_id: task.assigned_to,
      message: `Tarefa "${task.title}" vence em breve!`,
      due_date: task.due_date,
      lead_name: task.lead?.[0]?.name,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        tasks_checked: tasks?.length || 0,
        notifications_prepared: notifications?.length || 0,
        notifications,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in check-task-deadlines:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});