import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Shield,
  Database,
  DollarSign,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  LogIn,
  LogOut,
  Download,
  Upload,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RegistroAuditoria, CategoriaAuditoria, TipoAcaoAuditoria } from "@/hooks/useAuditoria";

interface AuditoriaTimelineProps {
  registros: RegistroAuditoria[];
  onSelectRegistro?: (registro: RegistroAuditoria) => void;
}

const categoriaIcons: Record<CategoriaAuditoria, React.ReactNode> = {
  seguranca: <Shield className="h-4 w-4" />,
  dados: <Database className="h-4 w-4" />,
  financeiro: <DollarSign className="h-4 w-4" />,
  documental: <FileText className="h-4 w-4" />,
};

const categoriaColors: Record<CategoriaAuditoria, string> = {
  seguranca: "bg-red-100 text-red-800 border-red-200",
  dados: "bg-blue-100 text-blue-800 border-blue-200",
  financeiro: "bg-green-100 text-green-800 border-green-200",
  documental: "bg-purple-100 text-purple-800 border-purple-200",
};

const acaoIcons: Record<TipoAcaoAuditoria, React.ReactNode> = {
  criar: <Plus className="h-3 w-3" />,
  editar: <Edit className="h-3 w-3" />,
  excluir: <Trash2 className="h-3 w-3" />,
  visualizar: <Eye className="h-3 w-3" />,
  aprovar: <Check className="h-3 w-3" />,
  rejeitar: <X className="h-3 w-3" />,
  login: <LogIn className="h-3 w-3" />,
  logout: <LogOut className="h-3 w-3" />,
  exportar: <Download className="h-3 w-3" />,
  importar: <Upload className="h-3 w-3" />,
  reverter: <RotateCcw className="h-3 w-3" />,
};

const acaoLabels: Record<TipoAcaoAuditoria, string> = {
  criar: "Criação",
  editar: "Edição",
  excluir: "Exclusão",
  visualizar: "Visualização",
  aprovar: "Aprovação",
  rejeitar: "Rejeição",
  login: "Login",
  logout: "Logout",
  exportar: "Exportação",
  importar: "Importação",
  reverter: "Reversão",
};

export function AuditoriaTimeline({ registros, onSelectRegistro }: AuditoriaTimelineProps) {
  const groupedByDate = registros.reduce((acc, registro) => {
    const date = format(new Date(registro.created_at), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(registro);
    return acc;
  }, {} as Record<string, RegistroAuditoria[]>);

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6 p-4">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-2">
              {format(new Date(date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <div className="relative space-y-3 pl-6 border-l-2 border-muted">
              {items.map((registro) => (
                <Card
                  key={registro.id}
                  className="cursor-pointer hover:shadow-md transition-shadow ml-4"
                  onClick={() => onSelectRegistro?.(registro)}
                >
                  <CardContent className="p-3">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-background border-2 border-primary" />
                    
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={categoriaColors[registro.categoria]}>
                            {categoriaIcons[registro.categoria]}
                            <span className="ml-1 capitalize">{registro.categoria}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {acaoIcons[registro.tipo_acao]}
                            <span className="ml-1">{acaoLabels[registro.tipo_acao]}</span>
                          </Badge>
                        </div>
                        
                        <p className="text-sm font-medium mt-2">
                          {registro.entidade}
                          {registro.entidade_id && (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({registro.entidade_id.slice(0, 8)}...)
                            </span>
                          )}
                        </p>
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          {registro.user_nome || registro.user_email || "Sistema"}
                          {registro.secretaria_nome && ` • ${registro.secretaria_nome}`}
                        </p>
                      </div>
                      
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(registro.created_at), "HH:mm:ss")}
                      </div>
                    </div>
                    
                    {registro.alteracoes && Object.keys(registro.alteracoes).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {Object.keys(registro.alteracoes).length} campo(s) alterado(s)
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {registros.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Nenhum registro de auditoria encontrado
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
