import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Obra, SITUACOES_OBRA, CATEGORIAS_OBRA, TIPOS_OBRA, useObras } from "@/hooks/useObras";
import { useSecretarias } from "@/hooks/useSecretarias";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  obra?: Obra | null;
}

const empty: Partial<Obra> = {
  situacao: "planejamento", valor_contratado: 0, valor_executado: 0, valor_medido: 0,
  percentual_fisico: 0, percentual_financeiro: 0,
};

export function ObraCompletaDialog({ open, onOpenChange, obra }: Props) {
  const { createObra, updateObra } = useObras();
  const { secretarias = [] } = useSecretarias() as any;
  const [form, setForm] = useState<Partial<Obra>>(empty);

  useEffect(() => {
    setForm(obra ? { ...obra } : empty);
  }, [obra, open]);

  const set = (k: keyof Obra, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    ["valor_contratado","valor_executado","valor_medido","percentual_fisico","percentual_financeiro","latitude","longitude"].forEach(k => {
      if (payload[k] === "" || payload[k] === undefined) payload[k] = null;
      else if (payload[k] !== null) payload[k] = Number(payload[k]);
    });
    if (obra) await updateObra.mutateAsync({ id: obra.id, ...payload });
    else await createObra.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{obra ? "Editar Obra" : "Nova Obra"}</DialogTitle></DialogHeader>
        <form onSubmit={submit}>
          <Tabs defaultValue="dados">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="local">Localização</TabsTrigger>
              <TabsTrigger value="resp">Responsáveis</TabsTrigger>
              <TabsTrigger value="valores">Valores</TabsTrigger>
              <TabsTrigger value="outros">Outros</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-3 pt-3">
              <div><Label>Nome da Obra *</Label><Input required value={form.nome ?? ""} onChange={e => set("nome", e.target.value)} /></div>
              <div><Label>Descrição</Label><Textarea rows={2} value={form.descricao ?? ""} onChange={e => set("descricao", e.target.value)} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Nº da Obra</Label><Input value={form.numero_obra ?? ""} onChange={e => set("numero_obra", e.target.value)} /></div>
                <div><Label>Nº do Processo</Label><Input value={form.numero_processo ?? ""} onChange={e => set("numero_processo", e.target.value)} /></div>
                <div><Label>Nº do Contrato</Label><Input value={form.numero_contrato ?? ""} onChange={e => set("numero_contrato", e.target.value)} /></div>
                <div><Label>Convênio</Label><Input value={form.convenio ?? ""} onChange={e => set("convenio", e.target.value)} /></div>
                <div><Label>Programa</Label><Input value={form.programa ?? ""} onChange={e => set("programa", e.target.value)} /></div>
                <div><Label>Fonte de Recurso</Label><Input value={form.fonte_recurso ?? ""} onChange={e => set("fonte_recurso", e.target.value)} /></div>
                <div><Label>Categoria</Label>
                  <Select value={form.categoria ?? undefined} onValueChange={v => set("categoria", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{CATEGORIAS_OBRA.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Tipo</Label>
                  <Select value={form.tipo ?? undefined} onValueChange={v => set("tipo", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{TIPOS_OBRA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Situação</Label>
                  <Select value={form.situacao} onValueChange={v => set("situacao", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SITUACOES_OBRA.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="local" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Município</Label><Input value={form.municipio ?? ""} onChange={e => set("municipio", e.target.value)} /></div>
                <div><Label>Bairro</Label><Input value={form.bairro ?? ""} onChange={e => set("bairro", e.target.value)} /></div>
                <div className="col-span-2"><Label>Endereço</Label><Input value={form.endereco ?? ""} onChange={e => set("endereco", e.target.value)} /></div>
                <div><Label>CEP</Label><Input value={form.cep ?? ""} onChange={e => set("cep", e.target.value)} /></div>
                <div />
                <div><Label>Latitude</Label><Input type="number" step="0.000001" value={form.latitude ?? ""} onChange={e => set("latitude", e.target.value)} /></div>
                <div><Label>Longitude</Label><Input type="number" step="0.000001" value={form.longitude ?? ""} onChange={e => set("longitude", e.target.value)} /></div>
              </div>
            </TabsContent>

            <TabsContent value="resp" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Empresa Executora</Label><Input value={form.empresa_executora ?? ""} onChange={e => set("empresa_executora", e.target.value)} /></div>
                <div><Label>Engenheiro Responsável</Label><Input value={form.engenheiro_responsavel ?? ""} onChange={e => set("engenheiro_responsavel", e.target.value)} /></div>
                <div><Label>Fiscal Responsável</Label><Input value={form.fiscal_responsavel ?? ""} onChange={e => set("fiscal_responsavel", e.target.value)} /></div>
                <div><Label>Secretaria Solicitante</Label>
                  <Select value={form.secretaria_solicitante_id ?? undefined} onValueChange={v => set("secretaria_solicitante_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{secretarias.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="valores" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Valor Contratado (R$)</Label><Input type="number" step="0.01" value={form.valor_contratado ?? 0} onChange={e => set("valor_contratado", e.target.value)} /></div>
                <div><Label>Valor Executado (R$)</Label><Input type="number" step="0.01" value={form.valor_executado ?? 0} onChange={e => set("valor_executado", e.target.value)} /></div>
                <div><Label>Valor Medido (R$)</Label><Input type="number" step="0.01" value={form.valor_medido ?? 0} onChange={e => set("valor_medido", e.target.value)} /></div>
                <div />
                <div><Label>% Físico</Label><Input type="number" step="0.01" min="0" max="100" value={form.percentual_fisico ?? 0} onChange={e => set("percentual_fisico", e.target.value)} /></div>
                <div><Label>% Financeiro</Label><Input type="number" step="0.01" min="0" max="100" value={form.percentual_financeiro ?? 0} onChange={e => set("percentual_financeiro", e.target.value)} /></div>
                <div><Label>Data de Início</Label><Input type="date" value={form.data_inicio ?? ""} onChange={e => set("data_inicio", e.target.value)} /></div>
                <div><Label>Previsão de Conclusão</Label><Input type="date" value={form.previsao_conclusao ?? ""} onChange={e => set("previsao_conclusao", e.target.value)} /></div>
                <div><Label>Data de Conclusão</Label><Input type="date" value={form.data_conclusao ?? ""} onChange={e => set("data_conclusao", e.target.value)} /></div>
              </div>
            </TabsContent>

            <TabsContent value="outros" className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>ART</Label><Input value={form.art ?? ""} onChange={e => set("art", e.target.value)} /></div>
                <div><Label>CREA</Label><Input value={form.crea ?? ""} onChange={e => set("crea", e.target.value)} /></div>
              </div>
              <div><Label>Observações</Label><Textarea rows={4} value={form.observacoes ?? ""} onChange={e => set("observacoes", e.target.value)} /></div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{obra ? "Atualizar" : "Cadastrar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
