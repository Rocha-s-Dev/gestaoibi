
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type GoalType = "revenue" | "expense";

interface FinancialGoalFormProps {
  onGoalAdded: () => void;
}

export function FinancialGoalForm({ onGoalAdded }: FinancialGoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "revenue" as GoalType,
    description: "",
    targetValue: 0,
    percentageIncrease: 0,
    enableAlerts: true,
    alertThreshold: 90, // Percentual do valor da meta para disparar alertas
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "targetValue" || name === "percentageIncrease" || name === "alertThreshold" 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      enableAlerts: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("financial_goals")
        .insert({
          type: formData.type,
          description: formData.description,
          target_value: formData.targetValue,
          percentage_increase: formData.percentageIncrease,
          enable_alerts: formData.enableAlerts,
          alert_threshold: formData.alertThreshold,
          created_at: new Date().toISOString(),
          status: "active",
        });

      if (error) throw error;

      toast.success(
        formData.type === "revenue"
          ? "Meta de receita criada com sucesso"
          : "Meta de despesa criada com sucesso"
      );

      // Limpar o formulário
      setFormData({
        type: "revenue",
        description: "",
        targetValue: 0,
        percentageIncrease: 0,
        enableAlerts: true,
        alertThreshold: 90,
      });

      // Notificar que uma meta foi adicionada
      onGoalAdded();
    } catch (error) {
      console.error("Erro ao criar meta financeira:", error);
      toast.error("Erro ao criar meta financeira. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Nova Meta Financeira</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Meta</Label>
            <Select
              value={formData.type}
              onValueChange={(value: GoalType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Selecione o tipo de meta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Meta de Receita</SelectItem>
                <SelectItem value="expense">Limite de Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descrição da meta financeira"
              required
            />
          </div>

          {formData.type === "revenue" ? (
            <div className="space-y-2">
              <Label htmlFor="percentageIncrease">Aumento percentual desejado (%)</Label>
              <Input
                id="percentageIncrease"
                name="percentageIncrease"
                type="number"
                min="0"
                step="0.1"
                value={formData.percentageIncrease || ""}
                onChange={handleInputChange}
                placeholder="Ex: 10"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="targetValue">Valor Limite (R$)</Label>
              <Input
                id="targetValue"
                name="targetValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.targetValue || ""}
                onChange={handleInputChange}
                placeholder="Ex: 5000"
                required
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="enableAlerts"
              checked={formData.enableAlerts}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="enableAlerts">Ativar alertas</Label>
          </div>

          {formData.enableAlerts && (
            <div className="space-y-2">
              <Label htmlFor="alertThreshold">
                Limiar de alerta (%)
                {formData.type === "expense" 
                  ? " - Percentual do limite máximo para alertar" 
                  : " - Percentual da meta para alertar"}
              </Label>
              <Input
                id="alertThreshold"
                name="alertThreshold"
                type="number"
                min="1"
                max="100"
                value={formData.alertThreshold || ""}
                onChange={handleInputChange}
                placeholder="Ex: 90"
              />
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Criando..." : "Criar Meta Financeira"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
