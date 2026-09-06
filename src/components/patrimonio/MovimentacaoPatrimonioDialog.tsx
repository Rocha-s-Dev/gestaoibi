import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { useSecretarias } from "@/hooks/useSecretarias";
import { useMunicipios } from "@/hooks/useMunicipios";
import { useUnidadesAdministrativas } from "@/hooks/useUnidadesAdministrativas";
import {
  TIPO_MOVIMENTACAO_LABELS,
  TipoMovimentacao,
  usePatrimonio,
  useMovimentacoesPatrimonio,
} from "@/hooks/usePatrimonio";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bemIdInicial?: string;
}

const NONE = "none";

export function MovimentacaoPatrimonioDialog({ open, onOpenChange, bemIdInicial }: Props) {
  const { bens } = usePatrimonio();
  const { createMovimentacao } = useMovimentacoesPatrimonio();
  const { municipioAtivo } = useMunicipios();
  const { secretarias } = useSecretarias(municipioAtivo?.id);

  const [bemId, setBemId] = useState<string>("");
  const [tipo, setTipo] = useState<TipoMovimentacao>("transferencia_secretaria");
  const [secretariaDestino, setSecretariaDestino] = useState<string | null>(null);
  const [unidadeDestino, setUnidadeDestino] = useState<string | null>(null);
  const [localDestino, setLocalDestino] = useState("");
  const [dataMov, setDataMov] = useState(new Date().toISOString().split("T")[0]);
  const [motivo, setMotivo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [responsavel, setResponsavel] = useState<UsuarioRH | null>(null);
  const [showVincular, setShowVincular] = useState(false);

  const { unidades } = useUnidadesAdministrativas(secretariaDestino || undefined);
  const bem = bens.find((b) => b.id === bemId);

  useEffect(() => {
    if (!open) return;
    setBemId(bemIdInicial || "");
    setTipo("transferencia_secretaria");
    setSecretariaDestino(null);
    setUnidadeDestino(null);
    setLocalDestino("");
    setMotivo("");
    setObservacoes("");
    setResponsavel(null);
    setDataMov(new Date().toISOString().split("T")[0]);
  }, [open, bemIdInicial]);

  const handleSubmit = () => {
    if (!bemId) return toast.error("Selecione o bem a movimentar.");
    if (!motivo.trim()) return toast.error("Informe o motivo da movimentação.");
    if (tipo === "transferencia_secretaria" && !secretariaDestino) return toast.error("Selecione a secretaria de destino.");
    if (tipo === "transferencia_unidade" && !unidadeDestino) return toast.error("Selecione a unidade de destino.");
    if (tipo === "troca_responsavel" && !responsavel) return toast.error("Selecione o novo responsável.");
    if (tipo === "mudanca_localizacao" && !localDestino.trim()) return toast.error("Informe a nova localização.");

    createMovimentacao.mutate(
      {
        bem_id: bemId,
        tipo_movimentacao: tipo,
        secretaria_origem_id: bem?.secretaria_id ?? null,
        secretaria_destino_id: secretariaDestino,
        unidade_origem_id: bem?.unidade_id ?? null,
        unidade_destino_id: unidadeDestino,
        responsavel_origem_id: bem?.responsavel_id ?? null,
        responsavel_destino_id: responsavel?.user_id ?? null,
        local_origem: bem?.localizacao ?? null,
        local_destino: localDestino || null,
        data_movimentacao: dataMov,
        motivo: motivo.trim(),
        observacoes: observacoes || null,
        status: "pendente",
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Movimentação Patrimonial</DialogTitle>
            <DialogDescription>
              A movimentação é registrada como pendente e passa por aprovação antes de alterar o cadastro do bem.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bem Patrimonial *</Label>
              <Select value={bemId} onValueChange={setBemId}>
                <SelectTrigger><SelectValue placeholder="Selecione o bem" /></SelectTrigger>
                <SelectContent>
                  {bens.filter((b) => b.status !== "baixado").map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.numero_tombamento} — {b.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {bem && (
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Secretaria atual: </span>{bem.secretarias?.nome || "—"}</p>
                <p><span className="text-muted-foreground">Unidade atual: </span>{bem.unidades_administrativas?.nome || "—"}</p>
                <p><span className="text-muted-foreground">Localização atual: </span>{bem.localizacao || "—"}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Movimentação *</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoMovimentacao)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_MOVIMENTACAO_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data da Movimentação</Label>
                <Input type="date" value={dataMov} onChange={(e) => setDataMov(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Secretaria de Destino</Label>
                <Select
                  value={secretariaDestino ?? NONE}
                  onValueChange={(v) => { setSecretariaDestino(v === NONE ? null : v); setUnidadeDestino(null); }}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Manter atual</SelectItem>
                    {secretarias.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade de Destino</Label>
                <Select value={unidadeDestino ?? NONE} onValueChange={(v) => setUnidadeDestino(v === NONE ? null : v)} disabled={!secretariaDestino}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Manter atual</SelectItem>
                    {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Novo Responsável (RH)</Label>
                <div className="flex gap-2">
                  <Input readOnly value={responsavel ? responsavel.nome : "Manter atual"} />
                  <Button type="button" variant="outline" onClick={() => setShowVincular(true)}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nova Localização</Label>
                <Input value={localDestino} onChange={(e) => setLocalDestino(e.target.value)} placeholder="Ex.: Almoxarifado Central" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo *</Label>
              <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMovimentacao.isPending}>
              {createMovimentacao.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Registrar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={showVincular}
        onOpenChange={setShowVincular}
        onUsuarioSelecionado={(u) => setResponsavel(u)}
        titulo="Selecionar Novo Responsável"
      />
    </>
  );
}
