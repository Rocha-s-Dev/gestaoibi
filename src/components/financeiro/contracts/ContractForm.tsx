import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

const formSchema = z
  .object({
    description: z.string().min(3, {
      message: "A descrição deve ter pelo menos 3 caracteres",
    }),
    contract_number: z.string().min(1, {
      message: "O número do contrato é obrigatório",
    }),
    contractor: z.string().min(1, {
      message: "O contratante é obrigatório",
    }),
    contracted: z.string().min(1, {
      message: "O contratado é obrigatório",
    }),
    value: z.coerce.number().positive({
      message: "O valor deve ser maior que zero",
    }),
    start_date: z.date({
      required_error: "A data de início é obrigatória",
    }),
    end_date: z.date({
      required_error: "A data de término é obrigatória",
    }),
    notes: z.string().optional(),
  })
  .refine((data) => {
    return data.end_date > data.start_date;
  }, {
    message: "A data de término deve ser posterior à data de início",
    path: ["end_date"],
  });

export function ContractForm({ onContractAdded }: { onContractAdded: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      contract_number: "",
      contractor: "",
      contracted: "",
      value: undefined,
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const contractData = {
        description: values.description,
        contract_number: values.contract_number,
        contractor: values.contractor,
        contracted: values.contracted,
        value: values.value,
        start_date: format(values.start_date, "yyyy-MM-dd"),
        end_date: format(values.end_date, "yyyy-MM-dd"),
        notes: values.notes || "",
        status: "active",
        document_urls: [],
      };

      const { data: contract, error } = await supabase
        .from('contracts' as any)
        .insert(contractData as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (contract) {
        form.reset();
        onContractAdded();
        
        toast.success("Contrato cadastrado", {
          description: `Contrato ${values.contract_number} cadastrado com sucesso.`,
        });
      }

    } catch (error: any) {
      toast.error("Erro ao cadastrar contrato", {
        description: error.message,
      });
      console.error("Error creating contract:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="contract_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do Contrato</FormLabel>
              <FormControl>
                <Input placeholder="Ex: CT-2024/001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Descrição do contrato" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contractor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contratante</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do contratante" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contracted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contratado</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do contratado" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor do Contrato (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0,00" 
                    step="0.01"
                    min="0"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
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
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Término</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Informações adicionais sobre o contrato"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar Contrato"}
        </Button>
      </form>
    </Form>
  );
}
