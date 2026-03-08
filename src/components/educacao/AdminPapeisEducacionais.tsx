import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Shield, School, AlertTriangle, Link2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";

type AdminEducationRole =
  | 'diretor'
  | 'vice_diretor'
  | 'secretario_escolar'
  | 'assistente_admin_escolar'
  | 'auxiliar_secretaria_escolar'
  | 'coordenador_admin_escolar'
  | 'tecnico_admin_educacional';

interface UserEducationRole {
  id: string;
  user_id: string;
  role: string;
  escola_id: string | null;
  created_at: string;
  profile?: { name: string; email: string } | null;
}

interface Escola {
  id: string;
  nome: string;
}

const roleLabels: Record<AdminEducationRole, string> = {
  diretor: 'Diretor Escolar',
  vice_diretor: 'Vice-Diretor Escolar',
  secretario_escolar: 'Secretário Escolar',
  assistente_admin_escolar: 'Assistente Administrativo Escolar',
  auxiliar_secretaria_escolar: 'Auxiliar de Secretaria Escolar',
  coordenador_admin_escolar: 'Coordenador Administrativo Escolar',
  tecnico_admin_educacional: 'Técnico Administrativo Educacional',
};

const roleColors: Record<AdminEducationRole, string> = {
  diretor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  vice_diretor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  secretario_escolar: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  assistente_admin_escolar: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  auxiliar_secretaria_escolar: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  coordenador_admin_escolar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  tecnico_admin_educacional: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
};

// Roles that are limited to 1 per school
const UNIQUE_PER_SCHOOL: AdminEducationRole[] = ['diretor', 'vice_diretor'];

const allAdminRoles: AdminEducationRole[] = [
  'diretor',
  'vice_diretor',
  'secretario_escolar',
  'assistente_admin_escolar',
  'auxiliar_secretaria_escolar',
  'coordenador_admin_escolar',
  'tecnico_admin_educacional',
];

