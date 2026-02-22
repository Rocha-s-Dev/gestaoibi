import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLGPDSaude } from "@/hooks/useLGPDSaude";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Shield, FileCheck, Eye } from "lucide-react";
import { format } from "date-fns";

const TIPOS_CONSENTIMENTO = [
  "Compartilhamento de dados",
  "Uso de dados para pesquisa",
  "Acesso ao prontuário por terceiros",
  "Envio de dados por meio eletrônico",
  "Tratamento de dados sensíveis",
];

export function LGPDSaudeModule() {
  const { logs, consentimentos, isLoadingLogs, isLoadingConsentimentos, createConsentimento } = useLGPDSaude();
  const [searchLog, setSearchLog] = useState("");
  const [searchCons, setSearchCons] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ paciente_id: "", tipo_consentimento: "", consentido: true, observacoes: "" });

  const { data: pacientes = [] } = useQuery({
    queryKey: ["pacientes_select"],
    queryFn: async () => { const { data } = await supabase.from("pacientes").select("id, nome, cpf").order("nome").limit(500); return data || []; },
  });

  const filteredLogs = logs.filter((l: any) =>
    l.paciente_nome?.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.user_nome?.toLowerCase().includes(searchLog.toLowerCase()) ||
    l.acao?.toLowerCase().includes(searchLog.toLowerCase())
  );

  const filteredCons = consentimentos.filter((c: any) =>
    c.paciente_nome?.toLowerCase().includes(searchCons.toLowerCase()) ||
    c.tipo_consentimento?.toLowerCase().includes(searchCons.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await createConsentimento.mutateAsync({
      paciente_id: form.paciente_id,
      tipo_consentimento: form.tipo_consentimento,
      consentido: form.consentido,
      observacoes: form.observacoes || undefined,
      responsavel_coleta_id: user?.id,
    });
    setDialogOpen(false);
    setForm({ paciente_id: "", tipo_consentimento: "", consentido: true, observacoes: "" });
  };

  return (
    <Tabs defaultValue="logs">
      <TabsList>
        <TabsTrigger value="logs" className="flex items-center gap-1"><Eye className="h-3 w-3" />Log de Acessos</TabsTrigger>
        <TabsTrigger value="consentimentos" className="flex items-center gap-1"><FileCheck className="h-3 w-3" />Consentimentos</TabsTrigger>
      </TabsList>

      <TabsContent value="logs" className="space-y-4 mt-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Registro imutável de todos os acessos a dados clínicos sensíveis (prontuários).</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por paciente, profissional ou ação..." value={searchLog} onChange={e => setSearchLog(e.target.value)} className="pl-8 w-80" />
        </div>
        {isLoadingLogs ? <div className="text-center py-8">Carregando...</div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{format(new Date(l.created_at), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                  <TableCell>{l.user_nome}</TableCell>
                  <TableCell><Badge variant="outline">{l.cargo}</Badge></TableCell>
                  <TableCell>{l.paciente_nome}</TableCell>
                  <TableCell><Badge variant="secondary">{l.acao}</Badge></TableCell>
                  <TableCell className="font-mono text-xs max-w-[120px] truncate" title={l.hash_registro}>{l.hash_registro?.substring(0, 12)}...</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum log encontrado</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </TabsContent>

      <TabsContent value="consentimentos" className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar paciente ou tipo..." value={searchCons} onChange={e => setSearchCons(e.target.value)} className="pl-8 w-72" />
          </div>
          <Button onClick={() => setDialogOpen(true)}><FileCheck className="h-4 w-4 mr-2" />Registrar Consentimento</Button>
        </div>
        {isLoadingConsentimentos ? <div className="text-center py-8">Carregando...</div> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Consentido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCons.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.paciente_nome}</TableCell>
                  <TableCell>{c.paciente_cpf}</TableCell>
                  <TableCell>{c.tipo_consentimento}</TableCell>
                  <TableCell>
                    <Badge variant={c.consentido ? "default" : "destructive"}>
                      {c.consentido ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(c.data_consentimento), "dd/MM/yyyy")}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{c.observacoes || "—"}</TableCell>
                </TableRow>
              ))}
              {filteredCons.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum consentimento encontrado</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </TabsContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Consentimento LGPD</DialogTitle>
            <DialogDescription>Documente o consentimento do paciente para tratamento de dados.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select value={form.paciente_id} onValueChange={v => setForm({ ...form, paciente_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{pacientes.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome} — {p.cpf || "sem CPF"}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Consentimento *</Label>
              <Select value={form.tipo_consentimento} onValueChange={v => setForm({ ...form, tipo_consentimento: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{TIPOS_CONSENTIMENTO.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Paciente consentiu?</Label>
              <Select value={form.consentido ? "sim" : "nao"} onValueChange={v => setForm({ ...form, consentido: v === "sim" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createConsentimento.isPending || !form.paciente_id || !form.tipo_consentimento}>Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
