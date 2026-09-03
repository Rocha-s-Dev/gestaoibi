import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { useSecretarias } from "@/hooks/useSecretarias";
import { useUnidadesAdministrativas } from "@/hooks/useUnidadesAdministrativas";
import { useMunicipios } from "@/hooks/useMunicipios";
import {
  BemPatrimonial,
  ESTADO_CONSERVACAO_LABELS,
  STATUS_BEM_LABELS,
  useBensCategorias,
  useOrigensFinanceiras,
  usePatrimonio,
} from "@/hooks/usePatrimonio";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bem?: BemPatrimonial | null;
}

const NONE = "none";

export function BemPatrimonialDialog({ open, onOpenChange, bem }: Props) {
  const { municipioAtivo } = useMunicipios();
  const { secretarias } = useSecretarias(municipioAtivo?.id);
  const { categorias } = useBensCategorias();
  const { createBem, updateBem, gerarNumeroTombamento } = usePatrimonio();
  const { fornecedores, contratos, empenhos, convenios, veiculos, equipamentos } = useOrigensFinanceiras();

  const [form, setForm] = useState<Record<string, any>>({});
  const [responsavel, setResponsavel] = useState<UsuarioRH | null>(null);
  const [showVincular, setShowVincular] = useState(false);
  const { unidades } = useUnidadesAdministrativas(form.secretaria_id || undefined);

  useEffect(() => {
    if (!open) return;
    setResponsavel(null);
    setForm(
      bem
        ? { ...bem }
        : {
            numero_tombamento: "",
            descricao: "",
            tipo_bem: "movel",
            estado_conservacao: "bom",
            status: "ativo",
            depreciavel: false,
            data_tombamento: new Date().toISOString().split("T")[0],
          }
    );
  }, [open, bem]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const sel = (k: string) => (form[k] ? String(form[k]) : NONE);
  const setSel = (k: string) => (v: string) => set(k, v === NONE ? null : v);

  const handleGerar = async () => {
    try {
      const numero = await gerarNumeroTombamento(municipioAtivo?.id ?? null);
      set("numero_tombamento", numero);
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar número de tombamento.");
    }
  };

  const handleSubmit = () => {
    if (!form.numero_tombamento?.trim()) return toast.error("Informe o número de tombamento.");
    if (!form.descricao?.trim()) return toast.error("Informe a descrição do bem.");

    const payload: Record<string, any> = {
      municipio_id: form.municipio_id ?? municipioAtivo?.id ?? null,
      numero_tombamento: form.numero_tombamento.trim(),
      descricao: form.descricao.trim(),
      categoria_id: form.categoria_id ?? null,
      categoria: categorias.find((c) => c.id === form.categoria_id)?.nome ?? form.categoria ?? null,
      tipo_bem: form.tipo_bem || "movel",
      marca: form.marca || null,
      modelo: form.modelo || null,
      numero_serie: form.numero_serie || null,
      estado_conservacao: form.estado_conservacao,
      status: form.status,
      data_aquisicao: form.data_aquisicao || null,
      data_tombamento: form.data_tombamento || new Date().toISOString().split("T")[0],
      valor_aquisicao: form.valor_aquisicao ? Number(form.valor_aquisicao) : null,
      valor_atual: form.valor_atual ? Number(form.valor_atual) : null,
      vida_util_anos: form.vida_util_anos ? Number(form.vida_util_anos) : null,
      depreciavel: !!form.depreciavel,
      secretaria_id: form.secretaria_id ?? null,
      unidade_id: form.unidade_id ?? null,
      responsavel_id: responsavel?.user_id ?? form.responsavel_id ?? null,
      localizacao: form.localizacao || null,
      observacoes: form.observacoes || null,
      empenho_id: form.empenho_id ?? null,
      contrato_id: form.contrato_id ?? null,
      convenio_id: form.convenio_id ?? null,
      fornecedor_id: form.fornecedor_id ?? null,
      veiculo_id: form.veiculo_id ?? null,
      servico_equipamento_id: form.servico_equipamento_id ?? null,
    };

    if (bem) {
      updateBem.mutate({ id: bem.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createBem.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const saving = createBem.isPending || updateBem.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{bem ? "Editar Bem Patrimonial" : "Novo Bem Patrimonial"}</DialogTitle>
            <DialogDescription>
              Cadastro patrimonial integrado às estruturas existentes de RH, Financeiro, Frota e Serviços.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="identificacao">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identificacao">Identificação</TabsTrigger>
              <TabsTrigger value="localizacao">Localização</TabsTrigger>
              <TabsTrigger value="financeiro">Origem Financeira</TabsTrigger>
              <TabsTrigger value="integracao">Integrações</TabsTrigger>
            </TabsList>

            <TabsContent value="identificacao" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Tombamento *</Label>
                  <div className="flex gap-2">
                    <Input value={form.numero_tombamento || ""} onChange={(e) => set("numero_tombamento", e.target.value)} placeholder="2026-000001" />
                    <Button type="button" variant="outline" onClick={handleGerar} title="Gerar automaticamente">
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={sel("categoria_id")} onValueChange={setSel("categoria_id")}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem categoria</SelectItem>
                      {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input value={form.descricao || ""} onChange={(e) => set("descricao", e.target.value)} placeholder="Ex.: Notebook Dell Latitude 3420" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Bem</Label>
                  <Select value={form.tipo_bem || "movel"} onValueChange={(v) => set("tipo_bem", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movel">Móvel</SelectItem>
                      <SelectItem value="imovel">Imóvel</SelectItem>
                      <SelectItem value="intangivel">Intangível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input value={form.marca || ""} onChange={(e) => set("marca", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input value={form.modelo || ""} onChange={(e) => set("modelo", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Número de Série</Label>
                  <Input value={form.numero_serie || ""} onChange={(e) => set("numero_serie", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Estado de Conservação</Label>
                  <Select value={form.estado_conservacao || "bom"} onValueChange={(v) => set("estado_conservacao", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ESTADO_CONSERVACAO_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status || "ativo"} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_BEM_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Data de Aquisição</Label>
                  <Input type="date" value={form.data_aquisicao || ""} onChange={(e) => set("data_aquisicao", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data de Tombamento</Label>
                  <Input type="date" value={form.data_tombamento || ""} onChange={(e) => set("data_tombamento", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Valor de Aquisição (R$)</Label>
                  <Input type="number" step="0.01" value={form.valor_aquisicao ?? ""} onChange={(e) => set("valor_aquisicao", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Valor Atual (R$)</Label>
                  <Input type="number" step="0.01" value={form.valor_atual ?? ""} onChange={(e) => set("valor_atual", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Vida Útil (anos)</Label>
                  <Input type="number" value={form.vida_util_anos ?? ""} onChange={(e) => set("vida_util_anos", e.target.value)} />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch checked={!!form.depreciavel} onCheckedChange={(v) => set("depreciavel", v)} />
                  <Label>Bem depreciável</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.observacoes || ""} onChange={(e) => set("observacoes", e.target.value)} rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="localizacao" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Secretaria Responsável</Label>
                  <Select value={sel("secretaria_id")} onValueChange={(v) => { setSel("secretaria_id")(v); set("unidade_id", null); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem secretaria</SelectItem>
                      {secretarias.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade / Local Responsável</Label>
                  <Select value={sel("unidade_id")} onValueChange={setSel("unidade_id")} disabled={!form.secretaria_id}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem unidade</SelectItem>
                      {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Responsável pelo Bem (RH)</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={responsavel ? `${responsavel.nome} — ${responsavel.email}` : form.responsavel_id ? "Responsável já vinculado" : "Nenhum responsável selecionado"} />
                  <Button type="button" variant="outline" onClick={() => setShowVincular(true)}>
                    <UserPlus className="h-4 w-4 mr-1" /> Selecionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Servidores são cadastrados exclusivamente pelo RH central.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Localização Física</Label>
                <Input value={form.localizacao || ""} onChange={(e) => set("localizacao", e.target.value)} placeholder="Ex.: Sala 02 — Prédio da Prefeitura" />
              </div>
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Vincule o bem, quando aplicável, aos registros financeiros existentes. Não é obrigatório.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Select value={sel("fornecedor_id")} onValueChange={setSel("fornecedor_id")}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem fornecedor</SelectItem>
                      {fornecedores.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Empenho</Label>
                  <Select value={sel("empenho_id")} onValueChange={setSel("empenho_id")}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem empenho</SelectItem>
                      {empenhos.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.numero}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contrato</Label>
                  <Select value={sel("contrato_id")} onValueChange={setSel("contrato_id")}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem contrato</SelectItem>
                      {contratos.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.contract_number} — {c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Convênio</Label>
                  <Select value={sel("convenio_id")} onValueChange={setSel("convenio_id")}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem convênio</SelectItem>
                      {convenios.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.numero}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integracao" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Referências opcionais aos cadastros já existentes de Frota e Equipamentos de Serviços Urbanos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Veículo da Frota</Label>
                  <Select value={sel("veiculo_id")} onValueChange={setSel("veiculo_id")}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Não é veículo</SelectItem>
                      {veiculos.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.placa} — {v.modelo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Equipamento / Máquina de Serviços</Label>
                  <Select value={sel("servico_equipamento_id")} onValueChange={setSel("servico_equipamento_id")}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Não é equipamento</SelectItem>
                      {equipamentos.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {bem ? "Salvar Alterações" : "Cadastrar Bem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={showVincular}
        onOpenChange={setShowVincular}
        onUsuarioSelecionado={(u) => { setResponsavel(u); set("responsavel_id", u.user_id); setShowVincular(false); }}
        titulo="Selecionar Responsável pelo Bem"
      />
    </>
  );
}
