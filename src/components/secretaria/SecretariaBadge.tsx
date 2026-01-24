import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

interface SecretariaBadgeProps {
  className?: string;
  showFullName?: boolean;
}

export function SecretariaBadge({ className, showFullName = true }: SecretariaBadgeProps) {
  const { secretariaAtiva, loading } = useSecretariaContext();

  if (loading || !secretariaAtiva) {
    return null;
  }

  return (
    <div className={className}>
      <Badge 
        variant="outline" 
        className="flex items-center gap-2 text-sm font-normal"
        style={{ 
          borderColor: secretariaAtiva.cor_tema || undefined,
          color: secretariaAtiva.cor_tema || undefined,
        }}
      >
        <Building2 className="h-3.5 w-3.5" />
        <span className="font-semibold">{secretariaAtiva.sigla}</span>
        {showFullName && (
          <span className="text-muted-foreground">
            {secretariaAtiva.nome}
          </span>
        )}
      </Badge>
    </div>
  );
}
