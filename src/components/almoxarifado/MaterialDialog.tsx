import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlmoxarifadoItem,
  useAlmoxarifadoCategorias,
  useAlmoxarifadoLocalizacoes,
  useAlmoxarifadoMateriais,
  useAlmoxarifadoUnidades,
} from "@/hooks/useAlmoxarifado";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  material?: AlmoxarifadoItem | null;
}

const NONE = "none";

export function MaterialDialog({ open, onOpenChange, material }: Props) {
  const { categorias } = useAlmoxarifadoCategorias();
  const { unidades } = useAlmoxarifadoUnidades();
  const { localizacoes } = useAlmoxarifadoLocalizacoes();
  const { criarMaterial, atualizarMaterial } = useAlmoxarifadoMateriais();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [unidadeId, setUnidadeId] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [especificacao, setEspecificacao] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("0");
  const [estoqueMaximo, setEstoqueMaximo] = useState("");
  const [controlaLote, setControlaLote] = useState(false);
  const [controlaValidade, setControlaValidade] = useState(false);
  const [localizacaoId, setLocalizacaoId] = useState(NONE);
  const [valorMedio, setValorMedio] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!open) return;
    setNome(material?.nome ?? "");
    setDescricao(material?.descricao ?? "");
    setCategoriaId(material?.categoria_id ?? "");
    setUnidadeId(material?.unidade_medida_id ?? "");
    setMarca(material?.marca ?? "");
    setModelo(material?.modelo ?? "");
    setEspecificacao(material?.especificacao ?? "");
    setEstoqueMinimo(String(material?.estoque_minimo ?? 0));
    setEstoqueMaximo(material?.estoque_maximo != null ? String(material.estoque_maximo) : "");
    setControlaLote(material?.controla_lote ?? false);
    setControlaValidade(material?.controla_validade ?? false);
    setLocalizacaoId(material?.localizacao_id ?? NONE);
    setValorMedio(material?.valor_medio != null ? String(material.valor_medio) : "");
    setObservacoes(material?.observacoes ?? "");
  }, [open, material]);

  const saving = criarMaterial.isPending || atualizarMaterial.isPending;

  const handleSubmit = async () => {
    if (!nome.trim()) return toast.error("Informe o nome do material.");
    if (!categoriaId) return toast.error("Selecione a categoria.");
    if (!unidadeId) return toast.error("Selecione a unidade de medida.");

    const min = estoqueMinimo === "" ? 0 : Number(estoqueMinimo);
    const max = estoqueMaximo === "" ? null : Number(estoqueMaximo);
    if (Number.isNaN(min) || min < 0) return toast.error("Estoque mínimo inválido.");
    if (max != null && (Number.isNaN(max) || max < 0)) return toast.error("Estoque máximo inválido.");
    if (max != null && max < min) return toast.error("O estoque máximo não pode ser menor que o mínimo.");

    const payload = {
      nome,
      descricao: descricao || null,
      categoria_id: categoriaId,
      unidade_medida_id: unidadeId,
      marca: marca || null,
      modelo: modelo || null,
      especificacao: especificacao || null,
      estoque_minimo: min,
      estoque_maximo: max,
      localizacao_id: localizacaoId === NONE ? null : localizacaoId,
      valor_medio: valorMedio === "" ? null : Number(valorMedio),
      controla_lote: controlaLote,
      controla_validade: controlaValidade,
      observacoes: observacoes || null,
    };

    try {
      if (material) {
        await atualizarMaterial.mutateAsync({ id: material.id, ...payload, ativo: material.ativo });
      } else {
        await criarMaterial.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch {
      /* toast já exibido no hook */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material ? "Editar material" : "Novo material"}</DialogTitle>
          <DialogDescription>
            O código é gerado automaticamente e o estoque é movimentado somente pelo fluxo de
            movimentações do Almoxarifado (etapa posterior).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Identificação</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Código</Label>
                <Input value={material?.codigo ?? "Gerado automaticamente"} readOnly disabled />
              </div>
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Papel A4 75g" />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.filter((c) => c.ativo || c.id === categoriaId).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade de medida *</Label>
                <Select value={unidadeId} onValueChange={setUnidadeId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {unidades.filter((u) => u.ativo || u.id === unidadeId).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.sigla} — {u.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Especificação</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input value={marca} onChange={(e) => setMarca(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input value={modelo} onChange={(e) => setModelo(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Especificação técnica</Label>
                <Textarea value={especificacao} onChange={(e) => setEspecificacao(e.target.value)} rows={2} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Controle</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Estoque mínimo</Label>
                <Input type="number" min="0" value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estoque máximo</Label>
                <Input type="number" min="0" value={estoqueMaximo} onChange={(e) => setEstoqueMaximo(e.target.value)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Controla lote?</Label>
                <Switch checked={controlaLote} onCheckedChange={setControlaLote} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">Controla validade?</Label>
                <Switch checked={controlaValidade} onCheckedChange={setControlaValidade} />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Armazenamento e valor</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Localização</Label>
                <Select value={localizacaoId} onValueChange={setLocalizacaoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Não definida</SelectItem>
                    {localizacoes.filter((l) => l.ativo || l.id === localizacaoId).map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor médio (R$)</Label>
                <Input type="number" min="0" step="0.01" value={valorMedio} onChange={(e) => setValorMedio(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Observações</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {material ? "Salvar alterações" : "Cadastrar material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
