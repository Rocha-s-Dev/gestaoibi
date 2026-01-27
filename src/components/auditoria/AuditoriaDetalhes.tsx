import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RegistroAuditoria } from "@/hooks/useAuditoria";
import {
  Shield,
  Database,
  DollarSign,
  FileText,
  User,
  Building,
  Clock,
  Globe,
  Monitor,
  Hash,
  ArrowRight,
} from "lucide-react";

interface AuditoriaDetalhesProps {
  registro: RegistroAuditoria | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoriaIcons = {
  seguranca: <Shield className="h-4 w-4" />,
  dados: <Database className="h-4 w-4" />,
  financeiro: <DollarSign className="h-4 w-4" />,
  documental: <FileText className="h-4 w-4" />,
};

export function AuditoriaDetalhes({ registro, open, onOpenChange }: AuditoriaDetalhesProps) {
  if (!registro) return null;

  const renderJsonDiff = (alteracoes: Record<string, any> | null) => {
    if (!alteracoes || Object.keys(alteracoes).length === 0) {
      return <p className="text-muted-foreground text-sm">Sem alterações registradas</p>;
    }

    return (
      <div className="space-y-3">
        {Object.entries(alteracoes).map(([campo, valores]: [string, any]) => (
          <div key={campo} className="border rounded-lg p-3">
            <p className="font-medium text-sm mb-2">{campo}</p>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1 p-2 bg-red-50 rounded text-red-700 font-mono overflow-auto">
                {JSON.stringify(valores.anterior, null, 2) || "null"}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 p-2 bg-green-50 rounded text-green-700 font-mono overflow-auto">
                {JSON.stringify(valores.novo, null, 2) || "null"}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderJson = (data: Record<string, any> | null) => {
    if (!data) return <p className="text-muted-foreground text-sm">Nenhum dado</p>;
    return (
      <pre className="text-xs font-mono bg-muted p-3 rounded-lg overflow-auto max-h-[300px]">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {categoriaIcons[registro.categoria]}
            Detalhes da Auditoria
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 pr-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(new Date(registro.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {registro.user_nome || registro.user_email || "Sistema"}
                  </span>
                </div>
                
                {registro.secretaria_nome && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{registro.secretaria_nome}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {registro.ip_address && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{registro.ip_address}</span>
                  </div>
                )}
                
                {registro.user_agent && (
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs truncate max-w-[200px]" title={registro.user_agent}>
                      {registro.user_agent}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                Módulo: {registro.modulo}
              </Badge>
              <Badge variant="outline">
                Entidade: {registro.entidade}
              </Badge>
              <Badge variant="secondary">
                Ação: {registro.tipo_acao}
              </Badge>
              <Badge>
                Categoria: {registro.categoria}
              </Badge>
            </div>

            <Separator />

            {/* Hash Info */}
            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Verificação de Integridade</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs">
                  <span className="text-muted-foreground">Hash: </span>
                  <code className="font-mono text-[10px]">{registro.hash_registro}</code>
                </p>
                {registro.hash_anterior && (
                  <p className="text-xs">
                    <span className="text-muted-foreground">Hash Anterior: </span>
                    <code className="font-mono text-[10px]">{registro.hash_anterior}</code>
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Tabs for different views */}
            <Tabs defaultValue="alteracoes" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="alteracoes">Alterações</TabsTrigger>
                <TabsTrigger value="anterior">Estado Anterior</TabsTrigger>
                <TabsTrigger value="posterior">Estado Posterior</TabsTrigger>
              </TabsList>
              
              <TabsContent value="alteracoes" className="mt-4">
                {renderJsonDiff(registro.alteracoes)}
              </TabsContent>
              
              <TabsContent value="anterior" className="mt-4">
                {renderJson(registro.estado_anterior)}
              </TabsContent>
              
              <TabsContent value="posterior" className="mt-4">
                {renderJson(registro.estado_posterior)}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
