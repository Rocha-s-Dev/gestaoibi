
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const projetoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  objetivos: z.string().min(1, "Objetivos são obrigatórios"),
  orcamento: z.number().min(0, "Orçamento deve ser positivo"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  responsavel: z.string().min(1, "Responsável é obrigatório"),
  categoria: z.enum(["cultural", "esportivo"]),
  status: z.enum(["planejamento", "em-andamento", "concluido", "cancelado"]),
});

type ProjetoFormData = z.infer<typeof projetoSchema>;

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  objetivos: string;
  orcamento: number;
  dataInicio: string;
  dataFim: string;
  responsavel: string;
  categoria: "cultural" | "esportivo";
  status: "planejamento" | "em-andamento" | "concluido" | "cancelado";
}

interface ProjetoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (projeto: Projeto | Omit<Projeto, "id">) => void;
  projeto?: Projeto;
}

export function ProjetoDialog({ open, onOpenChange, onSubmit, projeto }: ProjetoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProjetoFormData>({
    resolver: zodResolver(projetoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      objetivos: "",
      orcamento: 0,
      dataInicio: "",
      dataFim: "",
      responsavel: "",
      categoria: "cultural",
      status: "planejamento",
    },
  });

  useEffect(() => {
    if (projeto) {
      form.reset({
        nome: projeto.nome,
        descricao: projeto.descricao,
        objetivos: projeto.objetivos,
        orcamento: projeto.orcamento,
        dataInicio: projeto.dataInicio,
        dataFim: projeto.dataFim,
        responsavel: projeto.responsavel,
        categoria: projeto.categoria,
        status: projeto.status,
      });
    } else {
      form.reset({
        nome: "",
        descricao: "",
        objetivos: "",
        orcamento: 0,
        dataInicio: "",
        dataFim: "",
        responsavel: "",
        categoria: "cultural",
        status: "planejamento",
      });
    }
  }, [projeto, form]);

  const handleSubmit = async (data: ProjetoFormData) => {
    setIsLoading(true);
    try {
      if (projeto) {
        onSubmit({ ...data, id: projeto.id });
      } else {
        onSubmit(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {projeto ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
          <DialogDescription>
            {projeto
              ? "Edite as informações do projeto cultural ou esportivo."
              : "Cadastre um novo projeto cultural ou esportivo."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Projeto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do projeto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="esportivo">Esportivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada do projeto"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="objetivos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Objetivos e metas do projeto"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orcamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orçamento (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataInicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataFim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Fim</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="planejamento">Planejamento</SelectItem>
                      <SelectItem value="em-andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : projeto ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
