import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { AlmoxarifadoItem, estoqueDisponivel } from "@/hooks/useAlmoxarifado";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  material: AlmoxarifadoItem | null;
  categoriaNome?: string;
  unidadeNome?: string;
  localizacaoNome?: string;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm">{value ?? "—"}</p>
  </div>
);

const dt = (v?: string | null) => (v ? new Date(v).toLocaleString("pt-BR") : "—");

export function MaterialDetailsDialog({
  open, onOpenChange, material, categoriaNome, unidadeNome, localizacaoNome,
}: Props) {
  if (!material) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {material.codigo} — {material.nome}
            <Badge variant={material.ativo ? "default" : "secondary"}>
              {material.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </DialogTitle>
          <DialogDescription>Ficha do material do Almoxarifado Central.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Row label="Código" value={material.codigo} />
          <Row label="Categoria" value={categoriaNome} />
          <Row label="Unidade" value={unidadeNome} />
          <Row label="Marca" value={material.marca} />
          <Row label="Modelo" value={material.modelo} />
          <Row label="Localização" value={localizacaoNome} />
          <Row label="Estoque atual" value={Number(material.estoque_atual)} />
          <Row label="Estoque reservado" value={Number(material.estoque_reservado)} />
          <Row label="Estoque disponível" value={estoqueDisponivel(material)} />
          <Row label="Estoque mínimo" value={Number(material.estoque_minimo)} />
          <Row label="Estoque máximo" value={material.estoque_maximo ?? "—"} />
          <Row
            label="Valor médio"
            value={
              material.valor_medio == null
                ? "—"
                : Number(material.valor_medio).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            }
          />
          <Row label="Controla lote" value={material.controla_lote ? "Sim" : "Não"} />
          <Row label="Controla validade" value={material.controla_validade ? "Sim" : "Não"} />
          <Row label="Cadastrado em" value={dt(material.created_at)} />
          <Row label="Atualizado em" value={dt(material.updated_at)} />
          <div className="sm:col-span-2 md:col-span-3">
            <Row label="Descrição" value={material.descricao} />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <Row label="Especificação" value={material.especificacao} />
          </div>
          <div className="sm:col-span-2 md:col-span-3">
            <Row label="Observações" value={material.observacoes} />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            As movimentações de estoque (entradas, saídas, transferências e inventário) serão
            disponibilizadas em uma etapa posterior do Almoxarifado.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
