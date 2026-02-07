import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, Clock, UserX, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AccessDeniedScreenProps {
  reason: 'no_vinculo' | 'inactive' | 'blocked' | 'pending';
}

const reasonConfig = {
  no_vinculo: {
    icon: UserX,
    title: "Sem Vínculo Funcional",
    description: "Seu cadastro não possui vínculo funcional ativo. Você precisa estar vinculado a uma secretaria para acessar o sistema.",
    suggestion: "Entre em contato com o Departamento de Recursos Humanos para que seu vínculo funcional seja criado.",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  inactive: {
    icon: UserX,
    title: "Cadastro Inativo",
    description: "Seu cadastro foi inativado no sistema. Você não pode acessar nenhum módulo.",
    suggestion: "Entre em contato com o RH para reativação do seu cadastro.",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  blocked: {
    icon: ShieldX,
    title: "Acesso Bloqueado",
    description: "Seu acesso ao sistema foi bloqueado por motivos de segurança.",
    suggestion: "Entre em contato com o administrador do sistema para esclarecimentos.",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  pending: {
    icon: Clock,
    title: "Cadastro Pendente de Regularização",
    description: "Seu cadastro ainda não foi regularizado pelo Departamento de RH.",
    suggestion: "Aguarde a regularização pelo RH ou entre em contato para agilizar o processo.",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
};

export function AccessDeniedScreen({ reason }: AccessDeniedScreenProps) {
  const { signOut } = useAuth();
  const config = reasonConfig[reason];
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 h-16 w-16 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`h-8 w-8 ${config.color}`} />
          </div>
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <CardDescription className="text-base">
            {config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">{config.suggestion}</p>
          </div>
          <Button variant="outline" className="w-full" onClick={signOut}>
            Sair do Sistema
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
