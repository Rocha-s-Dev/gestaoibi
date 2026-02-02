import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Search } from "lucide-react";
import { useListaServicosISS } from "@/hooks/useISSCompleto";

export function ListaServicosISS() {
  const { servicos, isLoading, createServico, updateServico } = useListaServicosISS();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    codigo_municipal: "",
    codigo_lc116: "",
    descricao: "",
    aliquota_padrao: 5,
    aliquota_minima: 2,
    aliquota_maxima: 5,
    base_calculo_descricao: "",
    exige_retencao: false,
  });

  const filteredServicos = servicos.filter(
    (s: any) =>
      s.codigo_municipal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (servico?: any) => {
    if (servico) {
      setEditingServico(servico);
      setFormData({
        codigo_municipal: servico.codigo_municipal || "",
        codigo_lc116: servico.codigo_lc116 || "",
        descricao: servico.descricao || "",
        aliquota_padrao: servico.aliquota_padrao || 5,
        aliquota_minima: servico.aliquota_minima || 2,
        aliquota_maxima: servico.aliquota_maxima || 5,
        base_calculo_descricao: servico.base_calculo_descricao || "",
        exige_retencao: servico.exige_retencao || false,
      });
    } else {
      setEditingServico(null);
      setFormData({
        codigo_municipal: "",
        codigo_lc116: "",
        descricao: "",
        aliquota_padrao: 5,
        aliquota_minima: 2,
        aliquota_maxima: 5,
        base_calculo_descricao: "",
        exige_retencao: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingServico) {
      await updateServico.mutateAsync({ id: editingServico.id, ...formData });
    } else {
      await createServico.mutateAsync(formData);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Serviços (LC 116/2003)</CardTitle>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Municipal</TableHead>
                <TableHead>LC 116</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-center">Alíquota</TableHead>
                <TableHead className="text-center">Retenção</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredServicos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum serviço cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredServicos.map((servico: any) => (
                  <TableRow key={servico.id}>
                    <TableCell className="font-medium">{servico.codigo_municipal}</TableCell>
                    <TableCell>{servico.codigo_lc116 || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{servico.descricao}</TableCell>
                    <TableCell className="text-center">{servico.aliquota_padrao}%</TableCell>
                    <TableCell className="text-center">
                      {servico.exige_retencao ? (
                        <Badge variant="secondary">Sim</Badge>
                      ) : (
                        <Badge variant="outline">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={servico.ativo ? "default" : "destructive"}>
                        {servico.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(servico)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingServico ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código Municipal *</Label>
                <Input
                  value={formData.codigo_municipal}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo_municipal: e.target.value })
                  }
                  placeholder="Ex: 01.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Código LC 116</Label>
                <Input
                  value={formData.codigo_lc116}
                  onChange={(e) =>
                    setFormData({ ...formData, codigo_lc116: e.target.value })
                  }
                  placeholder="Ex: 1.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                placeholder="Descrição do serviço..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Alíquota Mínima (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.aliquota_minima}
                  onChange={(e) =>
                    setFormData({ ...formData, aliquota_minima: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Alíquota Padrão (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.aliquota_padrao}
                  onChange={(e) =>
                    setFormData({ ...formData, aliquota_padrao: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Alíquota Máxima (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.aliquota_maxima}
                  onChange={(e) =>
                    setFormData({ ...formData, aliquota_maxima: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Base de Cálculo</Label>
              <Textarea
                value={formData.base_calculo_descricao}
                onChange={(e) =>
                  setFormData({ ...formData, base_calculo_descricao: e.target.value })
                }
                placeholder="Descrição da base de cálculo..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="exige_retencao"
                checked={formData.exige_retencao}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, exige_retencao: checked })
                }
              />
              <Label htmlFor="exige_retencao">Exige retenção na fonte</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.codigo_municipal ||
                !formData.descricao ||
                createServico.isPending ||
                updateServico.isPending
              }
            >
              {editingServico ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
