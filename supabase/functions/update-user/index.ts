import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Password validation function matching frontend requirements
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 12) {
    return { valid: false, error: 'Senha deve ter no mínimo 12 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Senha deve conter pelo menos uma letra maiúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Senha deve conter pelo menos uma letra minúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Senha deve conter pelo menos um número' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)' };
  }
  return { valid: true };
}

serve(async (req) => {
  console.log('=== UPDATE USER START ===');
  console.log('Request received at:', new Date().toISOString());
  console.log('Method:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request');
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
      console.log('ERROR: No authorization header');
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify the calling user
    const token = authHeader.replace('Bearer ', '');
    console.log('Verifying token...');
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callingUser) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Authenticated user:', callingUser.id, callingUser.email);

    // Check if calling user is gestor_owner
    const { data: callerRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .single();

    console.log('Caller role:', callerRole?.role, 'Error:', roleError);

    if (!callerRole || callerRole.role !== 'gestor_owner') {
      console.log('ERROR: User is not gestor_owner');
      return new Response(JSON.stringify({ error: 'Apenas o dono da conta pode editar usuários' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get caller's company
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', callingUser.id)
      .single();

    console.log('Caller company_id:', callerProfile?.company_id, 'Error:', profileError);

    if (!callerProfile) {
      console.log('ERROR: Profile not found');
      return new Response(JSON.stringify({ error: 'Perfil não encontrado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const companyId = callerProfile.company_id;

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', { 
        userId: requestBody.userId,
        name: requestBody.name, 
        email: requestBody.email, 
        role: requestBody.role,
        passwordProvided: !!requestBody.password
      });
    } catch (e) {
      console.error('ERROR: Failed to parse request body:', e);
      return new Response(JSON.stringify({ error: 'Corpo da requisição inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { userId, name, email, password, role } = requestBody;

    if (!userId) {
      console.log('ERROR: No userId provided');
      return new Response(JSON.stringify({ error: 'ID do usuário é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if target user exists and belongs to the same company
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id, company_id, name')
      .eq('id', userId)
      .single();

    console.log('Target profile:', targetProfile, 'Error:', targetProfileError);

    if (!targetProfile) {
      console.log('ERROR: Target user not found');
      return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (targetProfile.company_id !== companyId) {
      console.log('ERROR: User belongs to different company');
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

    console.log('Target role:', targetRole?.role);

    if (targetRole?.role === 'gestor_owner') {
      console.log('ERROR: Cannot edit owner');
      return new Response(JSON.stringify({ error: 'Não é possível editar o proprietário' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let updatedFields: string[] = [];

    // Update profile name if provided
    if (name && name.trim().length > 0) {
      if (name.trim().length > 100) {
        console.log('ERROR: Name too long');
        return new Response(JSON.stringify({ error: 'Nome deve ter no máximo 100 caracteres' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Updating name to:', name.trim());
      const { error: nameUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', userId);

      if (nameUpdateError) {
        console.error('ERROR: Failed to update name:', nameUpdateError);
        return new Response(JSON.stringify({ error: 'Erro ao atualizar nome' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      updatedFields.push('name');
    }

    // Update email if provided
    if (email && email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log('ERROR: Invalid email format');
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
          console.log('ERROR: Email already in use in company');
          return new Response(JSON.stringify({ 
            error: 'Este email já está em uso por outro usuário da empresa' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      console.log('Updating email to:', email.trim().toLowerCase());
      const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: email.trim().toLowerCase(),
      });

      if (emailError) {
        console.error('ERROR: Failed to update email:', emailError);
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
      updatedFields.push('email');
    }

    // Update password if provided
    if (password && password.length > 0) {
      // Validate password with strong rules
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        console.log('ERROR: Password validation failed:', passwordValidation.error);
        return new Response(JSON.stringify({ error: passwordValidation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Updating password...');
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
      });

      if (passwordError) {
        console.error('ERROR: Failed to update password:', passwordError);
        return new Response(JSON.stringify({ error: 'Erro ao atualizar senha' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      updatedFields.push('password');
    }

    // Update role if provided
    if (role && ['gestor', 'vendedor'].includes(role)) {
      console.log('Updating role to:', role);
      const { error: roleUpdateError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: role })
        .eq('user_id', userId);

      if (roleUpdateError) {
        console.error('ERROR: Failed to update role:', roleUpdateError);
        return new Response(JSON.stringify({ error: 'Erro ao atualizar função' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      updatedFields.push('role');
    }

    console.log('=== UPDATE USER SUCCESS ===');
    console.log('User ID:', userId);
    console.log('Updated fields:', updatedFields.join(', ') || 'none');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Usuário atualizado com sucesso',
      updatedFields
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('=== UPDATE USER UNEXPECTED ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
