import { ChevronDown, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSecretariaContext, Secretaria } from "@/contexts/SecretariaContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SecretariaSelector() {
  const { 
    secretariaAtiva, 
    secretariasDisponiveis, 
    setSecretariaAtiva,
    loading,
    isAdmin,
    getUserRoleInSecretaria 
  } = useSecretariaContext();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4 animate-pulse" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (secretariasDisponiveis.length === 0) {
    return null;
  }

  const getRoleBadge = (role: string | null) => {
    if (!role) return null;
    
    const roleLabels: Record<string, string> = {
      admin_municipal: "Admin",
      secretario: "Secretário",
      secretario_adjunto: "Adj.",
      diretor: "Diretor",
      coordenador: "Coord.",
      supervisor: "Superv.",
      servidor: "Servidor",
      estagiario: "Estagiário",
    };
    
    return (
      <Badge variant="secondary" className="ml-2 text-xs">
        {roleLabels[role] || role}
      </Badge>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 h-9"
        >
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-semibold">
            {secretariaAtiva?.sigla || "Selecionar"}
          </span>
          {secretariaAtiva && getRoleBadge(getUserRoleInSecretaria(secretariaAtiva.id))}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>Selecionar Secretaria</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {secretariasDisponiveis.map((secretaria) => (
          <DropdownMenuItem
            key={secretaria.id}
            onClick={() => setSecretariaAtiva(secretaria)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              secretariaAtiva?.id === secretaria.id && "bg-accent"
            )}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span 
                  className="font-semibold"
                  style={{ color: secretaria.cor_tema || undefined }}
                >
                  {secretaria.sigla}
                </span>
                {getRoleBadge(getUserRoleInSecretaria(secretaria.id))}
              </div>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {secretaria.nome}
              </span>
            </div>
            {secretariaAtiva?.id === secretaria.id && (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-xs text-muted-foreground"
              disabled
            >
              Admin Municipal - Acesso total
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
