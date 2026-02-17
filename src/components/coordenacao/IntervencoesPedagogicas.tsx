import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  intervencoes: any[];
  alunos: any[];
  escolaId?: string | null;
  createIntervencao: any;
  updateIntervencao: any;
}

export function IntervencoesPedagogicas({ intervencoes, alunos, escolaId, createIntervencao, updateIntervencao }: Props) {
  const { session } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<string>("");
  const [tipo, setTipo] = useState("reforco");
  const [descricao, setDescricao] = useState("");
  const [alunoFilter, setAlunoFilter] = useState<string>("all");

  const handleSubmit = () => {
    if (!selectedAluno || !descricao) return;
    const aluno = alunos.find((a: any) => a.id === selectedAluno);
    createIntervencao.mutate({
      aluno_id: selectedAluno,
      escola_id: escolaId || aluno?.escola_id,
      tipo,
      descricao,
      responsavel_id: session?.user?.id,
      responsavel_nome: session?.user?.email,
      status: "em_acompanhamento",
    });
    setDialogOpen(false);
    setSelectedAluno("");
    setDescricao("");
  };

  const handleConcluir = (id: string) => {
    updateIntervencao.mutate({ id, status: "concluida" });
  };

  const filteredIntervencoes = alunoFilter === "all" ? intervencoes : intervencoes.filter((i: any) => i.aluno_id === alunoFilter);

  const tipoLabel: Record<string, string> = {
    reforco: "Reforço Escolar",
    conversa_familia: "Conversa com Família",
    acompanhamento: "Acompanhamento Individual",
    encaminhamento: "Encaminhamento",
    conselho_classe: "Conselho de Classe",
    outro: "Outro",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Select value={alunoFilter} onValueChange={setAlunoFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filtrar por aluno" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os alunos</SelectItem>
            {alunos.map((a: any) => (
              <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Nova Intervenção</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Histórico de Intervenções</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIntervencoes.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhuma intervenção registrada</TableCell></TableRow>
              ) : filteredIntervencoes.map((int: any) => (
                <TableRow key={int.id}>
                  <TableCell>{format(new Date(int.data_intervencao), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="font-medium">{int.aluno?.nome || "-"}</TableCell>
                  <TableCell>{tipoLabel[int.tipo] || int.tipo}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{int.descricao}</TableCell>
                  <TableCell>{int.responsavel_nome || "-"}</TableCell>
                  <TableCell>
                    {int.status === "concluida" ? (
                      <Badge variant="secondary">Concluída</Badge>
                    ) : (
                      <Badge>Em acompanhamento</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {int.status !== "concluida" && (
                      <Button size="sm" variant="outline" onClick={() => handleConcluir(int.id)}>Concluir</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Intervenção Pedagógica</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Aluno</Label>
              <Select value={selectedAluno} onValueChange={setSelectedAluno}>
                <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
                <SelectContent>
                  {alunos.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Intervenção</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reforco">Reforço Escolar</SelectItem>
                  <SelectItem value="conversa_familia">Conversa com Família</SelectItem>
                  <SelectItem value="acompanhamento">Acompanhamento Individual</SelectItem>
                  <SelectItem value="encaminhamento">Encaminhamento</SelectItem>
                  <SelectItem value="conselho_classe">Conselho de Classe</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva a intervenção..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!selectedAluno || !descricao}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
