import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Plus, Search, Pencil, ArrowDownCircle, Loader2, FileSignature } from "lucide-react";
import { ExportButtons } from "@/components/shared/ExportButtons";
import { BemPatrimonialDialog } from "./BemPatrimonialDialog";
import { TermosResponsabilidadeDialog } from "./TermosResponsabilidadeDialog";
import {
  BemPatrimonial,
  ESTADO_CONSERVACAO_LABELS,
  STATUS_BEM_LABELS,
  useBensCategorias,
  usePatrimonio,
} from "@/hooks/usePatrimonio";
import { useSecretarias } from "@/hooks/useSecretarias";
import { useMunicipios } from "@/hooks/useMunicipios";

const PAGE_SIZE = 10;

const statusVariant = (s: string) =>
  s === "baixado" || s === "extraviado" || s === "alienado"
    ? "destructive"
    : s === "em_manutencao" || s === "em_transferencia" || s === "ocioso"
      ? "secondary"
      : "default";

const brl = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function BensPatrimoniais() {
  const { bens, isLoading, baixarBem } = usePatrimonio();
  const { categorias } = useBensCategorias();
  const { municipioAtivo } = useMunicipios();
  const { secretarias } = useSecretarias(municipioAtivo?.id);

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<BemPatrimonial | null>(null);
  const [termosBem, setTermosBem] = useState<BemPatrimonial | null>(null);
  const [baixa, setBaixa] = useState<BemPatrimonial | null>(null);
  const [motivoBaixa, setMotivoBaixa] = useState("");

  const [busca, setBusca] = useState("");
  const [fCategoria, setFCategoria] = useState("all");
  const [fSecretaria, setFSecretaria] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fEstado, setFEstado] = useState("all");
  const [dataDe, setDataDe] = useState("");
  const [dataAte, setDataAte] = useState("");
  const [page, setPage] = useState(1);

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return bens.filter((b) => {
      if (t) {
        const alvo = [b.numero_tombamento, b.descricao, b.marca, b.modelo, b.numero_serie, b.localizacao]
          .filter(Boolean).join(" ").toLowerCase();
        if (!alvo.includes(t)) return false;
      }
      if (fCategoria !== "all" && b.categoria_id !== fCategoria) return false;
      if (fSecretaria !== "all" && b.secretaria_id !== fSecretaria) return false;
      if (fStatus !== "all" && b.status !== fStatus) return false;
      if (fEstado !== "all" && b.estado_conservacao !== fEstado) return false;
      if (dataDe && (!b.data_aquisicao || b.data_aquisicao < dataDe)) return false;
      if (dataAte && (!b.data_aquisicao || b.data_aquisicao > dataAte)) return false;
      return true;
    });
  }, [bens, busca, fCategoria, fSecretaria, fStatus, fEstado, dataDe, dataAte]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagina = filtrados.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportColumns = [
    { header: "Tombamento", key: "numero_tombamento" },
    { header: "Descrição", key: "descricao" },
    { header: "Categoria", key: "categoria" },
    { header: "Secretaria", key: "secretaria_nome" },
    { header: "Unidade", key: "unidade_nome" },
    { header: "Status", key: "status_label" },
    { header: "Conservação", key: "estado_label" },
    { header: "Valor Atual", key: "valor_atual", format: (v: any) => brl(v) },
  ];

  const exportData = filtrados.map((b) => ({
    ...b,
    categoria: b.bens_categorias?.nome || b.categoria || "—",
    secretaria_nome: b.secretarias?.nome || "—",
    unidade_nome: b.unidades_administrativas?.nome || "—",
    status_label: STATUS_BEM_LABELS[b.status],
    estado_label: ESTADO_CONSERVACAO_LABELS[b.estado_conservacao],
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Bens Patrimoniais</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastro e controle de tombamento dos bens municipais. Bens nunca são excluídos, apenas baixados.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons title="Bens Patrimoniais" columns={exportColumns} data={exportData} filename="bens-patrimoniais" />
            <Button onClick={() => { setEditing(null); setShowDialog(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Novo Bem
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Buscar por tombamento, descrição, série..." value={busca} onChange={(e) => { setBusca(e.target.value); setPage(1); }} />
            </div>
            <Select value={fCategoria} onValueChange={(v) => { setFCategoria(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fSecretaria} onValueChange={(v) => { setFSecretaria(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Secretaria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as secretarias</SelectItem>
                {secretarias.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={(v) => { setFStatus(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_BEM_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fEstado} onValueChange={(v) => { setFEstado(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Conservação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {Object.entries(ESTADO_CONSERVACAO_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input type="date" value={dataDe} onChange={(e) => { setDataDe(e.target.value); setPage(1); }} />
              <span className="text-muted-foreground text-sm">a</span>
              <Input type="date" value={dataAte} onChange={(e) => { setDataAte(e.target.value); setPage(1); }} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tombamento</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Secretaria / Unidade</TableHead>
                      <TableHead>Conservação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor Atual</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagina.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nenhum bem encontrado.</TableCell></TableRow>
                    ) : pagina.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-sm">{b.numero_tombamento}</TableCell>
                        <TableCell className="max-w-[240px] truncate">{b.descricao}</TableCell>
                        <TableCell>{b.bens_categorias?.nome || b.categoria || "—"}</TableCell>
                        <TableCell className="text-sm">
                          {b.secretarias?.sigla || b.secretarias?.nome || "—"}
                          {b.unidades_administrativas?.nome ? ` / ${b.unidades_administrativas.nome}` : ""}
                        </TableCell>
                        <TableCell><Badge variant="outline">{ESTADO_CONSERVACAO_LABELS[b.estado_conservacao]}</Badge></TableCell>
                        <TableCell><Badge variant={statusVariant(b.status) as any}>{STATUS_BEM_LABELS[b.status]}</Badge></TableCell>
                        <TableCell className="text-right">{brl(b.valor_atual ?? b.valor_aquisicao)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="icon" variant="ghost" title="Termos de responsabilidade" onClick={() => setTermosBem(b)}>
                            <FileSignature className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Editar" onClick={() => { setEditing(b); setShowDialog(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Baixar bem" disabled={b.status === "baixado"} onClick={() => { setBaixa(b); setMotivoBaixa(""); }}>
                            <ArrowDownCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filtrados.length} bem(ns) — página {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Anterior</Button>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Próxima</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <BemPatrimonialDialog open={showDialog} onOpenChange={setShowDialog} bem={editing} />

      {termosBem && (
        <TermosResponsabilidadeDialog
          open={!!termosBem}
          onOpenChange={(o) => !o && setTermosBem(null)}
          bem={termosBem}
        />
      )}

      <Dialog open={!!baixa} onOpenChange={(o) => !o && setBaixa(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baixa do Bem Patrimonial</DialogTitle>
            <DialogDescription>
              O bem não será excluído. Ele passará ao status "Baixado", preservando todo o histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Motivo da baixa *</Label>
            <Textarea value={motivoBaixa} onChange={(e) => setMotivoBaixa(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBaixa(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={!motivoBaixa.trim() || baixarBem.isPending}
              onClick={() => baixa && baixarBem.mutate({ id: baixa.id, motivo: motivoBaixa.trim() }, { onSuccess: () => setBaixa(null) })}
            >
              {baixarBem.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Baixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
