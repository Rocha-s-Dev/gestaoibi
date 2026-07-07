import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBeneficiosEventuais, TIPO_BENEFICIO_LABELS, type BeneficioEventual, type TipoBeneficio } from "@/hooks/useBeneficiosEventuais";
import { useSocial } from "@/hooks/useSocial";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  beneficio?: BeneficioEventual | null;
}

const emptyForm = {
  familia_id: "",
  tipo_beneficio: "cesta_basica" as TipoBeneficio,
  descricao: "",
  valor: 0,
  quantidade: 1,
  data_solicitacao: new Date().toISOString().split("T")[0],
  data_validade: "",
  total_parcelas: 1,
  justificativa: "",
  parecer_tecnico: "",
  unidade_id: "",
  observacoes: "",
  status: "solicitado",
};

export function BeneficioEventualDialog({ open, onOpenChange, beneficio }: Props) {
  const { saveBeneficio } = useBeneficiosEventuais();
  const { familias, fetchFamilias, unidades, fetchUnidades } = useSocial();
  const [form, setForm] = useState<any>(emptyForm);

  useEffect(() => {
    if (open) {
      fetchFamilias();
      fetchUnidades();
      if (beneficio) {
        setForm({
          ...beneficio,
          data_solicitacao: beneficio.data_solicitacao?.split("T")[0] ?? "",
          data_validade: beneficio.data_validade?.split("T")[0] ?? "",
          familia_id: beneficio.familia_id ?? "",
          unidade_id: beneficio.unidade_id ?? "",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, beneficio, fetchFamilias, fetchUnidades]);

  const handleSave = () => {
    const payload = {
      ...form,
      familia_id: form.familia_id || null,
      unidade_id: form.unidade_id || null,
      data_validade: form.data_validade || null,
      valor: Number(form.valor) || 0,
      quantidade: Number(form.quantidade) || 1,
      total_parcelas: Number(form.total_parcelas) || 1,
    };
    saveBeneficio.mutate(payload, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{beneficio ? "Editar Benefício" : "Novo Benefício Eventual"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Família</Label>
            <Select value={form.familia_id} onValueChange={(v) => setForm({ ...form, familia_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione uma família..." /></SelectTrigger>
              <SelectContent>
                {familias.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.responsavel_nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Benefício *</Label>
            <Select value={form.tipo_beneficio} onValueChange={(v) => setForm({ ...form, tipo_beneficio: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(TIPO_BENEFICIO_LABELS) as TipoBeneficio[]).map((t) => (
                  <SelectItem key={t} value={t}>{TIPO_BENEFICIO_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unidade de Referência</Label>
            <Select value={form.unidade_id} onValueChange={(v) => setForm({ ...form, unidade_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.nome} ({u.tipo})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Quantidade</Label>
            <Input type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Data da Solicitação *</Label>
            <Input type="date" value={form.data_solicitacao} onChange={(e) => setForm({ ...form, data_solicitacao: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Data de Validade</Label>
            <Input type="date" value={form.data_validade} onChange={(e) => setForm({ ...form, data_validade: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Total de Parcelas</Label>
            <Input type="number" min={1} value={form.total_parcelas} onChange={(e) => setForm({ ...form, total_parcelas: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solicitado">Solicitado</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="concedido">Concedido</SelectItem>
                <SelectItem value="indeferido">Indeferido</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Justificativa *</Label>
            <Textarea rows={3} value={form.justificativa} onChange={(e) => setForm({ ...form, justificativa: e.target.value })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Parecer Técnico</Label>
            <Textarea rows={2} value={form.parecer_tecnico} onChange={(e) => setForm({ ...form, parecer_tecnico: e.target.value })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Observações</Label>
            <Textarea rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.justificativa || !form.tipo_beneficio || saveBeneficio.isPending}>
            {saveBeneficio.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