export function AdminPapeisEducacionais() {
  const [roles, setRoles] = useState<UserEducationRole[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const [filtroRole, setFiltroRole] = useState<string>("todos");
  const [filtroEscola, setFiltroEscola] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<UserEducationRole | null>(null);

  // Form state
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioRH | null>(null);
  const [formRole, setFormRole] = useState<AdminEducationRole | "">("");
  const [formEscolaId, setFormEscolaId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: rolesResult, error: directError } = await supabase
        .from('user_education_roles' as any)
        .select('*, profiles:user_id(name, email)')
        .in('role', allAdminRoles)
        .order('created_at', { ascending: false });

      if (directError) {
        if (directError.code === '42P01') {
          setTableExists(false);
        } else {
          console.error('Erro ao buscar papéis:', directError);
        }
      } else {
        setRoles((rolesResult as unknown as UserEducationRole[]) || []);
        setTableExists(true);
      }

      const { data: escolasData } = await supabase
        .from('escolas')
        .select('id, nome')
        .order('nome');

      setEscolas(escolasData || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!formRole || !formEscolaId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!editingRole && !usuarioSelecionado) {
      toast.error('Selecione um servidor do RH');
      return;
    }

    // Check unique constraint for diretor/vice_diretor
    if (UNIQUE_PER_SCHOOL.includes(formRole as AdminEducationRole)) {
      const existing = roles.find(
        r => r.role === formRole && r.escola_id === formEscolaId && r.id !== editingRole?.id
      );
      if (existing) {
        toast.error(`Já existe um ${roleLabels[formRole as AdminEducationRole]} nesta escola`);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (editingRole) {
        const { error } = await supabase
          .from('user_education_roles' as any)
          .update({ role: formRole, escola_id: formEscolaId } as any)
          .eq('id', editingRole.id);
        if (error) throw error;
        toast.success('Cargo atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('user_education_roles' as any)
          .insert({
            user_id: usuarioSelecionado!.user_id,
            role: formRole,
            escola_id: formEscolaId,
          });
        if (error) throw error;
        toast.success('Cargo vinculado com sucesso');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (role: UserEducationRole) => {
    setEditingRole(role);
    setFormRole(role.role as AdminEducationRole);
    setFormEscolaId(role.escola_id || "");
    setDialogOpen(true);
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_education_roles' as any)
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Cargo removido');
      setRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (err) {
      console.error('Erro ao remover:', err);
      toast.error('Erro ao remover cargo');
    }
  };

  const resetForm = () => {
    setUsuarioSelecionado(null);
    setFormRole("");
    setFormEscolaId("");
    setEditingRole(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const rolesFiltrados = roles.filter(role => {
    if (filtroRole !== "todos" && role.role !== filtroRole) return false;
    if (filtroEscola !== "todos" && role.escola_id !== filtroEscola) return false;
    return true;
  });

  if (!tableExists) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Migração Necessária</AlertTitle>
        <AlertDescription>
          A tabela de papéis educacionais ainda não foi criada.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Regra Institucional</AlertTitle>
        <AlertDescription>
          Esta aba gerencia <strong>cargos administrativos escolares</strong>.
          Diretor e Vice-Diretor são limitados a 1 por escola. Demais cargos podem ter múltiplos por escola.
          Professores e Coordenadores são gerenciados na aba "Cadastro → Professores e Auxiliares".
        </AlertDescription>
      </Alert>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diretores</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter(r => r.role === 'diretor').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vice-Diretores</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.filter(r => r.role === 'vice_diretor').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demais Cargos</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter(r => !UNIQUE_PER_SCHOOL.includes(r.role as AdminEducationRole)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Cargos Administrativos Escolares
              </CardTitle>
              <CardDescription>
                Vincule servidores do RH a cargos administrativos nas escolas municipais
              </CardDescription>
            </div>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Vincular Cargo Administrativo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <Select value={filtroRole} onValueChange={setFiltroRole}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Filtrar por cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os cargos</SelectItem>
                {allAdminRoles.map(r => (
                  <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroEscola} onValueChange={setFiltroEscola}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Filtrar por escola" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as escolas</SelectItem>
                {escolas.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : rolesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <School className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Nenhum cargo administrativo vinculado</h3>
              <p className="text-sm text-muted-foreground">Clique em "Vincular Cargo Administrativo" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesFiltrados.map((role) => {
                  const label = roleLabels[role.role as AdminEducationRole] || role.role;
                  const color = roleColors[role.role as AdminEducationRole] || 'bg-muted text-muted-foreground';
                  return (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        {(role as any).profiles?.name || role.user_id.substring(0, 8) + "..."}
                        {(role as any).profiles?.email && (
                          <span className="block text-xs text-muted-foreground">{(role as any).profiles.email}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={color}>
                          <School className="h-3 w-3 mr-1" />
                          {label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {escolas.find(e => e.id === role.escola_id)?.nome || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(role.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(role)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover cargo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O servidor perderá as permissões de {label} nesta escola.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveRole(role.id)}>Remover</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Editar Cargo Administrativo Escolar' : 'Vincular Cargo Administrativo Escolar'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Altere o cargo ou a escola do servidor.'
                : 'Selecione um servidor do RH e vincule-o a um cargo administrativo escolar.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingRole && (
              <div className="space-y-2">
                <Label>Servidor do RH *</Label>
                {usuarioSelecionado ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                    <div>
                      <p className="font-medium">{usuarioSelecionado.nome}</p>
                      <p className="text-sm text-muted-foreground">{usuarioSelecionado.email}</p>
                      {usuarioSelecionado.cpf && (
                        <p className="text-xs text-muted-foreground">CPF: {usuarioSelecionado.cpf}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setVinculoDialogOpen(true)}>Alterar</Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full justify-start" onClick={() => setVinculoDialogOpen(true)}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Selecionar Servidor do RH
                  </Button>
                )}
              </div>
            )}

            {editingRole && (
              <div className="space-y-2">
                <Label>Servidor</Label>
                <div className="p-3 border rounded-md bg-muted/30">
                  <p className="font-medium">{(editingRole as any).profiles?.name || editingRole.user_id}</p>
                  {(editingRole as any).profiles?.email && (
                    <p className="text-sm text-muted-foreground">{(editingRole as any).profiles.email}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cargo Administrativo *</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as AdminEducationRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {allAdminRoles.map(r => (
                    <SelectItem key={r} value={r}>
                      <span className="flex items-center gap-2"><School className="h-4 w-4" /> {roleLabels[r]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Escola * (obrigatória)</Label>
              <Select value={formEscolaId} onValueChange={setFormEscolaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a escola" />
                </SelectTrigger>
                <SelectContent>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>{escola.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleAddRole}
              disabled={submitting || (!editingRole && !usuarioSelecionado) || !formRole || !formEscolaId}
            >
              {submitting ? 'Salvando...' : editingRole ? 'Atualizar' : 'Vincular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={vinculoDialogOpen}
        onOpenChange={setVinculoDialogOpen}
        onUsuarioSelecionado={(u) => { setUsuarioSelecionado(u); }}
        titulo="Selecionar Servidor para Cargo Administrativo Escolar"
        descricao="Busque um servidor cadastrado pelo RH para vinculá-lo a um cargo administrativo escolar."
      />
    </div>
  );
}
