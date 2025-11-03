import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  toEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM");

    console.log("Testing Resend configuration...");
    console.log("RESEND_API_KEY configured:", !!resendApiKey);
    console.log("RESEND_FROM configured:", !!resendFrom);

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY não configurado",
          details: "Configure a chave de API do Resend nos secrets do Lovable Cloud"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resendFrom) {
      return new Response(
        JSON.stringify({ 
          error: "RESEND_FROM não configurado",
          details: "Configure o email de envio nos secrets do Lovable Cloud (ex: 'CRM <noreply@seudominio.com>')"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { toEmail }: TestEmailRequest = await req.json();

    if (!toEmail) {
      return new Response(
        JSON.stringify({ error: "Email de destino não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending test email to: ${toEmail}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [toEmail],
        subject: "Teste de Configuração - CRM System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">✅ Configuração do Resend OK!</h1>
            <p>Este é um email de teste para verificar que sua configuração do Resend está funcionando corretamente.</p>
            <ul>
              <li>RESEND_API_KEY: ✅ Configurado</li>
              <li>RESEND_FROM: ✅ ${resendFrom}</li>
              <li>Domínio: ${resendFrom.includes("@") ? resendFrom.split("@")[1].replace(">", "") : "N/A"}</li>
            </ul>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Se você recebeu este email, significa que o sistema de envio de emails está funcionando perfeitamente!
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      
      if (emailResponse.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: "Domínio não verificado no Resend",
            details: `O domínio usado em RESEND_FROM (${resendFrom}) precisa ser verificado no Resend. Acesse https://resend.com/domains para verificar seu domínio.`,
            resendError: errorData
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: `Resend API error: ${errorData.message || "Unknown error"}`,
          details: errorData,
          statusCode: emailResponse.status
        }),
        { status: emailResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailData = await emailResponse.json();
    console.log("Test email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de teste enviado com sucesso!",
        emailData,
        config: {
          resendFrom,
          apiKeyConfigured: true
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in test-resend function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
