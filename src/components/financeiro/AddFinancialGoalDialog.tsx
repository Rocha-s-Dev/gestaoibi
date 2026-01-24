import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface AddFinancialGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalAdded: () => void;
}

export function AddFinancialGoalDialog({ open, onOpenChange, onGoalAdded }: AddFinancialGoalDialogProps) {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    description: "",
    type: "revenue",
    target_value: 0,
    percentage_increase: 10,
    enable_alerts: true,
    alert_threshold: 90,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!session?.user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("financial_goals")
        .insert({
          user_id: session.user.id,
          description: formData.description,
          type: formData.type,
          target_value: formData.target_value,
          percentage_increase: formData.percentage_increase,
          enable_alerts: formData.enable_alerts,
          alert_threshold: formData.alert_threshold,
          status: "active",
          current_value: 0,
        });

      if (error) throw error;

      toast({
        title: "Meta financeira criada",
        description: "A meta foi adicionada com sucesso."
      });

      onGoalAdded();
      onOpenChange(false);
      setFormData({
        description: "",
        type: "revenue",
        target_value: 0,
        percentage_increase: 10,
        enable_alerts: true,
        alert_threshold: 90,
      });
    } catch (error) {
      console.error("Error adding financial goal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta financeira.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Meta Financeira</DialogTitle>
          <DialogDescription>
            Crie uma nova meta de receita ou limite de despesas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Tipo de Meta</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Meta de Receita</SelectItem>
                  <SelectItem value="expense">Limite de Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição da meta"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="target_value">
                {formData.type === "revenue" ? "Valor da Meta de Receita" : "Limite de Despesa"}
              </Label>
              <Input
                id="target_value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            {formData.type === "revenue" && (
              <div>
                <Label htmlFor="percentage_increase">Percentual de Aumento</Label>
                <Input
                  id="percentage_increase"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="10%"
                  value={formData.percentage_increase}
                  onChange={(e) => setFormData({ ...formData, percentage_increase: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Percentual de aumento em relação ao período anterior.
                </p>
              </div>
            )}

            {formData.type === "expense" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_alerts">Habilitar Alertas</Label>
                  <Switch
                    id="enable_alerts"
                    checked={formData.enable_alerts}
                    onCheckedChange={(checked) => setFormData({ ...formData, enable_alerts: checked })}
                  />
                </div>

                {formData.enable_alerts && (
                  <div>
                    <Label htmlFor="alert_threshold">Limiar de Alerta (%)</Label>
                    <Input
                      id="alert_threshold"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="90%"
                      value={formData.alert_threshold}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        alert_threshold: Math.min(100, Math.max(1, parseInt(e.target.value) || 90)) 
                      })}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Percentual do limite a partir do qual alertas serão exibidos.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
