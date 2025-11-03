import { useMemo } from "react";

interface PasswordValidation {
  isValid: boolean;
  requirements: {
    met: boolean;
    text: string;
  }[];
}

export function usePasswordValidation(password: string): PasswordValidation {
  return useMemo(() => {
    const requirements = [
      { met: password.length >= 12, text: "Mínimo 12 caracteres" },
      { met: /[A-Z]/.test(password), text: "Pelo menos uma letra maiúscula" },
      { met: /[a-z]/.test(password), text: "Pelo menos uma letra minúscula" },
      { met: /[0-9]/.test(password), text: "Pelo menos um número" },
      { met: /[^A-Za-z0-9]/.test(password), text: "Pelo menos um caractere especial" },
    ];

    return {
      isValid: requirements.every(req => req.met),
      requirements,
    };
  }, [password]);
}
