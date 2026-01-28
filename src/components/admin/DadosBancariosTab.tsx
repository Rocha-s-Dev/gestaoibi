import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface DadoBancario {
  id: string;
  servidor_id: string;
  banco_codigo: string;
  banco_nome: string;
  agencia: string;
  agencia_digito: string | null;
  conta: string;
  conta_digito: string | null;
  tipo_conta: string;
  pix_tipo: string | null;
  pix_chave: string | null;
  conta_principal: boolean;
  ativo: boolean;
}

interface DadosBancariosTabProps {
  servidorId: string;
}

const BANCOS = [
  { codigo: "001", nome: "Banco do Brasil" },
  { codigo: "033", nome: "Santander" },
  { codigo: "104", nome: "Caixa Econômica Federal" },
  { codigo: "237", nome: "Bradesco" },
  { codigo: "341", nome: "Itaú" },
  { codigo: "422", nome: "Safra" },
  { codigo: "745", nome: "Citibank" },
  { codigo: "756", nome: "Sicoob" },
  { codigo: "077", nome: "Inter" },
  { codigo: "260", nome: "Nubank" },
  { codigo: "290", nome: "PagBank" },
  { codigo: "380", nome: "PicPay" },
  { codigo: "212", nome: "Banco Original" },
  { codigo: "336", nome: "C6 Bank" },
];

export function DadosBancariosTab({ servidorId }: DadosBancariosTabProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<DadoBancario | null>(null);
  const [formData, setFormData] = useState({
    banco_codigo: "",
    banco_nome: "",
    agencia: "",
    agencia_digito: "",
    conta: "",
    conta_digito: "",
    tipo_conta: "corrente",
    pix_tipo: "",
    pix_chave: "",
    conta_principal: false,
  });

  const { data: contas, isLoading } = useQuery({
    queryKey: ["dados_bancarios", servidorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dados_bancarios")
        .select("*")
        .eq("servidor_id", servidorId)
        .eq("ativo", true)
        .order("conta_principal", { ascending: false });
      if (error) throw error;
      return data as DadoBancario[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        servidor_id: servidorId,
        banco_codigo: data.banco_codigo,
        banco_nome: data.banco_nome,
        agencia: data.agencia,
        agencia_digito: data.agencia_digito || null,
        conta: data.conta,
        conta_digito: data.conta_digito || null,
        tipo_conta: data.tipo_conta,
        pix_tipo: data.pix_tipo || null,
        pix_chave: data.pix_chave || null,
        conta_principal: data.conta_principal,
      };

      // Se marcou como principal, desmarca as outras
      if (data.conta_principal) {
        await supabase
          .from("dados_bancarios")
          .update({ conta_principal: false })
          .eq("servidor_id", servidorId)
          .eq("ativo", true);
      }

      if (data.id) {
        const { error } = await supabase
          .from("dados_bancarios")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dados_bancarios").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dados_bancarios", servidorId] });
      toast.success(editingConta ? "Conta atualizada!" : "Conta adicionada!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar conta bancária");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dados_bancarios")
        .update({ ativo: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dados_bancarios", servidorId] });
      toast.success("Conta removida!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao remover conta");
    },
  });

  const resetForm = () => {
    setFormData({
      banco_codigo: "",
      banco_nome: "",
      agencia: "",
      agencia_digito: "",
      conta: "",
      conta_digito: "",
      tipo_conta: "corrente",
      pix_tipo: "",
      pix_chave: "",
      conta_principal: false,
    });
    setEditingConta(null);
  };

  const handleBancoChange = (codigo: string) => {
    const banco = BANCOS.find((b) => b.codigo === codigo);
    setFormData({
      ...formData,
      banco_codigo: codigo,
      banco_nome: banco?.nome || "",
    });
  };

  const handleEdit = (conta: DadoBancario) => {
    setEditingConta(conta);
    setFormData({
      banco_codigo: conta.banco_codigo,
      banco_nome: conta.banco_nome,
      agencia: conta.agencia,
      agencia_digito: conta.agencia_digito || "",
      conta: conta.conta,
      conta_digito: conta.conta_digito || "",
      tipo_conta: conta.tipo_conta,
      pix_tipo: conta.pix_tipo || "",
      pix_chave: conta.pix_chave || "",
      conta_principal: conta.conta_principal,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ ...formData, id: editingConta?.id });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold">Dados Bancários</h4>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : contas?.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          Nenhuma conta bancária cadastrada.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Agência/Conta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>PIX</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contas?.map((conta) => (
              <TableRow key={conta.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {conta.conta_principal && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {conta.banco_nome}
                  </div>
                </TableCell>
                <TableCell>
                  {conta.agencia}
                  {conta.agencia_digito ? `-${conta.agencia_digito}` : ""} /{" "}
                  {conta.conta}
                  {conta.conta_digito ? `-${conta.conta_digito}` : ""}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {conta.tipo_conta === "corrente"
                      ? "Corrente"
                      : conta.tipo_conta === "poupanca"
                      ? "Poupança"
                      : "Salário"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {conta.pix_chave ? (
                    <span className="text-sm text-muted-foreground">
                      {conta.pix_tipo?.toUpperCase()}: {conta.pix_chave.slice(0, 15)}...
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(conta)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(conta.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingConta ? "Editar Conta Bancária" : "Nova Conta Bancária"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="banco">Banco *</Label>
              <Select value={formData.banco_codigo} onValueChange={handleBancoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {BANCOS.map((banco) => (
                    <SelectItem key={banco.codigo} value={banco.codigo}>
                      {banco.codigo} - {banco.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="agencia">Agência *</Label>
                <Input
                  id="agencia"
                  value={formData.agencia}
                  onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agencia_digito">Dígito</Label>
                <Input
                  id="agencia_digito"
                  value={formData.agencia_digito}
                  onChange={(e) => setFormData({ ...formData, agencia_digito: e.target.value })}
                  maxLength={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="conta">Conta *</Label>
                <Input
                  id="conta"
                  value={formData.conta}
                  onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conta_digito">Dígito</Label>
                <Input
                  id="conta_digito"
                  value={formData.conta_digito}
                  onChange={(e) => setFormData({ ...formData, conta_digito: e.target.value })}
                  maxLength={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_conta">Tipo de Conta *</Label>
              <Select
                value={formData.tipo_conta}
                onValueChange={(v) => setFormData({ ...formData, tipo_conta: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corrente">Conta Corrente</SelectItem>
                  <SelectItem value="poupanca">Conta Poupança</SelectItem>
                  <SelectItem value="salario">Conta Salário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pix_tipo">Tipo PIX</Label>
                <Select
                  value={formData.pix_tipo}
                  onValueChange={(v) => setFormData({ ...formData, pix_tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatorio">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix_chave">Chave PIX</Label>
                <Input
                  id="pix_chave"
                  value={formData.pix_chave}
                  onChange={(e) => setFormData({ ...formData, pix_chave: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="conta_principal"
                checked={formData.conta_principal}
                onCheckedChange={(c) => setFormData({ ...formData, conta_principal: !!c })}
              />
              <Label htmlFor="conta_principal" className="text-sm">
                Conta principal para recebimento de salário
              </Label>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
