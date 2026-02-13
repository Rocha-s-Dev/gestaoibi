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
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { useProfissionaisSaude } from "@/hooks/useProfissionaisSaude";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { UserPlus, Search, Stethoscope } from "lucide-react";

export default function GestaoSaudePublica() {
  const [vincularOpen, setVincularOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioRH | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    especialidade: "",
    registro_conselho: "",
    tipo_conselho: "CRM",
    carga_horaria_semanal: 40,
  });

  const { profissionais, isLoading, createProfissional } = useProfissionaisSaude();

  const handleUserSelected = (usuario: UsuarioRH) => {
    setSelectedUser(usuario);
    setVincularOpen(false);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    await createProfissional.mutateAsync({
      user_id: selectedUser.user_id,
      ...formData,
    });
    setDialogOpen(false);
    setSelectedUser(null);
    setFormData({ especialidade: "", registro_conselho: "", tipo_conselho: "CRM", carga_horaria_semanal: 40 });
  };

  const filteredProfissionais = profissionais.filter(
    (p) =>
      p.profile_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.especialidade?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="pacientes" className="text-sm p-3">Pacientes</TabsTrigger>
            <TabsTrigger value="unidades" className="text-sm p-3">Unidades de Saúde</TabsTrigger>
            <TabsTrigger value="profissionais" className="text-sm p-3">Profissionais</TabsTrigger>
            <TabsTrigger value="indicadores" className="text-sm p-3">Indicadores</TabsTrigger>
            <TabsTrigger value="metas" className="text-sm p-3">Metas</TabsTrigger>
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
                        placeholder="Buscar profissional..."
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
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Conselho</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Carga Horária</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfissionais.map((prof) => (
                        <TableRow key={prof.id}>
                          <TableCell className="font-medium">{prof.profile_nome}</TableCell>
                          <TableCell>{prof.profile_cpf || "—"}</TableCell>
                          <TableCell>{prof.especialidade || "—"}</TableCell>
                          <TableCell>{prof.tipo_conselho || "—"}</TableCell>
                          <TableCell>{prof.registro_conselho || "—"}</TableCell>
                          <TableCell>{prof.carga_horaria_semanal ? `${prof.carga_horaria_semanal}h` : "—"}</TableCell>
                          <TableCell>
                            <Badge variant={prof.status === "ativo" ? "default" : "secondary"}>
                              {prof.status || "ativo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredProfissionais.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
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
        </Tabs>

        <VincularUsuarioRH
          open={vincularOpen}
          onOpenChange={setVincularOpen}
          onUsuarioSelecionado={handleUserSelected}
          titulo="Vincular Profissional de Saúde"
          descricao="Busque e selecione um servidor do RH para vincular como profissional de saúde."
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Dados Profissionais</DialogTitle>
              <DialogDescription>
                Servidor: <strong>{selectedUser?.nome}</strong> — Informe os dados profissionais.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    placeholder="Ex: Clínica Geral"
                    required
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nº Registro Conselho</Label>
                  <Input
                    value={formData.registro_conselho}
                    onChange={(e) => setFormData({ ...formData, registro_conselho: e.target.value })}
                    required
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
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createProfissional.isPending}>Vincular</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
