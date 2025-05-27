
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

const metaCulturalSchema = z.object({
  tipo: z.enum(["projetos-aprovados", "participacao-publico"]),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  metaAnual: z.number().min(1, "Meta anual deve ser maior que zero"),
  valorAtual: z.number().min(0, "Valor atual deve ser positivo"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  ano: z.number().min(2020, "Ano deve ser válido"),
  status: z.enum(["ativa", "concluida", "atrasada"]),
});

type MetaCulturalFormData = z.infer<typeof metaCulturalSchema>;

interface MetaCultural {
  id: string;
  tipo: "projetos-aprovados" | "participacao-publico";
  titulo: string;
  descricao: string;
  metaAnual: number;
  valorAtual: number;
  unidade: string;
  ano: number;
  status: "ativa" | "concluida" | "atrasada";
  criadaEm: string;
  ultimaAtualizacao: string;
}

interface MetaCulturalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (meta: MetaCultural | Omit<MetaCultural, "id">) => void;
  meta?: MetaCultural;
}

export function MetaCulturalDialog({ open, onOpenChange, onSubmit, meta }: MetaCulturalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MetaCulturalFormData>({
    resolver: zodResolver(metaCulturalSchema),
    defaultValues: {
      tipo: "projetos-aprovados",
      titulo: "",
      descricao: "",
      metaAnual: 0,
      valorAtual: 0,
      unidade: "",
      ano: new Date().getFullYear(),
      status: "ativa",
    },
  });

  useEffect(() => {
    if (meta) {
      form.reset({
        tipo: meta.tipo,
        titulo: meta.titulo,
        descricao: meta.descricao,
        metaAnual: meta.metaAnual,
        valorAtual: meta.valorAtual,
        unidade: meta.unidade,
        ano: meta.ano,
        status: meta.status,
      });
    } else {
      form.reset({
        tipo: "projetos-aprovados",
        titulo: "",
        descricao: "",
        metaAnual: 0,
        valorAtual: 0,
        unidade: "",
        ano: new Date().getFullYear(),
        status: "ativa",
      });
    }
  }, [meta, form]);

  const handleSubmit = async (data: MetaCulturalFormData) => {
    setIsLoading(true);
    try {
      if (meta) {
        // Para editar, criar um objeto MetaCultural completo
        const metaCompleta: MetaCultural = {
          id: meta.id,
          tipo: data.tipo,
          titulo: data.titulo,
          descricao: data.descricao,
          metaAnual: data.metaAnual,
          valorAtual: data.valorAtual,
          unidade: data.unidade,
          ano: data.ano,
          status: data.status,
          criadaEm: meta.criadaEm,
          ultimaAtualizacao: new Date().toISOString().split('T')[0],
        };
        onSubmit(metaCompleta);
      } else {
        // Para criar, criar um objeto sem id
        const novaMeta: Omit<MetaCultural, "id"> = {
          tipo: data.tipo,
          titulo: data.titulo,
          descricao: data.descricao,
          metaAnual: data.metaAnual,
          valorAtual: data.valorAtual,
          unidade: data.unidade,
          ano: data.ano,
          status: data.status,
          criadaEm: new Date().toISOString().split('T')[0],
          ultimaAtualizacao: new Date().toISOString().split('T')[0],
        };
        onSubmit(novaMeta);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar meta cultural:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tipoSelecionado = form.watch("tipo");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {meta ? "Editar Meta Cultural" : "Nova Meta Cultural"}
          </DialogTitle>
          <DialogDescription>
            {meta
              ? "Edite as informações da meta cultural."
              : "Defina uma nova meta para projetos culturais ou participação do público."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Meta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="projetos-aprovados">Projetos Aprovados</SelectItem>
                        <SelectItem value="participacao-publico">Participação do Público</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2020"
                        max="2030"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Meta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Projetos Culturais Aprovados 2024" {...field} />
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
                    <Textarea
                      placeholder="Descreva o objetivo e contexto desta meta"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="metaAnual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Anual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Ex: 50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valorAtual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Atual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ex: 25"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tipoSelecionado === "projetos-aprovados" ? "projetos" : "pessoas"}
                        {...field}
                      />
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
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="atrasada">Atrasada</SelectItem>
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
                {isLoading ? "Salvando..." : meta ? "Atualizar" : "Criar Meta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
