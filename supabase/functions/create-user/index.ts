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
  console.log('=== CREATE USER START ===');
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
      return new Response(JSON.stringify({ error: 'Apenas o dono da conta pode criar usuários' }), {
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

    // Get subscription and user limit
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_type, user_limit, status')
      .eq('company_id', companyId)
      .single();

    console.log('Subscription:', subscription, 'Error:', subError);

    // Count current ACTIVE users in company (excluding owner)
    const { data: activeUsersData } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('company_id', companyId)
      .eq('active', true);

    const { data: ownerData } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .eq('role', 'gestor_owner');

    const ownerIds = ownerData?.map(o => o.user_id) || [];
    const activeNonOwners = activeUsersData?.filter(u => !ownerIds.includes(u.id)) || [];
    const currentActiveUsers = activeNonOwners.length;

    const userLimit = subscription?.user_limit || 1;
    const planType = subscription?.plan_type || 'free';

    console.log('Active users:', currentActiveUsers, 'Limit:', userLimit, 'Plan:', planType);

    // Individual plans can only have 1 user (the owner)
    if (planType.includes('individual') || planType === 'free') {
      console.log('ERROR: Individual/free plan cannot add users');
      return new Response(JSON.stringify({ 
        error: 'Plano Individual: Não é possível adicionar usuários adicionais' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if limit reached (only count active non-owner users)
    if (currentActiveUsers >= userLimit - 1) {
      console.log('ERROR: User limit reached');
      return new Response(JSON.stringify({ 
        error: `Limite de ${userLimit} usuários ativos atingido. Desative um usuário para liberar uma licença.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', { 
        name: requestBody.name, 
        email: requestBody.email, 
        role: requestBody.role,
        passwordLength: requestBody.password?.length 
      });
    } catch (e) {
      console.error('ERROR: Failed to parse request body:', e);
      return new Response(JSON.stringify({ error: 'Corpo da requisição inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { name, email, password, role } = requestBody;

    // Validate inputs
    if (!name || name.trim().length < 1 || name.trim().length > 100) {
      console.log('ERROR: Invalid name');
      return new Response(JSON.stringify({ error: 'Nome deve ter entre 1 e 100 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('ERROR: Invalid email');
      return new Response(JSON.stringify({ error: 'Email inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate password with strong rules
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      console.log('ERROR: Password validation failed:', passwordValidation.error);
      return new Response(JSON.stringify({ error: passwordValidation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!role || !['gestor', 'vendedor'].includes(role)) {
      console.log('ERROR: Invalid role');
      return new Response(JSON.stringify({ error: 'Função deve ser gestor ou vendedor' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if email is already used in this company
    const { data: existingUsers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('company_id', companyId);

    if (existingUsers && existingUsers.length > 0) {
      const existingUserIds = existingUsers.map(u => u.id);
      
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      const emailExists = authUsers?.users?.some(u => 
        existingUserIds.includes(u.id) && u.email?.toLowerCase() === email.toLowerCase()
      );

      if (emailExists) {
        console.log('ERROR: Email already exists in company');
        return new Response(JSON.stringify({ 
          error: 'Este email já está em uso nesta empresa' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    console.log(`Creating user in Supabase Auth: ${email} with role: ${role}`);

    // Create the user in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        company_id: companyId,
        role: role
      }
    });

    if (createError) {
      console.error('ERROR: Failed to create user in Auth:', createError);
      
      const errorMsg = createError.message?.toLowerCase() || '';
      if (errorMsg.includes('already') || errorMsg.includes('exists') || errorMsg.includes('duplicate')) {
        return new Response(JSON.stringify({ 
          error: 'Este email já está em uso por outra empresa. Use outro email.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: createError.message || 'Erro ao criar usuário' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!newUser?.user) {
      console.error('ERROR: No user returned from createUser');
      return new Response(JSON.stringify({ error: 'Erro ao criar usuário' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`User created in Auth successfully: ${newUser.user.id}`);

    // Wait for the trigger to execute
    console.log('Waiting for database trigger...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify profile was created
    const { data: profile, error: checkProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id, company_id, name')
      .eq('id', newUser.user.id)
      .single();

    console.log('Profile check:', profile ? 'exists' : 'missing', 'Error:', checkProfileError);

    if (!profile) {
      console.log('Profile not created by trigger, creating manually');
      const { error: manualProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: newUser.user.id,
          company_id: companyId,
          name: name.trim()
        });

      if (manualProfileError) {
        console.error('ERROR: Failed to create profile manually:', manualProfileError);
      } else {
        console.log('Profile created manually successfully');
      }
    }

    // Verify role was created
    const { data: userRole, error: checkRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', newUser.user.id)
      .single();

    console.log('Role check:', userRole?.role || 'missing', 'Error:', checkRoleError);

    if (!userRole) {
      console.log('Role not created by trigger, creating manually');
      const { error: manualRoleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: role
        });

      if (manualRoleError) {
        console.error('ERROR: Failed to create role manually:', manualRoleError);
      } else {
        console.log('Role created manually successfully');
      }
    } else if (userRole.role !== role) {
      console.log('Role mismatch, updating from', userRole.role, 'to', role);
      const { error: updateRoleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: role })
        .eq('user_id', newUser.user.id);

      if (updateRoleError) {
        console.error('ERROR: Failed to update role:', updateRoleError);
      } else {
        console.log('Role updated successfully');
      }
    }

    console.log('=== CREATE USER SUCCESS ===');
    console.log('User ID:', newUser.user.id);
    console.log('Email:', newUser.user.email);
    console.log('Role:', role);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        name: name.trim(),
        role: role
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('=== CREATE USER UNEXPECTED ERROR ===');
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
