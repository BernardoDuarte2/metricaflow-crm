# Configuração de Email com Resend

Este guia explica como configurar o sistema de envio de emails usando o Resend.

## 📋 Pré-requisitos

- Conta no Resend (gratuito para começar)
- Domínio próprio (recomendado para produção)

## 🚀 Passo a Passo

### 1. Criar Conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Clique em "Sign Up" e crie sua conta
3. Confirme seu email

### 2. Verificar Domínio

⚠️ **IMPORTANTE**: Para envio em produção, você PRECISA verificar seu domínio.

1. Acesse [resend.com/domains](https://resend.com/domains)
2. Clique em "Add Domain"
3. Digite seu domínio (ex: `seudominio.com`)
4. Adicione os registros DNS fornecidos:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT)
5. Aguarde a verificação (pode levar alguns minutos)

**Nota**: Durante o desenvolvimento, você pode usar `onboarding@resend.dev`, mas os emails serão enviados apenas para emails cadastrados na sua conta Resend.

### 3. Gerar API Key

1. Acesse [resend.com/api-keys](https://resend.com/api-keys)
2. Clique em "Create API Key"
3. Dê um nome (ex: "CRM Production")
4. Escolha permissões:
   - ✅ **Send emails** (obrigatório)
   - ⬜ Full access (não recomendado)
5. Copie a API key (você não conseguirá ver novamente!)

### 4. Configurar Secrets no Lovable Cloud

1. No seu projeto Lovable, vá em **Settings → Secrets**
2. Adicione os seguintes secrets:

**RESEND_API_KEY**
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxx
```
(cole a API key copiada no passo anterior)

**RESEND_FROM**
```
CRM System <noreply@seudominio.com>
```
(substitua `seudominio.com` pelo domínio verificado)

### 5. Testar Configuração

1. Acesse a página de **Diagnóstico** no seu sistema (menu admin)
2. Digite seu email no campo de teste
3. Clique em "Testar"
4. Verifique sua caixa de entrada

## ❓ Resolução de Problemas

### Erro: "Domain not verified" (403)

**Causa**: O domínio usado em `RESEND_FROM` não foi verificado no Resend.

**Solução**:
1. Acesse [resend.com/domains](https://resend.com/domains)
2. Verifique se seu domínio está com status "Verified"
3. Se não estiver, adicione os registros DNS faltantes
4. Use `onboarding@resend.dev` temporariamente para testes (apenas para emails da sua conta)

### Erro: "Invalid API key"

**Causa**: A API key não foi configurada corretamente ou expirou.

**Solução**:
1. Verifique se você copiou a API key completa
2. Gere uma nova API key em [resend.com/api-keys](https://resend.com/api-keys)
3. Atualize o secret `RESEND_API_KEY` no Lovable Cloud

### Email não chega

**Verificações**:
1. ✅ Confira a pasta de SPAM
2. ✅ Verifique se o domínio está verificado no Resend
3. ✅ Veja os logs no [Resend Dashboard](https://resend.com/emails)
4. ✅ Use a página de Diagnóstico do sistema para testar

## 📊 Monitoramento

O Resend fornece um dashboard completo:
- [resend.com/emails](https://resend.com/emails) - Ver emails enviados
- [resend.com/logs](https://resend.com/logs) - Logs detalhados
- [resend.com/api-keys](https://resend.com/api-keys) - Gerenciar API keys

## 🎯 Boas Práticas

1. **Produção**: Sempre use domínio verificado
2. **Desenvolvimento**: Use `onboarding@resend.dev` para testes rápidos
3. **Segurança**: Nunca commite a API key no código
4. **Monitoramento**: Configure webhooks para rastrear bounces/complaints
5. **Reputação**: Mantenha taxa baixa de bounces e complaints

## 💡 Dicas

- **Limite gratuito**: 100 emails/dia (mais que suficiente para testes)
- **Upgrade**: Planos pagos começam em $20/mês para 50k emails
- **Templates**: Considere usar templates do Resend para emails mais bonitos
- **React Email**: O sistema já suporta templates React Email

## 🔗 Links Úteis

- [Documentação Resend](https://resend.com/docs)
- [Status do Resend](https://status.resend.com)
- [Suporte Resend](https://resend.com/support)
- [Exemplos de Templates](https://demo.react.email)

---

**Precisa de ajuda?** Acesse a página de Diagnóstico no sistema ou consulte os logs do Lovable Cloud.
