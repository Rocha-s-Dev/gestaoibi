import { useEffect } from "react";
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
import { useTransporteEscolar } from "@/hooks/useTransporteEscolar";

const rotaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  horario_inicio: z.string().optional(),
  horario_fim: z.string().optional(),
  km_estimado: z.coerce.number().optional(),
  status: z.enum(["ativa", "inativa", "em_manutencao"]).default("ativa"),
});

type RotaFormData = z.infer<typeof rotaSchema>;

interface RotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rota?: any;
}

export function RotaDialog({ open, onOpenChange, rota }: RotaDialogProps) {
  const { createRota, updateRota, isCreating, isUpdating } = useTransporteEscolar();

  const form = useForm<RotaFormData>({
    resolver: zodResolver(rotaSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      horario_inicio: "",
      horario_fim: "",
      km_estimado: undefined,
      status: "ativa",
    },
  });

  useEffect(() => {
    if (rota) {
      form.reset({
        nome: rota.nome || "",
        descricao: rota.descricao || "",
        horario_inicio: rota.horario_inicio || "",
        horario_fim: rota.horario_fim || "",
        km_estimado: rota.km_estimado || undefined,
        status: rota.status || "ativa",
      });
    } else {
      form.reset({
        nome: "",
        descricao: "",
        horario_inicio: "",
        horario_fim: "",
        km_estimado: undefined,
        status: "ativa",
      });
    }
  }, [rota, form]);

  const onSubmit = async (data: RotaFormData) => {
    if (rota) {
      await updateRota({ id: rota.id, ...data });
    } else {
      await createRota(data);
    }
    onOpenChange(false);
  };

  const isSaving = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{rota ? "Editar Rota" : "Nova Rota"}</DialogTitle>
          <DialogDescription>
            {rota ? "Atualize as informações da rota" : "Cadastre uma nova rota de transporte"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Rota *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Rota Norte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a rota..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="horario_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horario_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="km_estimado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KM Estimado</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0.0" {...field} />
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
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="inativa">Inativa</SelectItem>
                        <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {rota ? "Salvar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
