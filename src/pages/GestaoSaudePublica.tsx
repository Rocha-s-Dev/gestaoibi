import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CadastroUnidadesSaude } from "@/components/saude/CadastroUnidadesSaude";
import { MonitoramentoIndicadores } from "@/components/saude/MonitoramentoIndicadores";
import { MetasSaudePublica } from "@/components/saude/MetasSaudePublica";
import { CadastroPacientes } from "@/components/saude/CadastroPacientes";
import { SolicitacaoTFD } from "@/components/saude/SolicitacaoTFD";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { useProfissionaisSaude } from "@/hooks/useProfissionaisSaude";
import { CARGOS_SAUDE_LABELS, type CargoSaude } from "@/hooks/useCargoSaude";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Search, Stethoscope, Ambulance, Edit, Pill, Syringe, ArrowRightLeft, FileText, Bed, Building2, Shield, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EstoqueFarmaceutico } from "@/components/saude/EstoqueFarmaceutico";
import { VacinacaoModule } from "@/components/saude/VacinacaoModule";
import { EncaminhamentosSaude } from "@/components/saude/EncaminhamentosSaude";
import { ExamesSaudeModule } from "@/components/saude/ExamesSaudeModule";
import { InternacoesModule } from "@/components/saude/InternacoesModule";
import { ProgramasFederaisModule } from "@/components/saude/ProgramasFederaisModule";
import { LGPDSaudeModule } from "@/components/saude/LGPDSaudeModule";

