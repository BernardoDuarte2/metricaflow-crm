import { z } from 'zod';
import { sanitizeString } from './sanitize';

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres").transform(sanitizeString),
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres").optional().or(z.literal("")),
  phone: z.string().trim().regex(/^\d{10,11}$/, "Telefone deve ter 10-11 dígitos").optional().or(z.literal("")),
  company: z.string().trim().max(100, "Empresa deve ter no máximo 100 caracteres").transform(sanitizeString).optional().or(z.literal("")),
  source: z.string().trim().max(50, "Fonte deve ter no máximo 50 caracteres").transform(sanitizeString).optional().or(z.literal("")),
  estimated_value: z.string().trim().optional().or(z.literal("")),
});

export const authSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres").transform(sanitizeString),
  password: z.string()
    .min(12, "Senha deve ter no mínimo 12 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres").transform(sanitizeString),
  company_name: z.string().trim().min(1, "Nome da empresa é obrigatório").max(100, "Nome da empresa deve ter no máximo 100 caracteres").transform(sanitizeString),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(100, "Título deve ter no máximo 100 caracteres").transform(sanitizeString),
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres").transform(sanitizeString).optional(),
  lead_id: z.string().optional().or(z.literal("")),
  assigned_to: z.string().optional().or(z.literal("")),
  status: z.enum(["aberta", "encerrada", "pendente", "cancelada"]).optional().or(z.string()),
  due_date: z.string().optional().or(z.literal(""))
});

export const inviteSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres").transform(sanitizeString),
  role: z.enum(["gestor", "vendedor"], {
    errorMap: () => ({ message: "Função deve ser 'gestor' ou 'vendedor'" })
  }),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres").transform(sanitizeString),
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
  password: z.string()
    .min(12, "Senha deve ter no mínimo 12 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  role: z.enum(["gestor", "vendedor"], {
    errorMap: () => ({ message: "Função deve ser 'gestor' ou 'vendedor'" })
  }),
});

export type LeadFormData = z.infer<typeof leadSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
export type InviteFormData = z.infer<typeof inviteSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
