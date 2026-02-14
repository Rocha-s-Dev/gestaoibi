import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Recycle, Trash2, Edit, TreePine } from "lucide-react";
import { MetaAmbientalDialog } from "./MetaAmbientalDialog";
import { DeleteMetaAmbientalDialog } from "./DeleteMetaAmbientalDialog";
import { useMetasAmbientais } from "@/hooks/useAmbiental";

interface Props {
  refreshTrigger: number;
  onMetaAdded: () => void;
}

export function MetasAmbientais({ refreshTrigger, onMetaAdded }: Props) {
  const { metas, loading, addMeta, updateMeta, deleteMeta } = useMetasAmbientais();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [currentMeta, setCurrentMeta] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredMetas = metas.filter((meta) => {
    const matchesSearch = meta.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meta.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFiltro === "todos" || meta.categoria === categoriaFiltro;
    const matchesStatus = statusFiltro === "todos" || meta.status === statusFiltro;
    return matchesSearch && matchesCategoria && matchesStatus;
  });

  const handleAdd = () => { setCurrentMeta(null); setShowDialog(true); };
  const handleEdit = (meta: any) => { setCurrentMeta(meta); setShowDialog(true); };
  const handleDelete = (meta: any) => { setCurrentMeta(meta); setShowDeleteDialog(true); };

  const handleSaveMeta = async (meta: any) => {
    const payload = {
      titulo: meta.titulo,
      descricao: meta.descricao,
      categoria: meta.categoria,
      valor_atual: meta.valorAtual,
      valor_meta: meta.valorMeta,
      unidade_medida: meta.unidadeMedida,
      prazo: meta.prazo,
      status: meta.status,
    };
    if (currentMeta) {
      await updateMeta(currentMeta.id, payload);
    } else {
      await addMeta(payload);
    }
    onMetaAdded();
  };

  const handleConfirmDelete = async () => {
    if (currentMeta) {
      await deleteMeta(currentMeta.id);
      setShowDeleteDialog(false);
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "residuos": return <Recycle className="h-4 w-4 mr-1" />;
      case "areas_verdes": return <TreePine className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "em_andamento": return <Badge className="bg-blue-500 hover:bg-blue-600">Em andamento</Badge>;
      case "concluida": return <Badge className="bg-green-500 hover:bg-green-600">Concluída</Badge>;
      case "atrasada": return <Badge variant="destructive">Atrasada</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatarProgresso = (atual: number, meta: number) => {
    if (meta === 0) return "0%";
    return `${Math.round((atual / meta) * 100)}%`;
  };

  const mapToDialogFormat = (m: any) => m ? ({
    id: m.id, titulo: m.titulo, descricao: m.descricao || "",
    categoria: m.categoria, valorAtual: Number(m.valor_atual),
    valorMeta: Number(m.valor_meta), unidadeMedida: m.unidade_medida,
    prazo: m.prazo, status: m.status,
  }) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <h2 className="text-xl font-semibold">Metas Ambientais</h2>
        <Button onClick={handleAdd}>Adicionar Meta</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-3">
          <Input placeholder="Pesquisar metas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="mb-4" />
        </div>
        <div>
          <Label htmlFor="categoriaFiltro">Filtrar por categoria</Label>
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger id="categoriaFiltro"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              <SelectItem value="residuos">Redução de Resíduos</SelectItem>
              <SelectItem value="areas_verdes">Áreas Verdes</SelectItem>
              <SelectItem value="outro">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="statusFiltro">Filtrar por status</Label>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger id="statusFiltro"><SelectValue placeholder="Todos os status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="atrasada">Atrasada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredMetas.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <Recycle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">Nenhuma meta encontrada</h3>
              <p className="mt-1 text-sm text-muted-foreground">Não foram encontradas metas com os filtros aplicados.</p>
            </div>
          ) : (
            filteredMetas.map((meta) => (
              <Card key={meta.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{meta.titulo}</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(meta)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(meta)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 space-x-2">
                    <div className="flex items-center">
                      {getCategoriaIcon(meta.categoria)}
                      <Badge variant="outline">
                        {meta.categoria === "residuos" ? "Redução de Resíduos" :
                         meta.categoria === "areas_verdes" ? "Áreas Verdes" : "Outro"}
                      </Badge>
                    </div>
                    {getStatusBadge(meta.status)}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{meta.descricao}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Atual:</span> {Number(meta.valor_atual)} {meta.unidade_medida}</div>
                    <div><span className="text-muted-foreground">Meta:</span> {Number(meta.valor_meta)} {meta.unidade_medida}</div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
                    <span>Prazo: {new Date(meta.prazo).toLocaleDateString('pt-BR')}</span>
                    <span className="font-semibold">Progresso: {formatarProgresso(Number(meta.valor_atual), Number(meta.valor_meta))}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {showDialog && (
        <MetaAmbientalDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSave={handleSaveMeta}
          meta={mapToDialogFormat(currentMeta)}
        />
      )}

      {showDeleteDialog && currentMeta && (
        <DeleteMetaAmbientalDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleConfirmDelete}
          metaTitulo={currentMeta.titulo}
        />
      )}
    </div>
  );
}
