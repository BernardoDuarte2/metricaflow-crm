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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !userRole) {
      console.error('Role fetch error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only managers and owners can access WhatsApp Web
    if (userRole.role !== 'gestor' && userRole.role !== 'gestor_owner') {
      return new Response(
        JSON.stringify({ error: 'Apenas gestores podem acessar o WhatsApp Web' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Evolution API configuration
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE');
    const evolutionApiKey = Deno.env.get('BERNARDO');

    console.log('Evolution API URL:', evolutionApiUrl);
    console.log('Evolution Instance:', evolutionInstance);
    console.log('Evolution API Key present:', !!evolutionApiKey);

    if (!evolutionApiUrl || !evolutionInstance || !evolutionApiKey) {
      console.error('Missing Evolution API configuration', {
        hasUrl: !!evolutionApiUrl,
        hasInstance: !!evolutionInstance,
        hasApiKey: !!evolutionApiKey
      });
      return new Response(
        JSON.stringify({ error: 'Configuração da Evolution API não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the Evolution API web interface URL
    const webUrl = `${evolutionApiUrl}/manager/#/instances/${evolutionInstance}/chats`;

    console.log('Generated Evolution Web URL:', webUrl);
    console.log('For user:', user.id);

    return new Response(
      JSON.stringify({ 
        url: webUrl,
        instance: evolutionInstance,
        apiKey: evolutionApiKey
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-evolution-web-url:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
