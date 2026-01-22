import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProntuarios, usePacientes, Prontuario, Paciente } from "@/hooks/useSaude";
import { ProntuarioDialog } from "./ProntuarioDialog";
import {
  Search,
  Plus,
  FileText,
  User,
  Calendar,
  Stethoscope,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ProntuarioEletronico() {
  const { prontuarios, loading: loadingProntuarios, createProntuario, updateProntuario } = useProntuarios();
  const { pacientes, loading: loadingPacientes, searchPacientes } = usePacientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProntuario, setSelectedProntuario] = useState<Prontuario | null>(null);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [pacientesFiltrados, setPacientesFiltrados] = useState<Paciente[]>([]);
  const [buscando, setBuscando] = useState(false);

  const handleSearchPaciente = async () => {
    if (!searchTerm.trim()) {
      setPacientesFiltrados([]);
      return;
    }
    setBuscando(true);
    try {
      const results = await searchPacientes(searchTerm);
      setPacientesFiltrados(results);
    } finally {
      setBuscando(false);
    }
  };

  const handleSelectPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setPacientesFiltrados([]);
    setSearchTerm("");
  };

  const prontuariosPaciente = selectedPaciente
    ? prontuarios.filter((p) => p.paciente_id === selectedPaciente.id)
    : [];

  const handleCreate = () => {
    if (!selectedPaciente) {
      toast.error("Selecione um paciente primeiro");
      return;
    }
    setSelectedProntuario(null);
    setDialogOpen(true);
  };

  const handleView = (prontuario: Prontuario) => {
    setSelectedProntuario(prontuario);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<Prontuario>) => {
    try {
      if (selectedProntuario) {
        await updateProntuario(selectedProntuario.id, data);
        toast.success("Prontuário atualizado com sucesso");
      } else {
        await createProntuario({
          ...data,
          paciente_id: selectedPaciente!.id,
        } as Omit<Prontuario, "id" | "created_at" | "updated_at" | "paciente" | "profissional">);
        toast.success("Prontuário registrado com sucesso");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar prontuário");
    }
  };

  const getTipoAtendimentoBadge = (tipo: string) => {
    const config: Record<string, { label: string; className: string }> = {
      consulta: { label: "Consulta", className: "bg-blue-100 text-blue-800" },
      emergencia: { label: "Emergência", className: "bg-red-100 text-red-800" },
      retorno: { label: "Retorno", className: "bg-green-100 text-green-800" },
      procedimento: { label: "Procedimento", className: "bg-purple-100 text-purple-800" },
      exame: { label: "Exame", className: "bg-orange-100 text-orange-800" },
    };
    const c = config[tipo] || config.consulta;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return "-";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return `${idade} anos`;
  };

  const loading = loadingProntuarios || loadingPacientes;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Busca de Paciente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou Cartão SUS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchPaciente();
                  }
                }}
              />
            </div>
            <Button onClick={handleSearchPaciente} disabled={buscando}>
              {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
            </Button>
          </div>

          {/* Resultados da busca */}
          {pacientesFiltrados.length > 0 && (
            <div className="mt-4 border rounded-lg divide-y">
              {pacientesFiltrados.map((paciente) => (
                <div
                  key={paciente.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSelectPaciente(paciente)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{paciente.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        CPF: {paciente.cpf || "Não informado"} • SUS: {paciente.cartao_sus || "Não informado"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paciente Selecionado */}
      {selectedPaciente && (
        <>
          {/* Informações do Paciente */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Paciente: {selectedPaciente.nome}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  CPF: {selectedPaciente.cpf || "-"} • Cartão SUS: {selectedPaciente.cartao_sus || "-"} •{" "}
                  {calcularIdade(selectedPaciente.data_nascimento)} • {selectedPaciente.sexo || "-"}
                </p>
              </div>
              <Button onClick={() => setSelectedPaciente(null)} variant="outline">
                Trocar Paciente
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedPaciente.alergias && selectedPaciente.alergias.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-destructive">Alergias:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPaciente.alergias.map((a, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPaciente.condicoes_cronicas && selectedPaciente.condicoes_cronicas.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Condições Crônicas:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPaciente.condicoes_cronicas.map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPaciente.medicamentos_uso_continuo && selectedPaciente.medicamentos_uso_continuo.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Medicamentos Contínuos:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPaciente.medicamentos_uso_continuo.map((m, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Atendimentos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Histórico de Atendimentos</CardTitle>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Atendimento
              </Button>
            </CardHeader>
            <CardContent>
              {prontuariosPaciente.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum atendimento registrado para este paciente
                </p>
              ) : (
                <div className="space-y-4">
                  {prontuariosPaciente.map((prontuario) => (
                    <div
                      key={prontuario.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleView(prontuario)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {getTipoAtendimentoBadge(prontuario.tipo_atendimento)}
                            <span className="text-sm text-muted-foreground">
                              {format(parseISO(prontuario.data_atendimento), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                          <p className="mt-1 font-medium">
                            {prontuario.queixa_principal || "Sem queixa registrada"}
                          </p>
                          {prontuario.hipotese_diagnostica && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Hipótese: {prontuario.hipotese_diagnostica}
                            </p>
                          )}
                          {prontuario.profissional && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Stethoscope className="h-3 w-3" />
                              {prontuario.profissional.nome}
                              {prontuario.profissional.registro_conselho && (
                                <span> - {prontuario.profissional.registro_conselho}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <ProntuarioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        prontuario={selectedProntuario}
        paciente={selectedPaciente}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
