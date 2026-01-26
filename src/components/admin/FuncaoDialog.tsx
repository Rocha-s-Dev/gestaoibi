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
import { useFuncoesAdministrativas } from "@/hooks/useFuncoesAdministrativas";
import { useCargosPublicos } from "@/hooks/useCargosPublicos";
import { useSecretarias } from "@/hooks/useSecretarias";
import type { Database } from "@/integrations/supabase/types";

type TipoFuncao = Database["public"]["Enums"]["tipo_funcao"];

interface FuncaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcao?: Database["public"]["Tables"]["funcoes_administrativas"]["Row"];
}

const tiposFuncao: { value: TipoFuncao; label: string }[] = [
  { value: "comissionada", label: "Comissionada (CC)" },
  { value: "gratificada", label: "Gratificada (FG)" },
  { value: "cargo_em_comissao", label: "Cargo em Comissão" },
];

export function FuncaoDialog({ open, onOpenChange, funcao }: FuncaoDialogProps) {
  const { createFuncao, updateFuncao, funcoes } = useFuncoesAdministrativas();
  const { cargos } = useCargosPublicos();
  const { secretarias } = useSecretarias();
  const isEditing = !!funcao;

  const [formData, setFormData] = useState({
    codigo: funcao?.codigo || "",
    nome: funcao?.nome || "",
    descricao: funcao?.descricao || "",
    tipo: (funcao?.tipo || "comissionada") as TipoFuncao,
    secretaria_id: funcao?.secretaria_id || "",
    cargo_vinculado_id: funcao?.cargo_vinculado_id || "",
    funcao_superior_id: funcao?.funcao_superior_id || "",
    valor_gratificacao: funcao?.valor_gratificacao?.toString() || "",
    percentual_gratificacao: funcao?.percentual_gratificacao?.toString() || "",
    nivel_hierarquico: funcao?.nivel_hierarquico?.toString() || "",
    atribuicoes: funcao?.atribuicoes || "",
    requisitos_ocupacao: funcao?.requisitos_ocupacao || "",
    exclusivo_efetivo: funcao?.exclusivo_efetivo || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      codigo: formData.codigo,
      nome: formData.nome,
      descricao: formData.descricao || null,
      tipo: formData.tipo,
      secretaria_id: formData.secretaria_id || null,
      cargo_vinculado_id: formData.cargo_vinculado_id || null,
      funcao_superior_id: formData.funcao_superior_id || null,
      valor_gratificacao: formData.valor_gratificacao ? parseFloat(formData.valor_gratificacao) : null,
      percentual_gratificacao: formData.percentual_gratificacao ? parseFloat(formData.percentual_gratificacao) : null,
      nivel_hierarquico: formData.nivel_hierarquico ? parseInt(formData.nivel_hierarquico) : null,
      atribuicoes: formData.atribuicoes || null,
      requisitos_ocupacao: formData.requisitos_ocupacao || null,
      exclusivo_efetivo: formData.exclusivo_efetivo,
    };

    if (isEditing && funcao) {
      await updateFuncao.mutateAsync({ id: funcao.id, ...payload });
    } else {
      await createFuncao.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Função" : "Nova Função Administrativa"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações da função." : "Preencha os dados da nova função administrativa."}
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
                placeholder="Ex: CC-01, FG-01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Função *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Diretor de Departamento"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Função</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoFuncao) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposFuncao.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretaria_id">Secretaria</Label>
              <Select
                value={formData.secretaria_id}
                onValueChange={(value) => setFormData({ ...formData, secretaria_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma secretaria" />
                </SelectTrigger>
                <SelectContent>
                  {secretarias?.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição da função"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargo_vinculado_id">Cargo Vinculado</Label>
              <Select
                value={formData.cargo_vinculado_id}
                onValueChange={(value) => setFormData({ ...formData, cargo_vinculado_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  {cargos?.map((cargo) => (
                    <SelectItem key={cargo.id} value={cargo.id}>
                      {cargo.nome} ({cargo.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="funcao_superior_id">Função Superior</Label>
              <Select
                value={formData.funcao_superior_id}
                onValueChange={(value) => setFormData({ ...formData, funcao_superior_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função superior" />
                </SelectTrigger>
                <SelectContent>
                  {funcoes?.filter(f => f.id !== funcao?.id).map((f: any) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome} ({f.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_gratificacao">Valor Gratificação (R$)</Label>
              <Input
                id="valor_gratificacao"
                type="number"
                step="0.01"
                value={formData.valor_gratificacao}
                onChange={(e) => setFormData({ ...formData, valor_gratificacao: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentual_gratificacao">Percentual (%)</Label>
              <Input
                id="percentual_gratificacao"
                type="number"
                step="0.01"
                value={formData.percentual_gratificacao}
                onChange={(e) => setFormData({ ...formData, percentual_gratificacao: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel_hierarquico">Nível Hierárquico</Label>
              <Input
                id="nivel_hierarquico"
                type="number"
                value={formData.nivel_hierarquico}
                onChange={(e) => setFormData({ ...formData, nivel_hierarquico: e.target.value })}
                placeholder="1, 2, 3..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="atribuicoes">Atribuições</Label>
            <Textarea
              id="atribuicoes"
              value={formData.atribuicoes}
              onChange={(e) => setFormData({ ...formData, atribuicoes: e.target.value })}
              placeholder="Liste as principais atribuições"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requisitos_ocupacao">Requisitos para Ocupação</Label>
            <Textarea
              id="requisitos_ocupacao"
              value={formData.requisitos_ocupacao}
              onChange={(e) => setFormData({ ...formData, requisitos_ocupacao: e.target.value })}
              placeholder="Requisitos necessários para ocupar a função"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createFuncao.isPending || updateFuncao.isPending}>
              {createFuncao.isPending || updateFuncao.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Criar Função"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
