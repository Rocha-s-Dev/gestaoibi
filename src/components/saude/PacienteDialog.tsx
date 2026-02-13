import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Paciente } from "@/hooks/usePacientes";

interface PacienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  paciente?: Paciente | null;
  isPending?: boolean;
}

export function PacienteDialog({ open, onOpenChange, onSubmit, paciente, isPending }: PacienteDialogProps) {
  const [form, setForm] = useState({
    nome: paciente?.nome || "",
    cpf: paciente?.cpf || "",
    cartao_sus: paciente?.cartao_sus || "",
    data_nascimento: paciente?.data_nascimento || "",
    sexo: paciente?.sexo || "",
    telefone: paciente?.telefone || "",
    email: paciente?.email || "",
    endereco: paciente?.endereco || "",
    bairro: paciente?.bairro || "",
    cidade: paciente?.cidade || "",
    nome_mae: paciente?.nome_mae || "",
    nome_responsavel: paciente?.nome_responsavel || "",
    telefone_responsavel: paciente?.telefone_responsavel || "",
    tipo_sanguineo: paciente?.tipo_sanguineo || "",
    alergias: paciente?.alergias?.join(", ") || "",
    condicoes_cronicas: paciente?.condicoes_cronicas?.join(", ") || "",
    medicamentos_uso_continuo: paciente?.medicamentos_uso_continuo?.join(", ") || "",
    observacoes: paciente?.observacoes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      alergias: form.alergias ? form.alergias.split(",").map(s => s.trim()).filter(Boolean) : null,
      condicoes_cronicas: form.condicoes_cronicas ? form.condicoes_cronicas.split(",").map(s => s.trim()).filter(Boolean) : null,
      medicamentos_uso_continuo: form.medicamentos_uso_continuo ? form.medicamentos_uso_continuo.split(",").map(s => s.trim()).filter(Boolean) : null,
    };
    if (paciente) {
      onSubmit({ id: paciente.id, ...payload });
    } else {
      onSubmit(payload);
    }
  };

  const set = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{paciente ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
          <DialogDescription>
            {paciente ? "Atualize os dados do paciente." : "Preencha os dados para cadastrar um novo paciente."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Nome Completo *</Label>
              <Input value={form.nome} onChange={e => set("nome", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input value={form.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <Label>Cartão SUS (CNS)</Label>
              <Input value={form.cartao_sus} onChange={e => set("cartao_sus", e.target.value)} placeholder="000 0000 0000 0000" />
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input type="date" value={form.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select value={form.sexo} onValueChange={v => set("sexo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={e => set("telefone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={e => set("endereco", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={e => set("bairro", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={e => set("cidade", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nome da Mãe</Label>
              <Input value={form.nome_mae} onChange={e => set("nome_mae", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo Sanguíneo</Label>
              <Select value={form.tipo_sanguineo} onValueChange={v => set("tipo_sanguineo", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input value={form.nome_responsavel} onChange={e => set("nome_responsavel", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telefone Responsável</Label>
              <Input value={form.telefone_responsavel} onChange={e => set("telefone_responsavel", e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Alergias (separadas por vírgula)</Label>
              <Input value={form.alergias} onChange={e => set("alergias", e.target.value)} placeholder="Ex: Dipirona, Penicilina" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Condições Crônicas (separadas por vírgula)</Label>
              <Input value={form.condicoes_cronicas} onChange={e => set("condicoes_cronicas", e.target.value)} placeholder="Ex: Diabetes, Hipertensão" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Medicamentos de Uso Contínuo (separados por vírgula)</Label>
              <Input value={form.medicamentos_uso_continuo} onChange={e => set("medicamentos_uso_continuo", e.target.value)} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>{paciente ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
