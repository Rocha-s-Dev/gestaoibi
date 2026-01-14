import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ConfiguracaoAlertasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Configuracao {
  id: string;
  percentual_faltas_warning: number;
  percentual_faltas_critical: number;
  nota_minima: number;
  dias_sem_frequencia_evasao: number;
}

export function ConfiguracaoAlertasDialog({ open, onOpenChange }: ConfiguracaoAlertasDialogProps) {
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchConfig();
    }
  }, [open]);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("configuracoes_alertas")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setConfig(data);
      } else {
        // Criar configuração padrão
        const { data: newConfig, error: insertError } = await supabase
          .from("configuracoes_alertas")
          .insert({
            percentual_faltas_warning: 15,
            percentual_faltas_critical: 25,
            nota_minima: 6,
            dias_sem_frequencia_evasao: 15,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setConfig(newConfig);
      }
    } catch (error) {
      console.error("Erro ao buscar configuração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("configuracoes_alertas")
        .update({
          percentual_faltas_warning: config.percentual_faltas_warning,
          percentual_faltas_critical: config.percentual_faltas_critical,
          nota_minima: config.nota_minima,
          dias_sem_frequencia_evasao: config.dias_sem_frequencia_evasao,
        })
        .eq("id", config.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuração de Alertas</DialogTitle>
          <DialogDescription>
            Defina os limites para geração automática de alertas educacionais.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : config ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Faltas</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Aviso de faltas (%)</Label>
                  <span className="text-sm font-medium text-orange-500">
                    {config.percentual_faltas_warning}%
                  </span>
                </div>
                <Slider
                  value={[config.percentual_faltas_warning]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, percentual_faltas_warning: value })
                  }
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Gera alerta de aviso quando o aluno atinge este percentual de faltas.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Alerta crítico de faltas (%)</Label>
                  <span className="text-sm font-medium text-destructive">
                    {config.percentual_faltas_critical}%
                  </span>
                </div>
                <Slider
                  value={[config.percentual_faltas_critical]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, percentual_faltas_critical: value })
                  }
                  min={15}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Gera alerta crítico quando o aluno atinge este percentual de faltas.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Notas</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Nota mínima para aprovação</Label>
                  <span className="text-sm font-medium">{config.nota_minima}</span>
                </div>
                <Slider
                  value={[config.nota_minima]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, nota_minima: value })
                  }
                  min={4}
                  max={8}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Gera alerta quando a média do aluno fica abaixo deste valor.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Evasão</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Dias sem frequência para risco de evasão</Label>
                  <span className="text-sm font-medium">
                    {config.dias_sem_frequencia_evasao} dias
                  </span>
                </div>
                <Slider
                  value={[config.dias_sem_frequencia_evasao]}
                  onValueChange={([value]) =>
                    setConfig({ ...config, dias_sem_frequencia_evasao: value })
                  }
                  min={5}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Gera alerta de risco de evasão quando o aluno não comparece por este período.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
