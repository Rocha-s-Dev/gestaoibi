import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Shield, School, AlertTriangle, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";

// REGRA INSTITUCIONAL: Apenas Diretor e Vice-Diretor são gerenciados aqui.
// Secretário → criado pelo RH | Professor/Coordenador → tela de cadastro de professores
type AllowedEducationRole = 'diretor' | 'vice_diretor';

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

const roleLabels: Record<AllowedEducationRole, string> = {
  diretor: 'Diretor(a)',
  vice_diretor: 'Vice-Diretor(a)',
};

const roleColors: Record<AllowedEducationRole, string> = {
  diretor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  vice_diretor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

const allowedRoles: AllowedEducationRole[] = ['diretor', 'vice_diretor'];

export function AdminPapeisEducacionais() {
  const [roles, setRoles] = useState<UserEducationRole[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const [filtroRole, setFiltroRole] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);

  // Form state
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioRH | null>(null);
  const [formRole, setFormRole] = useState<AllowedEducationRole | "">("");
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
        .in('role', ['diretor', 'vice_diretor'])
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
    if (!usuarioSelecionado || !formRole) {
      toast.error('Selecione um servidor e o papel');
      return;
    }

    // REGRA INSTITUCIONAL: Diretor/Vice OBRIGATORIAMENTE devem ter escola vinculada
    if (!formEscolaId) {
      toast.error('Escola é obrigatória para Diretor/Vice-Diretor');
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('user_education_roles' as any)
        .insert({
          user_id: usuarioSelecionado.user_id,
          role: formRole,
          escola_id: formEscolaId,
        });

      if (insertError) throw insertError;

      toast.success('Papel atribuído com sucesso');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error('Erro ao atribuir papel:', err);
      toast.error(err.message || 'Erro ao atribuir papel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_education_roles' as any)
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Papel removido');
      setRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (err) {
      console.error('Erro ao remover papel:', err);
      toast.error('Erro ao remover papel');
    }
  };

  const resetForm = () => {
    setUsuarioSelecionado(null);
    setFormRole("");
    setFormEscolaId("");
  };

  const rolesFiltrados = roles.filter(role => {
    if (filtroRole !== "todos" && role.role !== filtroRole) return false;
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
      {/* Info institucional */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Regra Institucional</AlertTitle>
        <AlertDescription>
          Esta aba gerencia exclusivamente <strong>Diretor(a)</strong> e <strong>Vice-Diretor(a)</strong> de escolas.
          Professores e Coordenadores são gerenciados na aba "Cadastro → Professores".
          Secretários são criados exclusivamente pelo Departamento de RH.
        </AlertDescription>
      </Alert>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        {allowedRoles.map(role => (
          <Card key={role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{roleLabels[role]}</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.filter(r => r.role === role).length}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Diretores e Vice-Diretores
              </CardTitle>
              <CardDescription>
                Vincule servidores do RH como Diretor ou Vice-Diretor de escolas
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Vincular Diretor/Vice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <Select value={filtroRole} onValueChange={setFiltroRole}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {allowedRoles.map(r => (
                  <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
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
              <h3 className="text-lg font-medium">Nenhum diretor/vice vinculado</h3>
              <p className="text-sm text-muted-foreground">Clique em "Vincular Diretor/Vice" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servidor</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesFiltrados.map((role) => {
                  const label = roleLabels[role.role as AllowedEducationRole] || role.role;
                  const color = roleColors[role.role as AllowedEducationRole] || 'bg-gray-100 text-gray-800';
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
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover papel?</AlertDialogTitle>
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

      {/* Dialog - apenas Diretor/Vice-Diretor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Diretor/Vice-Diretor</DialogTitle>
            <DialogDescription>
              Selecione um servidor do RH e vincule-o como Diretor ou Vice-Diretor de uma escola.
              A escola é obrigatória.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
              <Label>Papel *</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as AllowedEducationRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diretor">
                    <span className="flex items-center gap-2"><School className="h-4 w-4" /> Diretor(a)</span>
                  </SelectItem>
                  <SelectItem value="vice_diretor">
                    <span className="flex items-center gap-2"><School className="h-4 w-4" /> Vice-Diretor(a)</span>
                  </SelectItem>
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
            <Button onClick={handleAddRole} disabled={submitting || !usuarioSelecionado || !formRole || !formEscolaId}>
              {submitting ? 'Vinculando...' : 'Vincular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={vinculoDialogOpen}
        onOpenChange={setVinculoDialogOpen}
        onUsuarioSelecionado={(u) => { setUsuarioSelecionado(u); }}
        titulo="Selecionar Servidor para Direção Escolar"
        descricao="Busque um servidor cadastrado pelo RH para vinculá-lo como Diretor ou Vice-Diretor."
      />
    </div>
  );
}
