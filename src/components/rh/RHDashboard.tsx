import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRHCentral, type NovoUsuarioRH } from "@/hooks/useRHCentral";
import { useSecretarias } from "@/hooks/useSecretarias";
import { useCargosPublicos } from "@/hooks/useCargosPublicos";
import { toast } from "sonner";
import { 
  Users, UserPlus, UserCheck, UserX, Clock, Shield, 
  Search, AlertTriangle, CheckCircle2, XCircle, Building2,
  BarChart3, RefreshCw
} from "lucide-react";

export function RHDashboard() {
  const { usuarios, isLoading, stats, criarUsuario, atualizarStatus, regularizarUsuario } = useRHCentral();
  const { secretarias } = useSecretarias();
  const { cargos } = useCargosPublicos();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state for new user
  const [form, setForm] = useState<NovoUsuarioRH>({
    email: "",
    password: "",
    name: "",
    cpf: "",
    tipo_usuario: "funcionario",
    secretaria_id: "",
    cargo_id: "",
    regime: "estatutario",
    data_admissao: new Date().toISOString().split("T")[0],
    jornada_semanal: 40,
    matricula: "",
  });

  const filteredUsers = usuarios.filter(u => {
    const matchSearch = !searchTerm || 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cpf?.includes(searchTerm);
    const matchStatus = statusFilter === "todos" || u.status_cadastral === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateUser = async () => {
    if (!form.email || !form.password || !form.name) {
      toast.error("Preencha os campos obrigatórios: Nome, Email e Senha");
      return;
    }
    if (form.tipo_usuario === 'secretario' && !form.secretaria_id) {
      toast.error("Secretário deve ter uma secretaria vinculada");
      return;
    }
    await criarUsuario.mutateAsync(form);
    setDialogOpen(false);
    setForm({
      email: "", password: "", name: "", cpf: "", tipo_usuario: "funcionario",
      secretaria_id: "", cargo_id: "", regime: "estatutario",
      data_admissao: new Date().toISOString().split("T")[0], jornada_semanal: 40, matricula: "",
    });
  };

  const statusBadge = (status: string | null) => {
    switch (status) {
      case 'ativo': return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inativo': return <Badge variant="secondary">Inativo</Badge>;
      case 'bloqueado': return <Badge variant="destructive">Bloqueado</Badge>;
      case 'pendente_regularizacao': return <Badge className="bg-amber-100 text-amber-800">Pendente</Badge>;
      case 'afastado': return <Badge className="bg-blue-100 text-blue-800">Afastado</Badge>;
      default: return <Badge variant="outline">-</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><RefreshCw className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card><CardContent className="p-4 text-center"><Users className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600" /><p className="text-2xl font-bold">{stats.ativos}</p><p className="text-xs text-muted-foreground">Ativos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="h-5 w-5 mx-auto mb-1 text-amber-600" /><p className="text-2xl font-bold">{stats.pendentes}</p><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><XCircle className="h-5 w-5 mx-auto mb-1 text-red-600" /><p className="text-2xl font-bold">{stats.inativos}</p><p className="text-xs text-muted-foreground">Inativos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="h-5 w-5 mx-auto mb-1 text-red-600" /><p className="text-2xl font-bold">{stats.bloqueados}</p><p className="text-xs text-muted-foreground">Bloqueados</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><UserCheck className="h-5 w-5 mx-auto mb-1 text-green-600" /><p className="text-2xl font-bold">{stats.comVinculo}</p><p className="text-xs text-muted-foreground">Com Vínculo</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-600" /><p className="text-2xl font-bold">{stats.semVinculo}</p><p className="text-xs text-muted-foreground">Sem Vínculo</p></CardContent></Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-3 items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, email ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="pendente_regularizacao">Pendentes</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
              <SelectItem value="bloqueado">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" />Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário (RH)</DialogTitle>
              <DialogDescription>Apenas o RH pode criar novos usuários no sistema.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Senha Temporária *</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={form.cpf} onChange={(e) => setForm({...form, cpf: e.target.value})} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Usuário *</Label>
                <Select value={form.tipo_usuario} onValueChange={(v: any) => setForm({...form, tipo_usuario: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funcionario">Funcionário</SelectItem>
                    <SelectItem value="secretario">Secretário</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secretaria {form.tipo_usuario === 'secretario' ? '*' : ''}</Label>
                <Select value={form.secretaria_id} onValueChange={(v) => setForm({...form, secretaria_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecionar secretaria" /></SelectTrigger>
                  <SelectContent>
                    {secretarias.filter(s => (s as any).ativo !== false).map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.sigla} - {s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Regime</Label>
                <Select value={form.regime} onValueChange={(v) => setForm({...form, regime: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estatutario">Estatutário</SelectItem>
                    <SelectItem value="celetista">Celetista</SelectItem>
                    <SelectItem value="temporario">Temporário</SelectItem>
                    <SelectItem value="comissionado">Comissionado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Admissão</Label>
                <Input type="date" value={form.data_admissao} onChange={(e) => setForm({...form, data_admissao: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Matrícula</Label>
                <Input value={form.matricula} onChange={(e) => setForm({...form, matricula: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Jornada Semanal (horas)</Label>
                <Input type="number" value={form.jornada_semanal} onChange={(e) => setForm({...form, jornada_semanal: Number(e.target.value)})} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateUser} disabled={criarUsuario.isPending}>
                {criarUsuario.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Usuários do Sistema ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{user.tipo_usuario || "funcionario"}</Badge>
                    </TableCell>
                    <TableCell>{statusBadge(user.status_cadastral)}</TableCell>
                    <TableCell>{user.secretaria_sigla || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{user.cargo_nome || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      {user.vinculo_id ? (
                        <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">Sem vínculo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.status_cadastral === 'pendente_regularizacao' && (
                          <Button size="sm" variant="outline" onClick={() => regularizarUsuario.mutate(user.user_id)}>
                            <UserCheck className="h-3 w-3 mr-1" />Regularizar
                          </Button>
                        )}
                        {user.status_cadastral === 'ativo' && (
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => atualizarStatus.mutate({ userId: user.user_id, status: 'inativo' })}>
                            <UserX className="h-3 w-3 mr-1" />Inativar
                          </Button>
                        )}
                        {user.status_cadastral === 'inativo' && (
                          <Button size="sm" variant="outline" onClick={() => atualizarStatus.mutate({ userId: user.user_id, status: 'ativo' })}>
                            <UserCheck className="h-3 w-3 mr-1" />Reativar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
