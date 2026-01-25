import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useRotas, useAlunosRotas } from "@/hooks/useTransporteEscolar";
import { useEscolas } from "@/hooks/useEscolas";
import { useAlunos } from "@/hooks/useAlunos";

const vinculoSchema = z.object({
  aluno_id: z.string().min(1, "Aluno é obrigatório"),
  rota_id: z.string().min(1, "Rota é obrigatória"),
  ponto_embarque: z.string().optional(),
  horario_embarque: z.string().optional(),
});

type VinculoFormData = z.infer<typeof vinculoSchema>;

interface VinculoAlunoRotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VinculoAlunoRotaDialog({ open, onOpenChange }: VinculoAlunoRotaDialogProps) {
  const [escolaId, setEscolaId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  
  const { rotas } = useRotas();
  const { vincularAluno } = useAlunosRotas();
  const { escolas } = useEscolas();
  const { alunos: todosAlunos } = useAlunos();

  // Filtrar alunos pela escola selecionada
  const alunos = useMemo(() => {
    if (!escolaId) return [];
    return todosAlunos?.filter(a => a.escola_id === escolaId) || [];
  }, [todosAlunos, escolaId]);

  const form = useForm<VinculoFormData>({
    resolver: zodResolver(vinculoSchema),
    defaultValues: {
      aluno_id: "",
      rota_id: "",
      ponto_embarque: "",
      horario_embarque: "",
    },
  });

  const onSubmit = async (data: VinculoFormData) => {
    setIsSaving(true);
    try {
      await vincularAluno({
        aluno_id: data.aluno_id,
        rota_id: data.rota_id,
        ponto_embarque: data.ponto_embarque || undefined,
        horario_embarque: data.horario_embarque || undefined,
      });
      form.reset();
      setEscolaId("");
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Vincular Aluno à Rota</DialogTitle>
          <DialogDescription>
            Vincule um aluno a uma rota de transporte escolar
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Escola</FormLabel>
                <Select value={escolaId} onValueChange={setEscolaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {escolas?.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="aluno_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aluno *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!escolaId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o aluno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {alunos?.map((aluno) => (
                          <SelectItem key={aluno.id} value={aluno.id}>
                            {aluno.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rota_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rota *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a rota" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rotas?.filter(r => r.status === "ativa").map((rota) => (
                        <SelectItem key={rota.id} value={rota.id}>
                          {rota.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ponto_embarque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ponto de Embarque</FormLabel>
                    <FormControl>
                      <Input placeholder="Local de embarque" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horario_embarque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Embarque</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
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
                Vincular
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
