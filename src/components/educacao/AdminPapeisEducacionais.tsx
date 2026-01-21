import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, Plus, Trash2, Shield, UserCog, GraduationCap, School, Users, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type EducationRole = 'secretaria' | 'diretor' | 'professor' | 'responsavel';

interface UserEducationRole {
  id: string;
  user_id: string;
  role: EducationRole;
  escola_id: string | null;
  created_at: string;
}

interface Escola {
  id: string;
  nome: string;
}

interface Professor {
  id: string;
  nome: string;
}

const roleLabels: Record<EducationRole, string> = {
  secretaria: 'Secretaria',
  diretor: 'Diretor(a)',
  professor: 'Professor(a)',
  responsavel: 'Responsável',
};

const roleColors: Record<EducationRole, string> = {
  secretaria: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  diretor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  professor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  responsavel: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

const roleIcons: Record<EducationRole, React.ReactNode> = {
  secretaria: <Shield className="h-4 w-4" />,
  diretor: <School className="h-4 w-4" />,
  professor: <GraduationCap className="h-4 w-4" />,
  responsavel: <Users className="h-4 w-4" />,
};

export function AdminPapeisEducacionais() {
  const [roles, setRoles] = useState<UserEducationRole[]>([]);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<EducationRole | "">("");
  const [formEscolaId, setFormEscolaId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Try to fetch roles - table may not exist yet
      const { data: rolesResult, error: directError } = await supabase
        .from('user_education_roles' as any)
        .select('*')
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

      // Fetch escolas
      const { data: escolasData } = await supabase
        .from('escolas')
        .select('id, nome')
        .order('nome');

      // Fetch professores
      const { data: professoresData } = await supabase
        .from('professores')
        .select('id, nome')
        .order('nome');

      setEscolas(escolasData || []);
      setProfessores(professoresData || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!formEmail || !formRole) {
      toast.error('Preencha email e papel');
      return;
    }

    if ((formRole === 'diretor' || formRole === 'professor') && !formEscolaId) {
      toast.error('Selecione a escola para este papel');
      return;
    }

    setSubmitting(true);
    try {
      // Find user by email in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formEmail)
        .maybeSingle();

      if (profileError || !profileData) {
        toast.error('Usuário não encontrado. Verifique se o email está correto e se o usuário já está cadastrado.');
        setSubmitting(false);
        return;
      }

      // Insert role
      const { error: insertError } = await supabase
        .from('user_education_roles' as any)
        .insert({
          user_id: profileData.id,
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
    setFormEmail("");
    setFormRole("");
    setFormEscolaId("");
  };

  const rolesFiltrados = roles.filter(role => {
    if (filtroRole !== "todos" && role.role !== filtroRole) return false;
    return true;
  });

  const estatisticas = {
    total: roles.length,
    secretaria: roles.filter(r => r.role === 'secretaria').length,
    diretor: roles.filter(r => r.role === 'diretor').length,
    professor: roles.filter(r => r.role === 'professor').length,
    responsavel: roles.filter(r => r.role === 'responsavel').length,
  };

  if (!tableExists) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Migração Necessária</AlertTitle>
        <AlertDescription>
          A tabela de papéis educacionais ainda não foi criada. Execute a migração SQL 
          <code className="mx-1 px-1 bg-muted rounded">20260121_education_rls_policies.sql</code> 
          no Supabase Dashboard para habilitar esta funcionalidade.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
          </CardContent>
        </Card>
        {(['secretaria', 'diretor', 'professor', 'responsavel'] as EducationRole[]).map(role => (
          <Card key={role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{roleLabels[role]}</CardTitle>
              {roleIcons[role]}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estatisticas[role]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Papéis */}
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
          {/* Filtros */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filtroRole} onValueChange={setFiltroRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os papéis</SelectItem>
                <SelectItem value="secretaria">Secretaria</SelectItem>
                <SelectItem value="diretor">Diretor(a)</SelectItem>
                <SelectItem value="professor">Professor(a)</SelectItem>
                <SelectItem value="responsavel">Responsável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rolesFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">Nenhum papel atribuído</h3>
              <p className="text-sm text-muted-foreground">
                Clique em "Atribuir Papel" para começar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rolesFiltrados.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium font-mono text-xs">
                      {role.user_id.substring(0, 8)}...
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
                            <AlertDialogAction onClick={() => handleRemoveRole(role.id)}>
                              Remover
                            </AlertDialogAction>
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

      {/* Dialog para adicionar papel */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Papel Educacional</DialogTitle>
            <DialogDescription>
              Selecione o usuário e o papel que deseja atribuir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Usuário</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@email.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Papel</Label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as EducationRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secretaria">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Secretaria (Acesso Total)
                    </span>
                  </SelectItem>
                  <SelectItem value="diretor">
                    <span className="flex items-center gap-2">
                      <School className="h-4 w-4" /> Diretor(a) (Sua Escola)
                    </span>
                  </SelectItem>
                  <SelectItem value="professor">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Professor(a) (Suas Turmas)
                    </span>
                  </SelectItem>
                  <SelectItem value="responsavel">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Responsável (Seus Filhos)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formRole === 'diretor' || formRole === 'professor') && (
              <div className="space-y-2">
                <Label htmlFor="escola">Escola</Label>
                <Select value={formEscolaId} onValueChange={setFormEscolaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddRole} disabled={submitting}>
              {submitting ? 'Atribuindo...' : 'Atribuir Papel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
