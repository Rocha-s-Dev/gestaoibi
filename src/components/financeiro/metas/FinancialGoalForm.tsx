
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

// Schema de validação
const formSchema = z.object({
  type: z.enum(["revenue", "expense"], {
    required_error: "Selecione o tipo de meta",
  }),
  description: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
  target_value: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "O valor alvo deve ser um número positivo",
  }),
  percentage_increase: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "O percentual deve ser um número positivo",
  }),
  enable_alerts: z.boolean().default(true),
  alert_threshold: z.number().min(1).max(100).default(90),
});

type FinancialGoalFormProps = {
  onGoalAdded: () => void;
};

export function FinancialGoalForm({ onGoalAdded }: FinancialGoalFormProps) {
  const { session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "revenue",
      description: "",
      target_value: "",
      percentage_increase: "",
      enable_alerts: true,
      alert_threshold: 90,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user) {
      toast.error("Você precisa estar logado para criar metas financeiras");
      return;
    }

    setIsSubmitting(true);

    // Preparar dados para inserção
    const goalData = {
      type: values.type,
      description: values.description,
      target_value: parseFloat(values.target_value),
      percentage_increase: parseFloat(values.percentage_increase),
      current_value: 0,
      status: "active",
      enable_alerts: values.enable_alerts,
      alert_threshold: values.alert_threshold,
    };

    // Inserir no Supabase
    const { error } = await supabase
      .from("financial_goals")
      .insert(goalData);

    setIsSubmitting(false);

    if (error) {
      console.error("Erro ao criar meta financeira:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
      return;
    }

    toast.success("Meta financeira criada com sucesso!");
    
    // Resetar formulário
    form.reset({
      type: "revenue",
      description: "",
      target_value: "",
      percentage_increase: "",
      enable_alerts: true,
      alert_threshold: 90,
    });
    
    onGoalAdded();
  };

  // Determinar o label baseado no tipo selecionado
  const goalTypeLabel = form.watch("type") === "revenue" 
    ? "Aumentar receitas em" 
    : "Limitar despesas a";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Meta</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de meta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="revenue">Meta de Receita</SelectItem>
                  <SelectItem value="expense">Limite de Despesa</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Defina se deseja estabelecer uma meta de aumento de receitas ou um limite para despesas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Meta</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o objetivo desta meta financeira" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Uma descrição clara ajuda a entender o propósito da meta.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="target_value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Alvo (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0,00" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {form.watch("type") === "revenue" 
                  ? "Valor total de receita que deseja alcançar" 
                  : "Valor máximo permitido para despesas"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="percentage_increase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{goalTypeLabel} (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {form.watch("type") === "revenue" 
                  ? "Percentual de aumento em relação ao período anterior" 
                  : "Percentual em relação ao orçamento total"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enable_alerts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Ativar Alertas</FormLabel>
                <FormDescription>
                  Receba alertas quando se aproximar da meta ou limite.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("enable_alerts") && (
          <FormField
            control={form.control}
            name="alert_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite para Alerta (%)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">1%</span>
                      <span className="text-sm font-medium">{field.value}%</span>
                      <span className="text-sm text-muted-foreground">100%</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  {form.watch("type") === "revenue" 
                    ? `Alerta quando atingir ${field.value}% da meta de receita` 
                    : `Alerta quando atingir ${field.value}% do limite de despesa`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Meta Financeira"}
        </Button>
      </form>
    </Form>
  );
}
