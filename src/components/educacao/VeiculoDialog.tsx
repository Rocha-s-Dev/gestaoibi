import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Note: Veiculos table does not exist in the schema
// This is a placeholder dialog that won't work until the table is created

const veiculoSchema = z.object({
  placa: z.string().min(1, "Placa é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  ano: z.coerce.number().optional(),
  capacidade: z.coerce.number().min(1, "Capacidade é obrigatória"),
  motorista_nome: z.string().optional(),
  motorista_cnh: z.string().optional(),
  motorista_telefone: z.string().optional(),
  status: z.enum(["disponivel", "em_uso", "manutencao", "inativo"]).default("disponivel"),
  observacoes: z.string().optional(),
});

type VeiculoFormData = z.infer<typeof veiculoSchema>;

interface VeiculoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veiculo?: any;
}

export function VeiculoDialog({ open, onOpenChange, veiculo }: VeiculoDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<VeiculoFormData>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: {
      placa: "",
      modelo: "",
      ano: undefined,
      capacidade: 40,
      motorista_nome: "",
      motorista_cnh: "",
      motorista_telefone: "",
      status: "disponivel",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (veiculo) {
      form.reset({
        placa: veiculo.placa || "",
        modelo: veiculo.modelo || "",
        ano: veiculo.ano || undefined,
        capacidade: veiculo.capacidade || 40,
        motorista_nome: veiculo.motorista_nome || "",
        motorista_cnh: veiculo.motorista_cnh || "",
        motorista_telefone: veiculo.motorista_telefone || "",
        status: veiculo.status || "disponivel",
        observacoes: veiculo.observacoes || "",
      });
    } else {
      form.reset({
        placa: "",
        modelo: "",
        ano: undefined,
        capacidade: 40,
        motorista_nome: "",
        motorista_cnh: "",
        motorista_telefone: "",
        status: "disponivel",
        observacoes: "",
      });
    }
  }, [veiculo, form]);

  const onSubmit = async (data: VeiculoFormData) => {
    if (!data.placa || !data.modelo || !data.capacidade) return;
    
    setIsSaving(true);
    try {
      // Note: veiculos table does not exist in schema
      // This would need a database migration to work
      console.log("Veículo data:", data);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{veiculo ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
          <DialogDescription>
            {veiculo ? "Atualize as informações do veículo" : "Cadastre um novo veículo escolar"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa *</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mercedes Sprinter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="em_uso">Em Uso</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel className="text-base font-semibold">Dados do Motorista</FormLabel>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="motorista_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do motorista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motorista_cnh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNH</FormLabel>
                      <FormControl>
                        <Input placeholder="Número da CNH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motorista_telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações adicionais..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {veiculo ? "Salvar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
