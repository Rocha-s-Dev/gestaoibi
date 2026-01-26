import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCargosPublicos } from "@/hooks/useCargosPublicos";
import type { Database } from "@/integrations/supabase/types";

type TipoCargo = Database["public"]["Enums"]["tipo_cargo"];
type RegimeTrabalho = Database["public"]["Enums"]["regime_trabalho"];

interface CargoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cargo?: Database["public"]["Tables"]["cargos_publicos"]["Row"];
}

const tiposCargo: { value: TipoCargo; label: string }[] = [
  { value: "efetivo", label: "Efetivo" },
  { value: "comissionado", label: "Comissionado" },
  { value: "temporario", label: "Temporário" },
  { value: "emprego_publico", label: "Emprego Público" },
];

const regimesTrabalho: { value: RegimeTrabalho; label: string }[] = [
  { value: "estatutario", label: "Estatutário" },
  { value: "celetista", label: "Celetista" },
  { value: "temporario", label: "Temporário" },
  { value: "comissionado", label: "Comissionado" },
];

export function CargoDialog({ open, onOpenChange, cargo }: CargoDialogProps) {
  const { createCargo, updateCargo } = useCargosPublicos();
  const isEditing = !!cargo;

  const [formData, setFormData] = useState({
    codigo: cargo?.codigo || "",
    nome: cargo?.nome || "",
    descricao: cargo?.descricao || "",
    tipo: (cargo?.tipo || "efetivo") as TipoCargo,
    regime: (cargo?.regime || "estatutario") as RegimeTrabalho,
    nivel: cargo?.nivel || "",
    classe: cargo?.classe || "",
    padrao: cargo?.padrao || "",
    vencimento_base: cargo?.vencimento_base?.toString() || "",
    jornada_semanal: cargo?.jornada_semanal?.toString() || "40",
    escolaridade_minima: cargo?.escolaridade_minima || "",
    formacao_especifica: cargo?.formacao_especifica || "",
    vagas_criadas: cargo?.vagas_criadas?.toString() || "",
    lei_criacao: cargo?.lei_criacao || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      codigo: formData.codigo,
      nome: formData.nome,
      descricao: formData.descricao || null,
      tipo: formData.tipo,
      regime: formData.regime,
      nivel: formData.nivel || null,
      classe: formData.classe || null,
      padrao: formData.padrao || null,
      vencimento_base: formData.vencimento_base ? parseFloat(formData.vencimento_base) : null,
      jornada_semanal: parseInt(formData.jornada_semanal) || 40,
      escolaridade_minima: formData.escolaridade_minima || null,
      formacao_especifica: formData.formacao_especifica || null,
      vagas_criadas: formData.vagas_criadas ? parseInt(formData.vagas_criadas) : null,
      lei_criacao: formData.lei_criacao || null,
    };

    if (isEditing && cargo) {
      await updateCargo.mutateAsync({ id: cargo.id, ...payload });
    } else {
      await createCargo.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cargo" : "Novo Cargo Público"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do cargo." : "Preencha os dados do novo cargo público."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ex: PROF-I"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cargo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Professor de Educação Básica"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição das atribuições do cargo"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Cargo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoCargo) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposCargo.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="regime">Regime de Trabalho</Label>
              <Select
                value={formData.regime}
                onValueChange={(value: RegimeTrabalho) => setFormData({ ...formData, regime: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regimesTrabalho.map((regime) => (
                    <SelectItem key={regime.value} value={regime.value}>
                      {regime.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nivel">Nível</Label>
              <Input
                id="nivel"
                value={formData.nivel}
                onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                placeholder="Ex: I, II, III"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classe">Classe</Label>
              <Input
                id="classe"
                value={formData.classe}
                onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                placeholder="Ex: A, B, C"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="padrao">Padrão</Label>
              <Input
                id="padrao"
                value={formData.padrao}
                onChange={(e) => setFormData({ ...formData, padrao: e.target.value })}
                placeholder="Ex: 1, 2, 3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vencimento_base">Vencimento Base (R$)</Label>
              <Input
                id="vencimento_base"
                type="number"
                step="0.01"
                value={formData.vencimento_base}
                onChange={(e) => setFormData({ ...formData, vencimento_base: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jornada_semanal">Jornada Semanal (horas)</Label>
              <Input
                id="jornada_semanal"
                type="number"
                value={formData.jornada_semanal}
                onChange={(e) => setFormData({ ...formData, jornada_semanal: e.target.value })}
                placeholder="40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="escolaridade_minima">Escolaridade Mínima</Label>
              <Input
                id="escolaridade_minima"
                value={formData.escolaridade_minima}
                onChange={(e) => setFormData({ ...formData, escolaridade_minima: e.target.value })}
                placeholder="Ex: Ensino Superior Completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formacao_especifica">Formação Específica</Label>
              <Input
                id="formacao_especifica"
                value={formData.formacao_especifica}
                onChange={(e) => setFormData({ ...formData, formacao_especifica: e.target.value })}
                placeholder="Ex: Licenciatura em Pedagogia"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vagas_criadas">Vagas Criadas</Label>
              <Input
                id="vagas_criadas"
                type="number"
                value={formData.vagas_criadas}
                onChange={(e) => setFormData({ ...formData, vagas_criadas: e.target.value })}
                placeholder="Número de vagas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lei_criacao">Lei de Criação</Label>
              <Input
                id="lei_criacao"
                value={formData.lei_criacao}
                onChange={(e) => setFormData({ ...formData, lei_criacao: e.target.value })}
                placeholder="Ex: Lei Municipal nº 1234/2020"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createCargo.isPending || updateCargo.isPending}>
              {createCargo.isPending || updateCargo.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar Cargo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
