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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get the JWT from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify the calling user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callingUser) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if calling user is gestor_owner
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .single();

    if (!callerRole || callerRole.role !== 'gestor_owner') {
      return new Response(JSON.stringify({ error: 'Apenas o dono da conta pode editar usuários' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get caller's company
    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', callingUser.id)
      .single();

    if (!callerProfile) {
      return new Response(JSON.stringify({ error: 'Perfil não encontrado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const companyId = callerProfile.company_id;

    // Parse request body
    const { userId, name, email, password, role } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'ID do usuário é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if target user exists and belongs to the same company
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, company_id, name')
      .eq('id', userId)
      .single();

    if (!targetProfile) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (targetProfile.company_id !== companyId) {
      return new Response(JSON.stringify({ error: 'Usuário não pertence à sua empresa' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if trying to edit owner
    const { data: targetRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (targetRole?.role === 'gestor_owner') {
      return new Response(JSON.stringify({ error: 'Não é possível editar o proprietário' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Updating user: ${userId}`);

    // Update profile name if provided
    if (name && name.trim().length > 0) {
      if (name.trim().length > 100) {
        return new Response(JSON.stringify({ error: 'Nome deve ter no máximo 100 caracteres' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return new Response(JSON.stringify({ error: 'Erro ao atualizar nome' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Update email if provided
    if (email && email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(JSON.stringify({ error: 'Email inválido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if email is already used in this company by another user
      const { data: existingUsers } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('company_id', companyId)
        .neq('id', userId);

      if (existingUsers && existingUsers.length > 0) {
        const existingUserIds = existingUsers.map(u => u.id);
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const emailExists = authUsers?.users?.some(u => 
          existingUserIds.includes(u.id) && u.email?.toLowerCase() === email.toLowerCase().trim()
        );

        if (emailExists) {
          return new Response(JSON.stringify({ 
            error: 'Este email já está em uso por outro usuário da empresa' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: email.trim().toLowerCase(),
      });

      if (emailError) {
        console.error('Error updating email:', emailError);
        const errorMsg = emailError.message?.toLowerCase() || '';
        if (errorMsg.includes('already') || errorMsg.includes('exists') || errorMsg.includes('duplicate')) {
          return new Response(JSON.stringify({ 
            error: 'Este email já está em uso por outra empresa' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ error: 'Erro ao atualizar email' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Update password if provided
    if (password && password.length > 0) {
      if (password.length < 12) {
        return new Response(JSON.stringify({ error: 'Senha deve ter no mínimo 12 caracteres' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
      });

      if (passwordError) {
        console.error('Error updating password:', passwordError);
        return new Response(JSON.stringify({ error: 'Erro ao atualizar senha' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Update role if provided
    if (role && ['gestor', 'vendedor'].includes(role)) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: role })
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error updating role:', roleError);
        return new Response(JSON.stringify({ error: 'Erro ao atualizar função' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    console.log(`User ${userId} updated successfully`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Usuário atualizado com sucesso'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
