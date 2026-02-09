import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Shield, UserCog, GraduationCap, School, Users, AlertTriangle, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";

type EducationRole = 'secretaria' | 'diretor' | 'coordenador' | 'professor' | 'responsavel';

interface UserEducationRole {
  id: string;
  user_id: string;
  role: EducationRole;
  escola_id: string | null;
  created_at: string;
  profile?: { name: string; email: string } | null;
}

interface Escola {
  id: string;
  nome: string;
}

const roleLabels: Record<EducationRole, string> = {
  secretaria: 'Secretaria',
  diretor: 'Diretor(a)',
  coordenador: 'Coordenador(a)',
  professor: 'Professor(a)',
  responsavel: 'Responsável',
};

const roleColors: Record<EducationRole, string> = {
  secretaria: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  diretor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  coordenador: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  professor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  responsavel: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const roleIcons: Record<EducationRole, React.ReactNode> = {
  secretaria: <Shield className="h-4 w-4" />,
  diretor: <School className="h-4 w-4" />,
  coordenador: <UserCog className="h-4 w-4" />,
  professor: <GraduationCap className="h-4 w-4" />,
  responsavel: <Users className="h-4 w-4" />,
};

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
  const [formRole, setFormRole] = useState<EducationRole | "">("");
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

    if (['diretor', 'coordenador', 'professor'].includes(formRole) && !formEscolaId) {
      toast.error('Selecione a escola para este papel');
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('user_education_roles' as any)
        .insert({
          user_id: usuarioSelecionado.user_id,
          role: formRole,
          escola_id: formEscolaId || null,
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

  const allRoles: EducationRole[] = ['secretaria', 'diretor', 'coordenador', 'professor', 'responsavel'];

  const estatisticas = {
    total: roles.length,
    ...Object.fromEntries(allRoles.map(r => [r, roles.filter(x => x.role === r).length])),
  };

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
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </CardContent>
        </Card>
        {allRoles.map(role => (
          <Card key={role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{roleLabels[role]}</CardTitle>
              {roleIcons[role]}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(estatisticas as any)[role] || 0}</div>
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
                <Shield className="h-5 w-5" />
                Administração de Papéis Educacionais
              </CardTitle>
              <CardDescription>
                Gerencie os papéis e permissões dos usuários no sistema educacional
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Atribuir Papel
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
                <SelectItem value="todos">Todos os papéis</SelectItem>
                {allRoles.map(r => (
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
              <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Nenhum papel atribuído</h3>
              <p className="text-sm text-muted-foreground">Clique em "Atribuir Papel" para começar.</p>
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
                {rolesFiltrados.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      {(role as any).profiles?.name || role.user_id.substring(0, 8) + "..."}
                      {(role as any).profiles?.email && (
                        <span className="block text-xs text-muted-foreground">{(role as any).profiles.email}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[role.role]}>
                        <span className="mr-1">{roleIcons[role.role]}</span>
                        {roleLabels[role.role]}
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
                              O usuário perderá as permissões associadas a este papel.
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Papel Educacional</DialogTitle>
            <DialogDescription>
              Selecione um servidor do RH e atribua o papel desejado.
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
              <Select value={formRole} onValueChange={(v) => setFormRole(v as EducationRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secretaria">
                    <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Secretaria (Acesso Total)</span>
                  </SelectItem>
                  <SelectItem value="diretor">
                    <span className="flex items-center gap-2"><School className="h-4 w-4" /> Diretor(a)</span>
                  </SelectItem>
                  <SelectItem value="coordenador">
                    <span className="flex items-center gap-2"><UserCog className="h-4 w-4" /> Coordenador(a)</span>
                  </SelectItem>
                  <SelectItem value="professor">
                    <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Professor(a)</span>
                  </SelectItem>
                  <SelectItem value="responsavel">
                    <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Responsável</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {['diretor', 'coordenador', 'professor'].includes(formRole) && (
              <div className="space-y-2">
                <Label>Escola *</Label>
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
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddRole} disabled={submitting || !usuarioSelecionado}>
              {submitting ? 'Atribuindo...' : 'Atribuir Papel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={vinculoDialogOpen}
        onOpenChange={setVinculoDialogOpen}
        onUsuarioSelecionado={(u) => { setUsuarioSelecionado(u); }}
        titulo="Selecionar Servidor para Papel Educacional"
        descricao="Busque um servidor cadastrado pelo RH."
      />
    </div>
  );
}
