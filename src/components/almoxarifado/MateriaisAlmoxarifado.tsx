import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Plus, Search, Pencil, Eye, Ban, RotateCcw, Loader2 } from "lucide-react";
import { MaterialDialog } from "./MaterialDialog";
import { MaterialDetailsDialog } from "./MaterialDetailsDialog";
import {
  AlmoxarifadoItem,
  useAlmoxarifadoCategorias,
  useAlmoxarifadoLocalizacoes,
  useAlmoxarifadoMateriais,
  useAlmoxarifadoUnidades,
} from "@/hooks/useAlmoxarifado";

const PAGE_SIZE = 10;

export function MateriaisAlmoxarifado() {
  const { itens, isLoading, alterarSituacao } = useAlmoxarifadoMateriais();
  const { categorias } = useAlmoxarifadoCategorias();
  const { unidades } = useAlmoxarifadoUnidades();
  const { localizacoes } = useAlmoxarifadoLocalizacoes();

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<AlmoxarifadoItem | null>(null);
  const [details, setDetails] = useState<AlmoxarifadoItem | null>(null);

  const [busca, setBusca] = useState("");
  const [fCategoria, setFCategoria] = useState("all");
  const [fUnidade, setFUnidade] = useState("all");
  const [fLocalizacao, setFLocalizacao] = useState("all");
  const [fSituacao, setFSituacao] = useState("ativos");
  const [ordem, setOrdem] = useState("codigo");
  const [page, setPage] = useState(1);

  const catNome = (id?: string | null) => categorias.find((c) => c.id === id)?.nome ?? "—";
  const uniNome = (id?: string | null) => {
    const u = unidades.find((x) => x.id === id);
    return u ? u.sigla : "—";
  };
  const locNome = (id?: string | null) => localizacoes.find((l) => l.id === id)?.nome ?? "—";

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const lista = itens.filter((i) => {
      if (t) {
        const alvo = [i.codigo, i.nome, i.marca, i.modelo].filter(Boolean).join(" ").toLowerCase();
        if (!alvo.includes(t)) return false;
      }
      if (fCategoria !== "all" && i.categoria_id !== fCategoria) return false;
      if (fUnidade !== "all" && i.unidade_medida_id !== fUnidade) return false;
      if (fLocalizacao !== "all" && i.localizacao_id !== fLocalizacao) return false;
      if (fSituacao === "ativos" && !i.ativo) return false;
      if (fSituacao === "inativos" && i.ativo) return false;
      return true;
    });

    return [...lista].sort((a, b) => {
      if (ordem === "nome") return a.nome.localeCompare(b.nome);
      if (ordem === "categoria") return catNome(a.categoria_id).localeCompare(catNome(b.categoria_id));
      return (a.codigo ?? "").localeCompare(b.codigo ?? "");
    });
  }, [itens, busca, fCategoria, fUnidade, fLocalizacao, fSituacao, ordem, categorias]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagina = filtrados.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Materiais ({filtrados.length})
          </CardTitle>
          <Button onClick={() => { setEditing(null); setShowDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo material
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative lg:col-span-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por código, nome, marca ou modelo"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={fCategoria} onValueChange={(v) => { setFCategoria(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fUnidade} onValueChange={(v) => { setFUnidade(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Unidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                {unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.sigla} — {u.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fLocalizacao} onValueChange={(v) => { setFLocalizacao(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Localização" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as localizações</SelectItem>
                {localizacoes.map((l) => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fSituacao} onValueChange={(v) => { setFSituacao(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Situação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativos">Somente ativos</SelectItem>
                <SelectItem value="inativos">Somente inativos</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="codigo">Ordenar por código</SelectItem>
                <SelectItem value="nome">Ordenar por nome</SelectItem>
                <SelectItem value="categoria">Ordenar por categoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : pagina.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum material encontrado.</p>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Un.</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead className="text-right">Estoque</TableHead>
                      <TableHead className="text-right">Mínimo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagina.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-mono text-xs">{i.codigo}</TableCell>
                        <TableCell className="font-medium">{i.nome}</TableCell>
                        <TableCell>{catNome(i.categoria_id)}</TableCell>
                        <TableCell>{uniNome(i.unidade_medida_id)}</TableCell>
                        <TableCell>{locNome(i.localizacao_id)}</TableCell>
                        <TableCell className="text-right">{Number(i.estoque_atual)}</TableCell>
                        <TableCell className="text-right">{Number(i.estoque_minimo)}</TableCell>
                        <TableCell>
                          <Badge variant={i.ativo ? "default" : "secondary"}>{i.ativo ? "Ativo" : "Inativo"}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setDetails(i)} title="Visualizar">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setShowDialog(true); }} title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title={i.ativo ? "Inativar" : "Reativar"}
                              onClick={() => alterarSituacao.mutate({ id: i.id, ativo: !i.ativo })}
                            >
                              {i.ativo ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 md:hidden">
                {pagina.map((i) => (
                  <div key={i.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">{i.codigo}</p>
                        <p className="font-medium truncate">{i.nome}</p>
                      </div>
                      <Badge variant={i.ativo ? "default" : "secondary"}>{i.ativo ? "Ativo" : "Inativo"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {catNome(i.categoria_id)} · {uniNome(i.unidade_medida_id)} · Estoque {Number(i.estoque_atual)}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDetails(i)}>Ver</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditing(i); setShowDialog(true); }}>Editar</Button>
                      <Button size="sm" variant="outline" onClick={() => alterarSituacao.mutate({ id: i.id, ativo: !i.ativo })}>
                        {i.ativo ? "Inativar" : "Reativar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</Button>
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Próxima</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <MaterialDialog open={showDialog} onOpenChange={setShowDialog} material={editing} />
      <MaterialDetailsDialog
        open={!!details}
        onOpenChange={(o) => !o && setDetails(null)}
        material={details}
        categoriaNome={catNome(details?.categoria_id)}
        unidadeNome={details ? uniNome(details.unidade_medida_id) : undefined}
        localizacaoNome={locNome(details?.localizacao_id)}
      />
    </div>
  );
}
