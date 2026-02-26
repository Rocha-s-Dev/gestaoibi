import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { UserPlus, Search, Edit, Trash2, Users, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SMS_ID = "19d25d5c-f41c-4a8e-9152-4926296d36b8";

interface CargoSecretaria {
  id: string;
  nome: string;
  nivel: string;
  ativo: boolean;
}

interface UnidadeSaude {
  id: string;
  nome: string;
  tipo: string;
}

interface MembroEquipe {
  id: string;
  user_id: string;
  cargo_secretaria_id: string | null;
  secretaria_id: string | null;
  unidade_saude_id: string | null;
  situacao: string;
  data_admissao: string;
  matricula: string | null;
  profile_nome: string;
  profile_cpf: string;
  cargo_nome: string | null;
  cargo_nivel: string | null;
  unidade_nome: string | null;
}

export function EquipeSaude() {
  const { isAdmin, isPrefeito, isGestorRH } = useSecretariaContext();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterUnidade, setFilterUnidade] = useState<string>("all");
  const [vincularOpen, setVincularOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioRH | null>(null);
  const [editingVinculo, setEditingVinculo] = useState<MembroEquipe | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; nome: string } | null>(null);

  const [formData, setFormData] = useState({
    cargo_secretaria_id: "",
    unidade_saude_id: "", // "" = sede administrativa
  });

  const podeGerenciar = isAdmin || isPrefeito;
  const somenteVisualiza = isGestorRH && !isAdmin && !isPrefeito;

  // Fetch cargos de APOIO da SMS (técnicos ficam na aba Profissionais)
  const { data: cargos = [] } = useQuery({
    queryKey: ["cargos_secretaria_sms_apoio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cargos_secretaria")
        .select("id, nome, nivel, ativo")
        .eq("secretaria_id", SMS_ID)
        .eq("ativo", true)
        .eq("nivel", "apoio")
        .order("nome");
      if (error) throw error;
      return data as CargoSecretaria[];
    },
  });

  // Fetch unidades de saúde ativas
  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades_saude_equipe"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unidades_saude")
        .select("id, nome, tipo")
        .neq("status", "inativo")
        .order("nome");
      if (error) throw error;
      return data as UnidadeSaude[];
    },
  });

  // Fetch membros da equipe (vínculos funcionais da SMS)
  const { data: membros = [], isLoading } = useQuery({
    queryKey: ["equipe_saude", filterUnidade],
    queryFn: async () => {
      let query = supabase
        .from("vinculos_funcionais")
        .select(`
          id, user_id, cargo_secretaria_id, secretaria_id, unidade_saude_id, 
          situacao, data_admissao, matricula,
          profiles:user_id(name, cpf),
          cargos_secretaria:cargo_secretaria_id(nome, nivel),
          unidades_saude:unidade_saude_id(nome)
        `)
        .eq("secretaria_id", SMS_ID)
        .order("created_at", { ascending: false });

      if (filterUnidade && filterUnidade !== "all") {
        if (filterUnidade === "sede") {
          query = query.is("unidade_saude_id", null);
        } else {
          query = query.eq("unidade_saude_id", filterUnidade);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((v: any) => ({
        id: v.id,
        user_id: v.user_id,
        cargo_secretaria_id: v.cargo_secretaria_id,
        secretaria_id: v.secretaria_id,
        unidade_saude_id: v.unidade_saude_id,
        situacao: v.situacao,
        data_admissao: v.data_admissao,
        matricula: v.matricula,
        profile_nome: v.profiles?.name || "—",
        profile_cpf: v.profiles?.cpf || "",
        cargo_nome: v.cargos_secretaria?.nome || null,
        cargo_nivel: v.cargos_secretaria?.nivel || null,
        unidade_nome: v.unidades_saude?.nome || null,
      })) as MembroEquipe[];
    },
  });

  const filteredMembros = membros.filter((m) =>
    m.profile_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cargo_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.matricula?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const vincularMutation = useMutation({
    mutationFn: async (data: {
      user_id: string;
      cargo_secretaria_id: string;
      unidade_saude_id: string | null;
    }) => {
      // Check for existing active vinculo in SMS
      const { data: existing } = await supabase
        .from("vinculos_funcionais")
        .select("id")
        .eq("user_id", data.user_id)
        .eq("secretaria_id", SMS_ID)
        .eq("situacao", "ativo")
        .limit(1);

      if (existing && existing.length > 0) {
        throw new Error("Este servidor já possui um vínculo ativo na Secretaria de Saúde.");
      }

      const { error } = await supabase
        .from("vinculos_funcionais")
        .insert({
          user_id: data.user_id,
          secretaria_id: SMS_ID,
          cargo_secretaria_id: data.cargo_secretaria_id,
          unidade_saude_id: data.unidade_saude_id,
          data_admissao: new Date().toISOString().split("T")[0],
          situacao: "ativo",
          regime: "estatutario",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipe_saude"] });
      toast.success("Profissional vinculado à equipe!");
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao vincular profissional");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      cargo_secretaria_id: string;
      unidade_saude_id: string | null;
    }) => {
      const { error } = await supabase
        .from("vinculos_funcionais")
        .update({
          cargo_secretaria_id: data.cargo_secretaria_id,
          unidade_saude_id: data.unidade_saude_id,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipe_saude"] });
      toast.success("Vínculo atualizado!");
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar vínculo"),
  });

  const inativarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vinculos_funcionais")
        .update({ situacao: "inativo" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipe_saude"] });
      toast.success("Vínculo inativado!");
      setDeleteDialogOpen(false);
      setToDelete(null);
    },
    onError: () => toast.error("Erro ao inativar vínculo"),
  });

  const handleUserSelected = (usuario: UsuarioRH) => {
    setSelectedUser(usuario);
    setEditingVinculo(null);
    setVincularOpen(false);
    setFormData({ cargo_secretaria_id: "", unidade_saude_id: "" });
    setDialogOpen(true);
  };

  const handleEdit = (membro: MembroEquipe) => {
    setEditingVinculo(membro);
    setSelectedUser(null);
    setFormData({
      cargo_secretaria_id: membro.cargo_secretaria_id || "",
      unidade_saude_id: membro.unidade_saude_id || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setEditingVinculo(null);
    setFormData({ cargo_secretaria_id: "", unidade_saude_id: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cargo_secretaria_id) return;

    const unidadeId = formData.unidade_saude_id || null;

    if (editingVinculo) {
      await updateMutation.mutateAsync({
        id: editingVinculo.id,
        cargo_secretaria_id: formData.cargo_secretaria_id,
        unidade_saude_id: unidadeId,
      });
    } else if (selectedUser) {
      await vincularMutation.mutateAsync({
        user_id: selectedUser.user_id,
        cargo_secretaria_id: formData.cargo_secretaria_id,
        unidade_saude_id: unidadeId,
      });
    }
  };

  const nivelLabel = (nivel: string | null) => {
    const map: Record<string, string> = {
      estrategico: "Estratégico",
      gerencial: "Gerencial",
      operacional: "Operacional",
      apoio: "Apoio",
    };
    return nivel ? map[nivel] || nivel : "—";
  };

  const cargosByNivel = cargos.reduce((acc, c) => {
    const n = c.nivel;
    if (!acc[n]) acc[n] = [];
    acc[n].push(c);
    return acc;
  }, {} as Record<string, CargoSecretaria[]>);

  const nivelOrder = ["estrategico", "gerencial", "operacional", "apoio"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo ou matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-72"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterUnidade} onValueChange={setFilterUnidade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as lotações</SelectItem>
                <SelectItem value="sede">Sede Administrativa</SelectItem>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {podeGerenciar && (
          <Button onClick={() => setVincularOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Vincular Profissional
          </Button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Badge variant="outline">Total: {membros.length}</Badge>
        <Badge variant="default">
          Ativos: {membros.filter((m) => m.situacao === "ativo").length}
        </Badge>
        <Badge variant="secondary">
          Inativos: {membros.filter((m) => m.situacao !== "ativo").length}
        </Badge>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando equipe...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Lotação</TableHead>
              <TableHead>Status</TableHead>
              {podeGerenciar && <TableHead className="w-20">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembros.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.profile_nome}</TableCell>
                <TableCell>{m.profile_cpf || "—"}</TableCell>
                <TableCell>{m.matricula || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {m.cargo_nome || "—"}
                  </Badge>
                </TableCell>
                <TableCell>{nivelLabel(m.cargo_nivel)}</TableCell>
                <TableCell>{m.unidade_nome || "Sede Administrativa"}</TableCell>
                <TableCell>
                  <Badge variant={m.situacao === "ativo" ? "default" : "secondary"}>
                    {m.situacao || "ativo"}
                  </Badge>
                </TableCell>
                {podeGerenciar && (
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {m.situacao === "ativo" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setToDelete({ id: m.id, nome: m.profile_nome });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {filteredMembros.length === 0 && (
              <TableRow>
                <TableCell colSpan={podeGerenciar ? 8 : 7} className="text-center text-muted-foreground">
                  Nenhum membro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Vincular usuario RH */}
      <VincularUsuarioRH
        open={vincularOpen}
        onOpenChange={setVincularOpen}
        onUsuarioSelecionado={handleUserSelected}
        titulo="Vincular à Equipe da Saúde"
        descricao="Selecione um servidor do RH para vincular à Secretaria de Saúde."
      />

      {/* Dialog de vínculo */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVinculo ? "Alterar Lotação / Cargo" : "Vincular Profissional"}
            </DialogTitle>
            <DialogDescription>
              {editingVinculo
                ? `Editando: ${editingVinculo.profile_nome}`
                : <>Servidor: <strong>{selectedUser?.nome}</strong></>}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Cargo <span className="text-destructive">*</span></Label>
              <Select
                value={formData.cargo_secretaria_id}
                onValueChange={(v) => setFormData({ ...formData, cargo_secretaria_id: v })}
                required
              >
                <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
                <SelectContent>
                  {nivelOrder.map((nivel) =>
                    cargosByNivel[nivel]?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        [{nivelLabel(nivel)}] {c.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Local de Lotação</Label>
              <Select
                value={formData.unidade_saude_id}
                onValueChange={(v) => setFormData({ ...formData, unidade_saude_id: v === "sede" ? "" : v })}
              >
                <SelectTrigger><SelectValue placeholder="Sede Administrativa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sede">Sede Administrativa (Secretaria)</SelectItem>
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome} ({u.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button
                type="submit"
                disabled={vincularMutation.isPending || updateMutation.isPending || !formData.cargo_secretaria_id}
              >
                {editingVinculo ? "Salvar" : "Vincular"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de inativação */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar Vínculo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja inativar o vínculo de <strong>{toDelete?.nome}</strong> na Secretaria de Saúde?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && inativarMutation.mutate(toDelete.id)}
              disabled={inativarMutation.isPending}
            >
              {inativarMutation.isPending ? "Inativando..." : "Inativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
