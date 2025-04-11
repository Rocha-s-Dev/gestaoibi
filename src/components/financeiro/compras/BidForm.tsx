
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const bidSchema = z.object({
  modalidade: z.string().min(1, { message: "Modalidade é obrigatória" }),
  numero: z.string().min(1, { message: "Número é obrigatório" }),
  objeto: z.string().min(5, { message: "Descreva o objeto da licitação" }),
  dataAbertura: z.date({ required_error: "Data de abertura é obrigatória" }),
  valorEstimado: z.string().min(1, { message: "Valor estimado é obrigatório" }),
  situacao: z.string().min(1, { message: "Situação é obrigatória" }),
  responsavel: z.string().min(3, { message: "Informe o responsável" }),
  descricao: z.string().optional(),
});

export type BidFormValues = z.infer<typeof bidSchema>;

interface BidFormProps {
  onSubmit: (data: BidFormValues) => void;
  defaultValues?: Partial<BidFormValues>;
  isEditing?: boolean;
  onCancel?: () => void;
}

export function BidForm({
  onSubmit,
  defaultValues,
  isEditing = false,
  onCancel,
}: BidFormProps) {
  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: defaultValues || {
      modalidade: "",
      numero: "",
      objeto: "",
      dataAbertura: undefined,
      valorEstimado: "",
      situacao: "",
      responsavel: "",
      descricao: "",
    },
  });

  function handleSubmit(data: BidFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="modalidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pregao_eletronico">Pregão Eletrônico</SelectItem>
                    <SelectItem value="pregao_presencial">Pregão Presencial</SelectItem>
                    <SelectItem value="tomada_de_preco">Tomada de Preço</SelectItem>
                    <SelectItem value="concorrencia">Concorrência</SelectItem>
                    <SelectItem value="convite">Convite</SelectItem>
                    <SelectItem value="leilao">Leilão</SelectItem>
                    <SelectItem value="concurso">Concurso</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="000/2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="objeto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objeto</FormLabel>
              <FormControl>
                <Input placeholder="Objeto da licitação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dataAbertura"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Abertura</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("2023-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="valorEstimado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Estimado</FormLabel>
                <FormControl>
                  <Input placeholder="R$ 0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="situacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="publicada">Publicada</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="documentacao">Documentação</SelectItem>
                    <SelectItem value="impugnacao">Impugnação</SelectItem>
                    <SelectItem value="homologada">Homologada</SelectItem>
                    <SelectItem value="suspensa">Suspensa</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
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
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Adicional</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detalhes adicionais sobre a licitação" 
                  className="min-h-[100px]" 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {isEditing ? "Salvar Alterações" : "Cadastrar Licitação"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
