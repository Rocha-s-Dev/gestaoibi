
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormControl 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Esquema de validação
const formSchema = z.object({
  description: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0, 
    { message: "Valor deve ser um número positivo" }
  ),
  category_id: z.string().uuid("Selecione uma categoria válida"),
  transaction_date: z.date({ required_error: "Selecione uma data" }),
  department_id: z.string().uuid().optional(),
});

type TransactionFormProps = {
  transactionType: string;
  onTransactionAdded: () => void;
};

export function TransactionForm({ transactionType, onTransactionAdded }: TransactionFormProps) {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Buscar categorias e departamentos
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("financial_categories")
        .select("*")
        .eq("type", transactionType)
        .order("name");
      
      if (error) {
        console.error("Erro ao buscar categorias:", error);
        return;
      }
      
      setCategories(data || []);
    };

    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Erro ao buscar departamentos:", error);
        return;
      }
      
      setDepartments(data || []);
    };

    fetchCategories();
    fetchDepartments();
  }, [transactionType]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      transaction_date: new Date(),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id) {
      toast.error("Você precisa estar logado para registrar transações.");
      return;
    }

    setIsSubmitting(true);

    // Formatando a data para string (YYYY-MM-DD)
    const formattedDate = format(values.transaction_date, 'yyyy-MM-dd');

    // Preparar dados para inserção
    const transactionData = {
      description: values.description,
      amount: parseFloat(values.amount),
      category_id: values.category_id,
      transaction_date: formattedDate,
      type: transactionType,
      department_id: values.department_id || null,
      created_by: session.user.id,
    };

    // Inserir no Supabase
    const { error } = await supabase
      .from("financial_transactions")
      .insert(transactionData);

    setIsSubmitting(false);

    if (error) {
      console.error("Erro ao registrar transação:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
      return;
    }

    toast.success(
      transactionType === "receita" 
        ? "Receita registrada com sucesso!" 
        : "Despesa registrada com sucesso!"
    );
    
    // Resetar formulário
    form.reset({
      description: "",
      amount: "",
      category_id: undefined,
      transaction_date: new Date(),
      department_id: undefined,
    });
    
    onTransactionAdded();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a transação" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="0,00" 
                  {...field} 
                  type="number"
                  step="0.01"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${
                        !field.value ? "text-muted-foreground" : ""
                      }`}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
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
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento/Secretaria (opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
}
