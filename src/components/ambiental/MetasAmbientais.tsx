
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Recycle, Trash2, Edit, TreePine } from "lucide-react";
import { toast } from "sonner";
import { MetaAmbientalDialog } from "./MetaAmbientalDialog";
import { DeleteMetaAmbientalDialog } from "./DeleteMetaAmbientalDialog";

type MetaAmbiental = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "residuos" | "areas_verdes" | "outro";
  valorAtual: number;
  valorMeta: number;
  unidadeMedida: string;
  prazo: string;
  status: "em_andamento" | "concluida" | "atrasada";
};

const metasIniciais: MetaAmbiental[] = [
  {
    id: "1",
    titulo: "Redução de resíduos urbanos",
    descricao: "Reduzir em 15% a quantidade de resíduos sólidos enviados para o aterro sanitário municipal.",
    categoria: "residuos",
    valorAtual: 85,
    valorMeta: 72,
    unidadeMedida: "toneladas/mês",
    prazo: "2024-12-31",
    status: "em_andamento",
  },
  {
    id: "2",
    titulo: "Criação do Parque Municipal",
    descricao: "Implementar novo parque urbano com infraestrutura completa e plantio de espécies nativas.",
    categoria: "areas_verdes",
    valorAtual: 0,
    valorMeta: 1,
    unidadeMedida: "parque",
    prazo: "2025-06-30",
    status: "em_andamento",
  },
  {
    id: "3",
    titulo: "Revitalização de praças",
    descricao: "Revitalizar áreas verdes em 5 praças da região central, incluindo plantio de árvores e recuperação de gramados.",
    categoria: "areas_verdes",
    valorAtual: 1,
    valorMeta: 5,
    unidadeMedida: "praças",
    prazo: "2024-10-15",
    status: "em_andamento",
  }
];

interface Props {
  refreshTrigger: number;
  onMetaAdded: () => void;
}

export function MetasAmbientais({ refreshTrigger, onMetaAdded }: Props) {
  const [metas, setMetas] = useState<MetaAmbiental[]>(metasIniciais);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [currentMeta, setCurrentMeta] = useState<MetaAmbiental | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const filteredMetas = metas.filter((meta) => {
    const matchesSearch = meta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         meta.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFiltro === "todos" || meta.categoria === categoriaFiltro;
    const matchesStatus = statusFiltro === "todos" || meta.status === statusFiltro;
    
    return matchesSearch && matchesCategoria && matchesStatus;
  });

  const handleAdd = () => {
    setCurrentMeta(null);
    setShowDialog(true);
  };

  const handleEdit = (meta: MetaAmbiental) => {
    setCurrentMeta(meta);
    setShowDialog(true);
  };

  const handleDelete = (meta: MetaAmbiental) => {
    setCurrentMeta(meta);
    setShowDeleteDialog(true);
  };

  const handleSaveMeta = (meta: MetaAmbiental) => {
    if (currentMeta) {
      // Editar meta existente
      setMetas(metas.map(m => m.id === meta.id ? meta : m));
      toast.success("Meta atualizada com sucesso!");
    } else {
      // Adicionar nova meta
      const newMeta = {
        ...meta,
        id: Date.now().toString(),
      };
      setMetas([...metas, newMeta]);
      toast.success("Meta cadastrada com sucesso!");
    }
    onMetaAdded();
  };

  const handleConfirmDelete = () => {
    if (currentMeta) {
      setMetas(metas.filter(m => m.id !== currentMeta.id));
      toast.success("Meta excluída com sucesso!");
      setShowDeleteDialog(false);
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "residuos":
        return <Recycle className="h-4 w-4 mr-1" />;
      case "areas_verdes":
        return <TreePine className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "em_andamento":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Em andamento</Badge>;
      case "concluida":
        return <Badge className="bg-green-500 hover:bg-green-600">Concluída</Badge>;
      case "atrasada":
        return <Badge variant="destructive">Atrasada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatarProgresso = (atual: number, meta: number) => {
    if (meta === 0) return "0%";
    const progresso = (atual / meta) * 100;
    return `${Math.round(progresso)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <h2 className="text-xl font-semibold">Metas Ambientais</h2>
        <Button onClick={handleAdd}>Adicionar Meta</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-3">
          <Input
            placeholder="Pesquisar metas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
        </div>
        
        <div>
          <Label htmlFor="categoriaFiltro">Filtrar por categoria</Label>
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger id="categoriaFiltro">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
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
            <SelectTrigger id="statusFiltro">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="em_andamento">Em andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="atrasada">Atrasada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredMetas.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <Recycle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Nenhuma meta encontrada</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Não foram encontradas metas com os filtros aplicados.
            </p>
          </div>
        ) : (
          filteredMetas.map((meta) => (
            <Card key={meta.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{meta.titulo}</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(meta)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(meta)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                  <div>
                    <span className="text-muted-foreground">Atual:</span> {meta.valorAtual} {meta.unidadeMedida}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Meta:</span> {meta.valorMeta} {meta.unidadeMedida}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex justify-between items-center">
                  <span>Prazo: {new Date(meta.prazo).toLocaleDateString('pt-BR')}</span>
                  <span className="font-semibold">
                    Progresso: {formatarProgresso(meta.valorAtual, meta.valorMeta)}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showDialog && (
        <MetaAmbientalDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSave={handleSaveMeta}
          meta={currentMeta}
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