export default function GestaoSaudePublica() {
  const [vincularOpen, setVincularOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<UsuarioRH | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    cargo: "" as CargoSaude | "",
    especialidade: "",
    registro_conselho: "",
    tipo_conselho: "CRM",
    carga_horaria_semanal: 40,
    unidade_id: "",
  });

  const { profissionais, isLoading, createProfissional, updateProfissional, deleteProfissional } = useProfissionaisSaude();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profToDelete, setProfToDelete] = useState<{ id: string; nome: string } | null>(null);

  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades_saude_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("unidades_saude").select("id, nome, tipo").neq("status", "inativo").order("nome");
      if (error) throw error;
      return data || [];
    },
  });

  const handleUserSelected = (usuario: UsuarioRH) => {
    setSelectedUser(usuario);
    setEditingProfissional(null);
    setVincularOpen(false);
    setDialogOpen(true);
  };

  const handleEdit = (prof: any) => {
    setEditingProfissional(prof);
    setSelectedUser(null);
    setFormData({
      cargo: prof.cargo || "",
      especialidade: prof.especialidade || "",
      registro_conselho: prof.registro_conselho || "",
      tipo_conselho: prof.tipo_conselho || "CRM",
      carga_horaria_semanal: prof.carga_horaria_semanal || 40,
      unidade_id: prof.unidade_id || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setEditingProfissional(null);
    setFormData({
      cargo: "",
      especialidade: "",
      registro_conselho: "",
      tipo_conselho: "CRM",
      carga_horaria_semanal: 40,
      unidade_id: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cargo) return;

    if (editingProfissional) {
      await updateProfissional.mutateAsync({
        id: editingProfissional.id,
        cargo: formData.cargo,
        especialidade: formData.especialidade || null,
        registro_conselho: formData.registro_conselho || null,
        tipo_conselho: formData.tipo_conselho || null,
        carga_horaria_semanal: formData.carga_horaria_semanal,
        unidade_id: formData.unidade_id || null,
      });
    } else if (selectedUser) {
      await createProfissional.mutateAsync({
        user_id: selectedUser.user_id,
        cargo: formData.cargo as CargoSaude,
        especialidade: formData.especialidade || undefined,
        registro_conselho: formData.registro_conselho || undefined,
        tipo_conselho: formData.tipo_conselho || undefined,
        carga_horaria_semanal: formData.carga_horaria_semanal,
        unidade_id: formData.unidade_id || undefined,
      });
    }
    resetForm();
  };

  const filteredProfissionais = profissionais.filter(
    (p) =>
      p.profile_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.especialidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cargo && CARGOS_SAUDE_LABELS[p.cargo]?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Saúde Pública</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de gestão e acompanhamento dos serviços de saúde pública
          </p>
        </header>

        <Tabs defaultValue="pacientes">
          <TabsList className="flex flex-wrap w-full h-auto gap-1">
            <TabsTrigger value="pacientes" className="text-sm p-3">Pacientes</TabsTrigger>
            <TabsTrigger value="unidades" className="text-sm p-3">Unidades de Saúde</TabsTrigger>
            <TabsTrigger value="profissionais" className="text-sm p-3">Profissionais</TabsTrigger>
            <TabsTrigger value="estoque" className="text-sm p-3 flex items-center gap-1"><Pill className="h-3 w-3" />Estoque</TabsTrigger>
            <TabsTrigger value="vacinacao" className="text-sm p-3 flex items-center gap-1"><Syringe className="h-3 w-3" />Vacinação</TabsTrigger>
            <TabsTrigger value="encaminhamentos" className="text-sm p-3 flex items-center gap-1"><ArrowRightLeft className="h-3 w-3" />Regulação</TabsTrigger>
            <TabsTrigger value="exames" className="text-sm p-3 flex items-center gap-1"><FileText className="h-3 w-3" />Exames</TabsTrigger>
            <TabsTrigger value="internacoes" className="text-sm p-3 flex items-center gap-1"><Bed className="h-3 w-3" />Internações</TabsTrigger>
            <TabsTrigger value="tfd" className="text-sm p-3 flex items-center gap-1"><Ambulance className="h-3 w-3" />TFD</TabsTrigger>
            <TabsTrigger value="programas" className="text-sm p-3 flex items-center gap-1"><Building2 className="h-3 w-3" />Programas</TabsTrigger>
            <TabsTrigger value="indicadores" className="text-sm p-3">Indicadores</TabsTrigger>
            <TabsTrigger value="metas" className="text-sm p-3">Metas</TabsTrigger>
            <TabsTrigger value="lgpd" className="text-sm p-3 flex items-center gap-1"><Shield className="h-3 w-3" />LGPD</TabsTrigger>
          </TabsList>

          <TabsContent value="pacientes" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Cadastro de Pacientes</CardTitle></CardHeader>
              <CardContent><CadastroPacientes /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unidades" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Registro de Unidades e Serviços de Saúde</CardTitle></CardHeader>
              <CardContent><CadastroUnidadesSaude /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profissionais" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Profissionais de Saúde
                  </CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar profissional ou cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button onClick={() => setVincularOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Vincular Profissional
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Conselho</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Carga Horária</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfissionais.map((prof) => (
                        <TableRow key={prof.id}>
                          <TableCell className="font-medium">{prof.profile_nome}</TableCell>
                          <TableCell>{prof.profile_cpf || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="whitespace-nowrap">
                              {prof.cargo ? CARGOS_SAUDE_LABELS[prof.cargo] : "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>{prof.especialidade || "—"}</TableCell>
                          <TableCell>
                            {prof.tipo_conselho && prof.registro_conselho
                              ? `${prof.tipo_conselho} ${prof.registro_conselho}`
                              : "—"}
                          </TableCell>
                          <TableCell>{prof.unidade_nome || "—"}</TableCell>
                          <TableCell>{prof.carga_horaria_semanal ? `${prof.carga_horaria_semanal}h` : "—"}</TableCell>
                          <TableCell>
                            <Badge variant={prof.status === "ativo" ? "default" : "secondary"}>
                              {prof.status || "ativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(prof)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setProfToDelete({ id: prof.id, nome: prof.profile_nome });
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredProfissionais.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">
                            Nenhum profissional encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estoque" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5" />Estoque Farmacêutico</CardTitle></CardHeader>
              <CardContent><EstoqueFarmaceutico /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vacinacao" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Syringe className="h-5 w-5" />Vacinação</CardTitle></CardHeader>
              <CardContent><VacinacaoModule /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tfd" className="mt-6">
            <Card>
              <CardContent className="pt-6"><SolicitacaoTFD /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encaminhamentos" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5" />Regulação / Encaminhamentos</CardTitle></CardHeader>
              <CardContent><EncaminhamentosSaude /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exames" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Controle de Exames</CardTitle></CardHeader>
              <CardContent><ExamesSaudeModule /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="internacoes" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bed className="h-5 w-5" />Gestão de Internações</CardTitle></CardHeader>
              <CardContent><InternacoesModule /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programas" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Programas Federais de Saúde</CardTitle></CardHeader>
              <CardContent><ProgramasFederaisModule /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="indicadores" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Acompanhamento de Indicadores de Saúde Pública</CardTitle></CardHeader>
              <CardContent><MonitoramentoIndicadores /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Gestão de Metas de Saúde Pública</CardTitle></CardHeader>
              <CardContent><MetasSaudePublica /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lgpd" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Segurança e LGPD</CardTitle></CardHeader>
              <CardContent><LGPDSaudeModule /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <VincularUsuarioRH
          open={vincularOpen}
          onOpenChange={setVincularOpen}
          onUsuarioSelecionado={handleUserSelected}
          titulo="Vincular Profissional de Saúde"
          descricao="Busque e selecione um servidor do RH para vincular como profissional de saúde."
        />

        {/* Dialog de cadastro/edição de profissional */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProfissional ? "Editar Profissional" : "Dados Profissionais"}</DialogTitle>
              <DialogDescription>
                {editingProfissional
                  ? `Editando: ${editingProfissional.profile_nome}`
                  : <>Servidor: <strong>{selectedUser?.nome}</strong> — Informe os dados profissionais.</>
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cargo na Saúde <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.cargo}
                  onValueChange={(v) => setFormData({ ...formData, cargo: v as CargoSaude })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(CARGOS_SAUDE_LABELS) as [CargoSaude, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unidade de Saúde <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.unidade_id}
                  onValueChange={(v) => setFormData({ ...formData, unidade_id: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome} ({u.tipo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    placeholder="Ex: Clínica Geral"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo Conselho</Label>
                  <Select value={formData.tipo_conselho} onValueChange={(v) => setFormData({ ...formData, tipo_conselho: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRM">CRM</SelectItem>
                      <SelectItem value="CRO">CRO</SelectItem>
                      <SelectItem value="COREN">COREN</SelectItem>
                      <SelectItem value="CRF">CRF</SelectItem>
                      <SelectItem value="CREFITO">CREFITO</SelectItem>
                      <SelectItem value="CRP">CRP</SelectItem>
                      <SelectItem value="CRESS">CRESS</SelectItem>
                      <SelectItem value="N/A">Não se aplica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nº Registro Conselho</Label>
                  <Input
                    value={formData.registro_conselho}
                    onChange={(e) => setFormData({ ...formData, registro_conselho: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carga Horária Semanal</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.carga_horaria_semanal}
                    onChange={(e) => setFormData({ ...formData, carga_horaria_semanal: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button
                  type="submit"
                  disabled={createProfissional.isPending || updateProfissional.isPending || !formData.cargo || !formData.unidade_id}
                >
                  {editingProfissional ? "Salvar" : "Vincular"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Profissional</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o profissional <strong>{profToDelete?.nome}</strong>? 
                O registro será removido da equipe de saúde. Isso não afeta o cadastro do servidor no RH.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (profToDelete) {
                    deleteProfissional.mutate(profToDelete.id);
                    setDeleteDialogOpen(false);
                    setProfToDelete(null);
                  }
                }}
                disabled={deleteProfissional.isPending}
              >
                {deleteProfissional.isPending ? "Removendo..." : "Remover"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
