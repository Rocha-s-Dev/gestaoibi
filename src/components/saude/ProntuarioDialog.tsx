import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Prontuario, Paciente, useProfissionaisSaude, useUnidadesSaude } from "@/hooks/useSaude";
import { Plus, X } from "lucide-react";
import { format } from "date-fns";

interface ProntuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prontuario: Prontuario | null;
  paciente: Paciente | null;
  onSubmit: (data: Partial<Prontuario>) => void;
}

export function ProntuarioDialog({
  open,
  onOpenChange,
  prontuario,
  paciente,
  onSubmit,
}: ProntuarioDialogProps) {
  const { profissionais } = useProfissionaisSaude();
  const { unidades } = useUnidadesSaude();

  const [formData, setFormData] = useState({
    tipo_atendimento: "consulta" as Prontuario["tipo_atendimento"],
    profissional_id: "",
    unidade_id: "",
    data_atendimento: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    queixa_principal: "",
    historia_doenca_atual: "",
    sinais_vitais: {
      pressao: "",
      temperatura: "",
      peso: "",
      altura: "",
      frequencia_cardiaca: "",
      frequencia_respiratoria: "",
    },
    hipotese_diagnostica: "",
    cid_principal: "",
    conduta: "",
    observacoes: "",
    prescricao_medicamentos: [] as Array<{ medicamento: string; dosagem: string; posologia: string; duracao: string }>,
    solicitacao_exames: [] as Array<{ exame: string; justificativa: string }>,
    encaminhamentos: [] as string[],
  });

  const [novoMedicamento, setNovoMedicamento] = useState({ medicamento: "", dosagem: "", posologia: "", duracao: "" });
  const [novoExame, setNovoExame] = useState({ exame: "", justificativa: "" });
  const [novoEncaminhamento, setNovoEncaminhamento] = useState("");

  const isViewMode = !!prontuario;

  useEffect(() => {
    if (prontuario) {
      setFormData({
        tipo_atendimento: prontuario.tipo_atendimento,
        profissional_id: prontuario.profissional_id || "",
        unidade_id: prontuario.unidade_id || "",
        data_atendimento: format(new Date(prontuario.data_atendimento), "yyyy-MM-dd'T'HH:mm"),
        queixa_principal: prontuario.queixa_principal || "",
        historia_doenca_atual: prontuario.historia_doenca_atual || "",
        sinais_vitais: {
          pressao: String(prontuario.sinais_vitais?.pressao || ""),
          temperatura: String(prontuario.sinais_vitais?.temperatura || ""),
          peso: String(prontuario.sinais_vitais?.peso || ""),
          altura: String(prontuario.sinais_vitais?.altura || ""),
          frequencia_cardiaca: String(prontuario.sinais_vitais?.frequencia_cardiaca || ""),
          frequencia_respiratoria: String(prontuario.sinais_vitais?.frequencia_respiratoria || ""),
        },
        hipotese_diagnostica: prontuario.hipotese_diagnostica || "",
        cid_principal: prontuario.cid_principal || "",
        conduta: prontuario.conduta || "",
        observacoes: prontuario.observacoes || "",
        prescricao_medicamentos: prontuario.prescricao_medicamentos || [],
        solicitacao_exames: prontuario.solicitacao_exames || [],
        encaminhamentos: prontuario.encaminhamentos || [],
      });
    } else {
      setFormData({
        tipo_atendimento: "consulta",
        profissional_id: "",
        unidade_id: "",
        data_atendimento: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        queixa_principal: "",
        historia_doenca_atual: "",
        sinais_vitais: {
          pressao: "",
          temperatura: "",
          peso: "",
          altura: "",
          frequencia_cardiaca: "",
          frequencia_respiratoria: "",
        },
        hipotese_diagnostica: "",
        cid_principal: "",
        conduta: "",
        observacoes: "",
        prescricao_medicamentos: [],
        solicitacao_exames: [],
        encaminhamentos: [],
      });
    }
  }, [prontuario, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sinaisVitais = {
      pressao: formData.sinais_vitais.pressao || undefined,
      temperatura: formData.sinais_vitais.temperatura ? parseFloat(formData.sinais_vitais.temperatura) : undefined,
      peso: formData.sinais_vitais.peso ? parseFloat(formData.sinais_vitais.peso) : undefined,
      altura: formData.sinais_vitais.altura ? parseFloat(formData.sinais_vitais.altura) : undefined,
      frequencia_cardiaca: formData.sinais_vitais.frequencia_cardiaca ? parseInt(formData.sinais_vitais.frequencia_cardiaca) : undefined,
      frequencia_respiratoria: formData.sinais_vitais.frequencia_respiratoria ? parseInt(formData.sinais_vitais.frequencia_respiratoria) : undefined,
    };

    onSubmit({
      tipo_atendimento: formData.tipo_atendimento,
      profissional_id: formData.profissional_id || null,
      unidade_id: formData.unidade_id || null,
      data_atendimento: formData.data_atendimento,
      queixa_principal: formData.queixa_principal || null,
      historia_doenca_atual: formData.historia_doenca_atual || null,
      sinais_vitais: sinaisVitais,
      hipotese_diagnostica: formData.hipotese_diagnostica || null,
      cid_principal: formData.cid_principal || null,
      conduta: formData.conduta || null,
      observacoes: formData.observacoes || null,
      prescricao_medicamentos: formData.prescricao_medicamentos,
      solicitacao_exames: formData.solicitacao_exames,
      encaminhamentos: formData.encaminhamentos,
    });
  };

  const addMedicamento = () => {
    if (!novoMedicamento.medicamento) return;
    setFormData({
      ...formData,
      prescricao_medicamentos: [...formData.prescricao_medicamentos, novoMedicamento],
    });
    setNovoMedicamento({ medicamento: "", dosagem: "", posologia: "", duracao: "" });
  };

  const removeMedicamento = (index: number) => {
    setFormData({
      ...formData,
      prescricao_medicamentos: formData.prescricao_medicamentos.filter((_, i) => i !== index),
    });
  };

  const addExame = () => {
    if (!novoExame.exame) return;
    setFormData({
      ...formData,
      solicitacao_exames: [...formData.solicitacao_exames, novoExame],
    });
    setNovoExame({ exame: "", justificativa: "" });
  };

  const removeExame = (index: number) => {
    setFormData({
      ...formData,
      solicitacao_exames: formData.solicitacao_exames.filter((_, i) => i !== index),
    });
  };

  const addEncaminhamento = () => {
    if (!novoEncaminhamento) return;
    setFormData({
      ...formData,
      encaminhamentos: [...formData.encaminhamentos, novoEncaminhamento],
    });
    setNovoEncaminhamento("");
  };

  const removeEncaminhamento = (index: number) => {
    setFormData({
      ...formData,
      encaminhamentos: formData.encaminhamentos.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prontuario ? "Visualizar Prontuário" : "Novo Atendimento"}
            {paciente && ` - ${paciente.nome}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="anamnese" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
              <TabsTrigger value="exame">Exame Físico</TabsTrigger>
              <TabsTrigger value="prescricao">Prescrição</TabsTrigger>
              <TabsTrigger value="encaminhamentos">Exames/Encaminhamentos</TabsTrigger>
            </TabsList>

            <TabsContent value="anamnese" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Atendimento</Label>
                  <Select
                    value={formData.tipo_atendimento}
                    onValueChange={(value) => setFormData({ ...formData, tipo_atendimento: value as Prontuario["tipo_atendimento"] })}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="emergencia">Emergência</SelectItem>
                      <SelectItem value="retorno">Retorno</SelectItem>
                      <SelectItem value="procedimento">Procedimento</SelectItem>
                      <SelectItem value="exame">Exame</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data/Hora</Label>
                  <Input
                    type="datetime-local"
                    value={formData.data_atendimento}
                    onChange={(e) => setFormData({ ...formData, data_atendimento: e.target.value })}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label>Profissional</Label>
                  <Select
                    value={formData.profissional_id}
                    onValueChange={(value) => setFormData({ ...formData, profissional_id: value })}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {profissionais.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} - {p.especialidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Select
                    value={formData.unidade_id}
                    onValueChange={(value) => setFormData({ ...formData, unidade_id: value })}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Queixa Principal</Label>
                <Textarea
                  value={formData.queixa_principal}
                  onChange={(e) => setFormData({ ...formData, queixa_principal: e.target.value })}
                  placeholder="Descreva a queixa principal do paciente"
                  rows={2}
                  disabled={isViewMode}
                />
              </div>

              <div>
                <Label>História da Doença Atual</Label>
                <Textarea
                  value={formData.historia_doenca_atual}
                  onChange={(e) => setFormData({ ...formData, historia_doenca_atual: e.target.value })}
                  placeholder="Descreva a história da doença atual"
                  rows={4}
                  disabled={isViewMode}
                />
              </div>
            </TabsContent>

            <TabsContent value="exame" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Pressão Arterial</Label>
                  <Input
                    value={formData.sinais_vitais.pressao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sinais_vitais: { ...formData.sinais_vitais, pressao: e.target.value },
                      })
                    }
                    placeholder="120/80 mmHg"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label>Temperatura (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.sinais_vitais.temperatura}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sinais_vitais: { ...formData.sinais_vitais, temperatura: e.target.value },
                      })
                    }
                    placeholder="36.5"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.sinais_vitais.peso}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sinais_vitais: { ...formData.sinais_vitais, peso: e.target.value },
                      })
                    }
                    placeholder="70"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    value={formData.sinais_vitais.altura}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sinais_vitais: { ...formData.sinais_vitais, altura: e.target.value },
                      })
                    }
                    placeholder="170"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label>FC (bpm)</Label>
                  <Input
                    type="number"
                    value={formData.sinais_vitais.frequencia_cardiaca}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sinais_vitais: { ...formData.sinais_vitais, frequencia_cardiaca: e.target.value },
                      })
                    }
                    placeholder="80"
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label>FR (irpm)</Label>
                  <Input
                    type="number"
                    value={formData.sinais_vitais.frequencia_respiratoria}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sinais_vitais: { ...formData.sinais_vitais, frequencia_respiratoria: e.target.value },
                      })
                    }
                    placeholder="16"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hipótese Diagnóstica</Label>
                  <Textarea
                    value={formData.hipotese_diagnostica}
                    onChange={(e) => setFormData({ ...formData, hipotese_diagnostica: e.target.value })}
                    placeholder="Descreva a hipótese diagnóstica"
                    rows={3}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <Label>CID Principal</Label>
                  <Input
                    value={formData.cid_principal}
                    onChange={(e) => setFormData({ ...formData, cid_principal: e.target.value })}
                    placeholder="Ex: J06.9"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div>
                <Label>Conduta</Label>
                <Textarea
                  value={formData.conduta}
                  onChange={(e) => setFormData({ ...formData, conduta: e.target.value })}
                  placeholder="Descreva a conduta adotada"
                  rows={4}
                  disabled={isViewMode}
                />
              </div>
            </TabsContent>

            <TabsContent value="prescricao" className="space-y-4 mt-4">
              {!isViewMode && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        value={novoMedicamento.medicamento}
                        onChange={(e) => setNovoMedicamento({ ...novoMedicamento, medicamento: e.target.value })}
                        placeholder="Medicamento"
                      />
                      <Input
                        value={novoMedicamento.dosagem}
                        onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dosagem: e.target.value })}
                        placeholder="Dosagem"
                      />
                      <Input
                        value={novoMedicamento.posologia}
                        onChange={(e) => setNovoMedicamento({ ...novoMedicamento, posologia: e.target.value })}
                        placeholder="Posologia"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={novoMedicamento.duracao}
                          onChange={(e) => setNovoMedicamento({ ...novoMedicamento, duracao: e.target.value })}
                          placeholder="Duração"
                        />
                        <Button type="button" onClick={addMedicamento} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {formData.prescricao_medicamentos.map((med, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{med.medicamento}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.dosagem} - {med.posologia} - {med.duracao}
                      </p>
                    </div>
                    {!isViewMode && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeMedicamento(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {formData.prescricao_medicamentos.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum medicamento prescrito</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="encaminhamentos" className="space-y-4 mt-4">
              {/* Solicitação de Exames */}
              <div>
                <Label className="text-base font-semibold">Solicitação de Exames</Label>
                {!isViewMode && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={novoExame.exame}
                      onChange={(e) => setNovoExame({ ...novoExame, exame: e.target.value })}
                      placeholder="Nome do exame"
                      className="flex-1"
                    />
                    <Input
                      value={novoExame.justificativa}
                      onChange={(e) => setNovoExame({ ...novoExame, justificativa: e.target.value })}
                      placeholder="Justificativa"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addExame} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="space-y-2 mt-2">
                  {formData.solicitacao_exames.map((exame, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{exame.exame}</p>
                        {exame.justificativa && (
                          <p className="text-sm text-muted-foreground">{exame.justificativa}</p>
                        )}
                      </div>
                      {!isViewMode && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExame(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Encaminhamentos */}
              <div>
                <Label className="text-base font-semibold">Encaminhamentos</Label>
                {!isViewMode && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={novoEncaminhamento}
                      onChange={(e) => setNovoEncaminhamento(e.target.value)}
                      placeholder="Especialidade ou serviço"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addEncaminhamento} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.encaminhamentos.map((enc, index) => (
                    <Badge key={index} variant="secondary" className="gap-1 py-1 px-3">
                      {enc}
                      {!isViewMode && (
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeEncaminhamento(index)} />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={3}
                  disabled={isViewMode}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isViewMode ? "Fechar" : "Cancelar"}
            </Button>
            {!isViewMode && <Button type="submit">Salvar</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
