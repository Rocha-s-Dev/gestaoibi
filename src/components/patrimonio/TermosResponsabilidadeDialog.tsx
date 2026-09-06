import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { BemPatrimonial, useTermosResponsabilidade } from "@/hooks/usePatrimonio";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bem: BemPatrimonial;
}

export function TermosResponsabilidadeDialog({ open, onOpenChange, bem }: Props) {
  const { termos, isLoading, createTermo, encerrarTermo } = useTermosResponsabilidade(bem.id);
  const [responsavel, setResponsavel] = useState<UsuarioRH | null>(null);
  const [showVincular, setShowVincular] = useState(false);
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [observacoes, setObservacoes] = useState("");

  const handleCriar = () => {
    if (!responsavel) return toast.error("Selecione o servidor responsável.");
    createTermo.mutate(
      {
        bem_id: bem.id,
        responsavel_id: responsavel.user_id,
        secretaria_id: bem.secretaria_id,
        unidade_id: bem.unidade_id,
        data_inicio: dataInicio,
        observacoes: observacoes || null,
      },
      {
        onSuccess: () => {
          setResponsavel(null);
          setObservacoes("");
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termos de Responsabilidade</DialogTitle>
            <DialogDescription>
              {bem.numero_tombamento} — {bem.descricao}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md border p-4 space-y-3">
              <p className="text-sm font-medium">Novo termo</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Servidor responsável (RH)</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={responsavel ? responsavel.nome : "Nenhum selecionado"} />
                    <Button type="button" variant="outline" onClick={() => setShowVincular(true)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Data de início</Label>
                  <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} />
              </div>
              <Button onClick={handleCriar} disabled={createTermo.isPending}>
                {createTermo.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Registrar Termo
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {termos.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Nenhum termo registrado.</TableCell></TableRow>
                    ) : termos.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{new Date(t.data_inicio).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{t.data_fim ? new Date(t.data_fim).toLocaleDateString("pt-BR") : "—"}</TableCell>
                        <TableCell>
                          <Badge variant={t.data_fim ? "secondary" : "default"}>{t.data_fim ? "Encerrado" : "Vigente"}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate">{t.observacoes || "—"}</TableCell>
                        <TableCell className="text-right">
                          {!t.data_fim && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={encerrarTermo.isPending}
                              onClick={() => encerrarTermo.mutate({ id: t.id, data_fim: new Date().toISOString().split("T")[0] })}
                            >
                              Encerrar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={showVincular}
        onOpenChange={setShowVincular}
        onUsuarioSelecionado={(u) => setResponsavel(u)}
        titulo="Selecionar Responsável"
      />
    </>
  );
}
