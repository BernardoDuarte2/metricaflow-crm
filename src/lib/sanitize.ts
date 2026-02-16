/**
 * Utilitário leve de sanitização para prevenir XSS armazenado.
 * Remove tags HTML e atributos perigosos de strings.
 */

// Regex para detectar tags HTML básicas e scripts
const DANGEROUS_HTML_REGEX = /<[^>]*>?/gm;
const SCRIPT_REGEX = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
const IFRAME_REGEX = /<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gm;
const ON_EVENT_REGEX = /\sPm\s*on\w+\s*=/gim; // onEvents like onClick, onLoad

export const sanitizeInput = (input: unknown): unknown => {
  if (typeof input !== 'string') return input;

  // Remove scripts e iframes completamente
  let clean = input
    .replace(SCRIPT_REGEX, "")
    .replace(IFRAME_REGEX, "");

  // Remove eventos JS inline (onClick, etc) e javascript: protocol
  clean = clean
    .replace(ON_EVENT_REGEX, "")
    .replace(/javascript:/gi, "");

  // Codifica caracteres HTML especiais para garantir que sejam tratados como texto
  // Isso é redundante com o React, mas bom para defesa em profundidade no DB
  return clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Zod Transform para sanitização automática
 * Uso: z.string().transform(sanitizeString)
 */
export const sanitizeString = (val: string) => {
  if (!val) return val;
  return sanitizeInput(val) as string;
};
