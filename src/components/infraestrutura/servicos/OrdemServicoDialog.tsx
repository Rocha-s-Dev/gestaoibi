import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrdemServico, PRIORIDADES_OS, STATUS_OS, useOrdensServico, useServicosTipos } from "@/hooks/useOrdensServico";
import { useServicosEquipes } from "@/hooks/useServicosEquipes";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ordem: OrdemServico | null;
}

const empty = {
  tipo_id: "", tipo_nome: "", categoria: "", prioridade: "media", status: "aberta",
  data_abertura: new Date().toISOString().slice(0, 10), data_prevista: "", data_conclusao: "",
  solicitante_nome: "", solicitante_contato: "", bairro: "", endereco: "", referencia: "",
  latitude: "", longitude: "", descricao: "", observacoes: "", equipe_id: "",
  quantidade_prevista: "", quantidade_executada: "", valor_estimado: "", valor_executado: "",
};

export function OrdemServicoDialog({ open, onOpenChange, ordem }: Props) {
  const { createOrdem, updateOrdem } = useOrdensServico();
  const { tipos } = useServicosTipos();
  const { equipes } = useServicosEquipes();
  const [form, setForm] = useState<any>(empty);

  useEffect(() => {
    if (!open) return;
    if (ordem) {
      setForm({
        ...empty,
        ...Object.fromEntries(Object.keys(empty).map(k => [k, (ordem as any)[k] ?? ""])),
      });
    } else {
      setForm(empty);
    }
  }, [open, ordem]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const num = (v: any) => (v === "" || v === null ? null : Number(v));
  const str = (v: any) => (v === "" ? null : v);

  const submit = async () => {
    const payload: any = {
      tipo_id: str(form.tipo_id),
      tipo_nome: str(form.tipo_nome) || tipos.find(t => t.id === form.tipo_id)?.nome || null,
      categoria: str(form.categoria) || tipos.find(t => t.id === form.tipo_id)?.categoria || null,
      prioridade: form.prioridade, status: form.status,
      data_abertura: str(form.data_abertura), data_prevista: str(form.data_prevista), data_conclusao: str(form.data_conclusao),
      solicitante_nome: str(form.solicitante_nome), solicitante_contato: str(form.solicitante_contato),
      bairro: str(form.bairro), endereco: str(form.endereco), referencia: str(form.referencia),
      latitude: num(form.latitude), longitude: num(form.longitude),
      descricao: str(form.descricao), observacoes: str(form.observacoes),
      equipe_id: str(form.equipe_id),
      quantidade_prevista: num(form.quantidade_prevista), quantidade_executada: num(form.quantidade_executada),
      valor_estimado: num(form.valor_estimado), valor_executado: num(form.valor_executado),
    };
    if (ordem) await updateOrdem.mutateAsync({ id: ordem.id, ...payload });
    else await createOrdem.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ordem ? `Editar OS ${ordem.numero_os ?? ""}` : "Nova Ordem de Serviço"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="geral">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="geral">Dados gerais</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
            <TabsTrigger value="execucao">Execução</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de serviço *</Label>
                <Select value={form.tipo_id || undefined} onValueChange={v => set("tipo_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {tipos.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={form.prioridade} onValueChange={v => set("prioridade", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORIDADES_OS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Situação</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Equipe designada</Label>
                <Select value={form.equipe_id || undefined} onValueChange={v => set("equipe_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Sem equipe" /></SelectTrigger>
                  <SelectContent>
                    {equipes.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de abertura</Label>
                <Input type="date" value={form.data_abertura} onChange={e => set("data_abertura", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Prazo previsto</Label>
                <Input type="date" value={form.data_prevista} onChange={e => set("data_prevista", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Solicitante</Label>
                <Input value={form.solicitante_nome} onChange={e => set("solicitante_nome", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contato do solicitante</Label>
                <Input value={form.solicitante_contato} onChange={e => set("solicitante_contato", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição do serviço</Label>
              <Textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} rows={3} />
            </div>
          </TabsContent>

          <TabsContent value="local" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bairro / localidade</Label>
                <Input value={form.bairro} onChange={e => set("bairro", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input value={form.endereco} onChange={e => set("endereco", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Ponto de referência</Label>
                <Input value={form.referencia} onChange={e => set("referencia", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input value={form.latitude} onChange={e => set("latitude", e.target.value)} placeholder="-12.65" />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input value={form.longitude} onChange={e => set("longitude", e.target.value)} placeholder="-40.93" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="execucao" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade prevista</Label>
                <Input type="number" step="0.01" value={form.quantidade_prevista} onChange={e => set("quantidade_prevista", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Quantidade executada</Label>
                <Input type="number" step="0.01" value={form.quantidade_executada} onChange={e => set("quantidade_executada", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valor estimado (R$)</Label>
                <Input type="number" step="0.01" value={form.valor_estimado} onChange={e => set("valor_estimado", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Valor executado (R$)</Label>
                <Input type="number" step="0.01" value={form.valor_executado} onChange={e => set("valor_executado", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data de conclusão</Label>
                <Input type="date" value={form.data_conclusao} onChange={e => set("data_conclusao", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} rows={3} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!form.tipo_id}>{ordem ? "Salvar" : "Criar OS"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
