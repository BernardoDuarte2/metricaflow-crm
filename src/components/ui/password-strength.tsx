import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  met: boolean;
  text: string;
}

interface PasswordStrengthProps {
  password: string;
  requirements?: PasswordRequirement[];
}

export function PasswordStrength({ password, requirements }: PasswordStrengthProps) {
  const defaultRequirements: PasswordRequirement[] = [
    { met: password.length >= 12, text: "Mínimo 12 caracteres" },
    { met: /[A-Z]/.test(password), text: "Pelo menos uma letra maiúscula" },
    { met: /[a-z]/.test(password), text: "Pelo menos uma letra minúscula" },
    { met: /[0-9]/.test(password), text: "Pelo menos um número" },
    { met: /[^A-Za-z0-9]/.test(password), text: "Pelo menos um caractere especial" },
  ];

  const reqs = requirements || defaultRequirements;
  const allMet = reqs.every(req => req.met);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={cn(
          "h-1.5 flex-1 rounded-full transition-colors",
          allMet ? "bg-success" : password.length > 0 ? "bg-warning" : "bg-muted"
        )} />
        <span className="text-xs text-muted-foreground">
          {allMet ? "Senha forte" : password.length > 0 ? "Senha fraca" : ""}
        </span>
      </div>
      <div className="space-y-1">
        {reqs.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={cn(
              "transition-colors",
              req.met ? "text-success" : "text-muted-foreground"
            )}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
