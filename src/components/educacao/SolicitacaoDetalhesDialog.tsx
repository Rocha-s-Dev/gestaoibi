import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Users, 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { type SolicitacaoMatricula } from "@/hooks/useSolicitacoesMatricula";
import { useTurmas } from "@/hooks/useTurmas";
import { useEscolas } from "@/hooks/useEscolas";

interface SolicitacaoDetalhesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solicitacao: SolicitacaoMatricula;
  onAprovar: (id: string, turmaId?: string) => void;
  onRejeitar: (id: string, motivo: string) => void;
  onListaEspera: (id: string) => void;
}

export function SolicitacaoDetalhesDialog({
  open,
  onOpenChange,
  solicitacao,
  onAprovar,
  onRejeitar,
  onListaEspera,
}: SolicitacaoDetalhesDialogProps) {
  const [actionMode, setActionMode] = useState<"view" | "aprovar" | "rejeitar">("view");
  const [turmaId, setTurmaId] = useState("");
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  
  const { turmas } = useTurmas();
  const { escolas } = useEscolas();

  const turmasFiltradas = turmas.filter((t) => {
    if (solicitacao.escola_desejada_id) {
      return t.escola_id === solicitacao.escola_desejada_id;
    }
    return true;
  });

  const handleAprovar = () => {
    onAprovar(solicitacao.id, turmaId || undefined);
    setActionMode("view");
    setTurmaId("");
  };

  const handleRejeitar = () => {
    if (!motivoRejeicao.trim()) {
      return;
    }
    onRejeitar(solicitacao.id, motivoRejeicao);
    setActionMode("view");
    setMotivoRejeicao("");
  };

  const getStatusBadge = () => {
    const statusMap = {
      pendente: { label: "Pendente", class: "bg-yellow-100 text-yellow-800" },
      em_analise: { label: "Em Análise", class: "bg-blue-100 text-blue-800" },
      aprovada: { label: "Aprovada", class: "bg-green-100 text-green-800" },
      rejeitada: { label: "Indeferida", class: "bg-red-100 text-red-800" },
      lista_espera: { label: "Lista de Espera", class: "bg-orange-100 text-orange-800" },
    };
    const status = statusMap[solicitacao.status];
    return <Badge className={status.class}>{status.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canTakeAction = ["pendente", "em_analise", "lista_espera"].includes(solicitacao.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Solicitação de Matrícula
              </DialogTitle>
              <DialogDescription className="mt-1 font-mono">
                Protocolo: {solicitacao.protocolo}
              </DialogDescription>
            </div>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <Tabs defaultValue="aluno" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="aluno" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Aluno
            </TabsTrigger>
            <TabsTrigger value="responsavel" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Responsável
            </TabsTrigger>
            <TabsTrigger value="matricula" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Matrícula
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aluno" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">{solicitacao.nome_aluno}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Data de Nascimento</Label>
                <p className="font-medium">
                  {new Date(solicitacao.data_nascimento).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">CPF</Label>
                <p className="font-medium">{solicitacao.cpf_aluno || "Não informado"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Endereço
              </Label>
              <p className="font-medium">
                {solicitacao.endereco || "Não informado"}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="responsavel" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">{solicitacao.nome_responsavel}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">CPF</Label>
                <p className="font-medium">{solicitacao.cpf_responsavel}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <p className="font-medium">{solicitacao.telefone_responsavel}</p>
              </div>
              <div>
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  E-mail
                </Label>
                <p className="font-medium">{solicitacao.email_responsavel || "Não informado"}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="matricula" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Série Pretendida</Label>
                <p className="font-medium">{solicitacao.serie_pretendida}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ano Letivo</Label>
                <p className="font-medium">{solicitacao.ano_letivo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Escola de Preferência</Label>
                <p className="font-medium">
                  {solicitacao.escola_desejada?.nome || "Não especificada"}
                </p>
              </div>
              <div>
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Data da Solicitação
                </Label>
                <p className="font-medium">{formatDate(solicitacao.created_at)}</p>
              </div>
            </div>

            {solicitacao.observacoes && (
              <div>
                <Label className="text-muted-foreground">Observações</Label>
                <p className="mt-1 rounded-lg bg-muted p-3 text-sm">{solicitacao.observacoes}</p>
              </div>
            )}

            {solicitacao.motivo_rejeicao && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <Label className="text-red-800">Motivo do Indeferimento</Label>
                <p className="mt-1 text-sm text-red-700">{solicitacao.motivo_rejeicao}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {canTakeAction && (
          <>
            <Separator className="my-4" />

            {actionMode === "view" && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setActionMode("aprovar")} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Aprovar Matrícula
                </Button>
                <Button variant="destructive" onClick={() => setActionMode("rejeitar")} className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Indeferir
                </Button>
                {solicitacao.status !== "lista_espera" && (
                  <Button variant="outline" onClick={() => onListaEspera(solicitacao.id)} className="gap-2">
                    <Clock className="h-4 w-4" />
                    Lista de Espera
                  </Button>
                )}
              </div>
            )}

            {actionMode === "aprovar" && (
              <div className="space-y-4 rounded-lg border bg-green-50 p-4">
                <h4 className="flex items-center gap-2 font-semibold text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Aprovar Matrícula
                </h4>
                <div>
                  <Label>Turma (opcional)</Label>
                  <Select value={turmaId} onValueChange={setTurmaId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmasFiltradas.map((turma) => {
                        const escola = escolas.find((e) => e.id === turma.escola_id);
                        return (
                          <SelectItem key={turma.id} value={turma.id}>
                            {turma.nome} - {escola?.nome}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAprovar}>Confirmar Aprovação</Button>
                  <Button variant="outline" onClick={() => setActionMode("view")}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {actionMode === "rejeitar" && (
              <div className="space-y-4 rounded-lg border bg-red-50 p-4">
                <h4 className="flex items-center gap-2 font-semibold text-red-800">
                  <XCircle className="h-5 w-5" />
                  Indeferir Solicitação
                </h4>
                <div>
                  <Label>Motivo do Indeferimento *</Label>
                  <Textarea
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    placeholder="Descreva o motivo do indeferimento..."
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleRejeitar} disabled={!motivoRejeicao.trim()}>
                    Confirmar Indeferimento
                  </Button>
                  <Button variant="outline" onClick={() => setActionMode("view")}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
