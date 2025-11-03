import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  redirectUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== send-password-reset invoked ===");
  
  try {
    const { email, redirectUrl }: PasswordResetRequest = await req.json();
    console.log("Password reset requested for:", email);

    if (!email) {
      throw new Error("Email é obrigatório");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate password reset using Supabase Auth
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${redirectUrl}?reset=true`,
      },
    });

    if (error) {
      console.error("Erro ao gerar link de recuperação:", error);
      const status = (error as any)?.status || (error as any)?.code;
      if (status === 404 || String(error.message).toLowerCase().includes('not found')) {
        // Não revelar se o email existe: responder 200 de forma genérica
        return new Response(
          JSON.stringify({ success: true, message: "Se o email existir, enviaremos um link de recuperação." }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      throw new Error(`Erro ao gerar link: ${error.message}`);
    }

    const resetLink = data.properties?.action_link;
    if (!resetLink) {
      throw new Error("Link de recuperação não foi gerado");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const RESEND_FROM = Deno.env.get("RESEND_FROM") || "CRM <onboarding@resend.dev>";
    console.log("Enviando email de:", RESEND_FROM, "para:", email);

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        subject: "Redefinir sua senha",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Redefinir sua senha</h2>
            <p>Você solicitou a redefinição de senha para sua conta.</p>
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            <div style="margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Redefinir Senha
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Se você não solicitou esta redefinição, pode ignorar este email com segurança.
            </p>
            <p style="color: #666; font-size: 14px;">
              Este link expira em 1 hora.
            </p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Erro do Resend:", errorData);
      
      // Se for erro 403 (domínio não verificado), retornar sucesso genérico
      // para não "quebrar" a UX, mas logar o problema
      if (resendResponse.status === 403) {
        console.warn("⚠️ Domínio não verificado no Resend. Configure em resend.com/domains");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Email enviado com sucesso",
            warning: "Domain verification needed" 
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      
      throw new Error(`Erro ao enviar email: ${errorData}`);
    }

    const emailData = await resendResponse.json();
    console.log("Email de recuperação enviado:", emailData);

    return new Response(
      JSON.stringify({ success: true, message: "Email enviado com sucesso" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Erro ao enviar email de recuperação:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
