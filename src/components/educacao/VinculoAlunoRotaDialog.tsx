import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useTransporteEscolar } from "@/hooks/useTransporteEscolar";
import { useEscolas } from "@/hooks/useEscolas";
import { useAlunos } from "@/hooks/useAlunos";

const vinculoSchema = z.object({
  aluno_id: z.string().min(1, "Aluno é obrigatório"),
  rota_id: z.string().min(1, "Rota é obrigatória"),
  veiculo_id: z.string().optional(),
  turno: z.string().optional(),
  ponto_embarque: z.string().optional(),
  ponto_desembarque: z.string().optional(),
  horario_embarque: z.string().optional(),
  ativo: z.boolean().default(true),
});

type VinculoFormData = z.infer<typeof vinculoSchema>;

interface VinculoAlunoRotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VinculoAlunoRotaDialog({ open, onOpenChange }: VinculoAlunoRotaDialogProps) {
  const [escolaId, setEscolaId] = useState<string>("");
  const { rotas, veiculos, createAlunoRota, isCreatingAlunoRota } = useTransporteEscolar();
  const { escolas } = useEscolas();
  const { alunos } = useAlunos(escolaId);

  const form = useForm<VinculoFormData>({
    resolver: zodResolver(vinculoSchema),
    defaultValues: {
      aluno_id: "",
      rota_id: "",
      veiculo_id: "",
      turno: "",
      ponto_embarque: "",
      ponto_desembarque: "",
      horario_embarque: "",
      ativo: true,
    },
  });

  const onSubmit = async (data: VinculoFormData) => {
    await createAlunoRota({
      aluno_id: data.aluno_id,
      rota_id: data.rota_id,
      veiculo_id: data.veiculo_id || null,
      turno: data.turno || null,
      ponto_embarque: data.ponto_embarque || null,
      ponto_desembarque: data.ponto_desembarque || null,
      horario_embarque: data.horario_embarque || null,
      ativo: data.ativo,
    });
    form.reset();
    setEscolaId("");
    onOpenChange(false);
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

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="veiculo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veículo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o veículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {veiculos?.filter(v => v.status !== "inativo").map((veiculo) => (
                          <SelectItem key={veiculo.id} value={veiculo.id}>
                            {veiculo.placa} - {veiculo.modelo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="turno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turno</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o turno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="matutino">Matutino</SelectItem>
                        <SelectItem value="vespertino">Vespertino</SelectItem>
                        <SelectItem value="integral">Integral</SelectItem>
                      </SelectContent>
                    </Select>
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
                name="ponto_desembarque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ponto de Desembarque</FormLabel>
                    <FormControl>
                      <Input placeholder="Local de desembarque" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Vínculo ativo</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingAlunoRota}>
                {isCreatingAlunoRota && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Vincular
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
