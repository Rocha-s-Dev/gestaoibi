import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useAlunos } from "@/hooks/useAlunos";
import { RestricaoAlimentar } from "@/hooks/useMerendaEscolar";

interface RestricaoAlimentarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restricao?: RestricaoAlimentar | null;
  onSave: (data: Omit<RestricaoAlimentar, 'id' | 'aluno'>) => Promise<void>;
}

const tiposRestricao = [
  "Alergia alimentar",
  "Intolerância à lactose",
  "Doença celíaca (glúten)",
  "Diabetes",
  "Hipertensão",
  "Vegetariano",
  "Vegano",
  "Religiosa",
  "Outra",
];

export function RestricaoAlimentarDialog({ open, onOpenChange, restricao, onSave }: RestricaoAlimentarDialogProps) {
  const { alunos } = useAlunos();
  const [loading, setLoading] = useState(false);
  const [novoAlimento, setNovoAlimento] = useState("");
  const [formData, setFormData] = useState({
    aluno_id: "",
    tipo_restricao: "",
    descricao: undefined as string | undefined,
    alimentos_proibidos: undefined as string[] | undefined,
    orientacoes_medicas: undefined as string | undefined,
    documento_medico_url: undefined as string | undefined,
  });

  useEffect(() => {
    if (restricao) {
      setFormData({
        aluno_id: restricao.aluno_id,
        tipo_restricao: restricao.tipo_restricao,
        descricao: restricao.descricao,
        alimentos_proibidos: restricao.alimentos_proibidos,
        orientacoes_medicas: restricao.orientacoes_medicas,
        documento_medico_url: restricao.documento_medico_url,
      });
    } else {
      setFormData({
        aluno_id: "",
        tipo_restricao: "",
        descricao: undefined,
        alimentos_proibidos: undefined,
        orientacoes_medicas: undefined,
        documento_medico_url: undefined,
      });
    }
  }, [restricao, open]);

  const handleAddAlimento = () => {
    if (novoAlimento.trim()) {
      setFormData(prev => ({
        ...prev,
        alimentos_proibidos: [...(prev.alimentos_proibidos || []), novoAlimento.trim()]
      }));
      setNovoAlimento("");
    }
  };

  const handleRemoveAlimento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alimentos_proibidos: prev.alimentos_proibidos?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{restricao ? "Editar Restrição" : "Nova Restrição Alimentar"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aluno">Aluno *</Label>
            <Select
              value={formData.aluno_id || "none"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, aluno_id: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione o aluno</SelectItem>
                {alunos.map(aluno => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.nome} - {aluno.numero_matricula}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_restricao">Tipo de Restrição *</Label>
            <Select
              value={formData.tipo_restricao || "none"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_restricao: value === "none" ? "" : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Selecione o tipo</SelectItem>
                {tiposRestricao.map(tipo => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value || undefined }))}
              placeholder="Descreva a restrição alimentar..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Alimentos Proibidos</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar alimento..."
                value={novoAlimento}
                onChange={(e) => setNovoAlimento(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlimento())}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddAlimento}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.alimentos_proibidos?.map((alimento, index) => (
                <Badge key={index} variant="destructive" className="flex items-center gap-1">
                  {alimento}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-white/80"
                    onClick={() => handleRemoveAlimento(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orientacoes_medicas">Orientações Médicas</Label>
            <Textarea
              id="orientacoes_medicas"
              value={formData.orientacoes_medicas || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, orientacoes_medicas: e.target.value || undefined }))}
              placeholder="Orientações do médico ou nutricionista..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documento_medico_url">URL do Documento Médico</Label>
            <Input
              id="documento_medico_url"
              type="url"
              value={formData.documento_medico_url || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, documento_medico_url: e.target.value || undefined }))}
              placeholder="https://..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.aluno_id || !formData.tipo_restricao}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
