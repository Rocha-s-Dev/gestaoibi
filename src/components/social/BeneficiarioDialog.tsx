
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";

const programasSociaisOptions = [
  { id: "bolsa-familia", label: "Bolsa Família" },
  { id: "auxilio-moradia", label: "Auxílio Moradia" },
  { id: "auxilio-alimentacao", label: "Auxílio Alimentação" },
  { id: "capacitacao-profissional", label: "Capacitação Profissional" },
];

const formSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  cpf: z.string().min(1, { message: "CPF é obrigatório" }),
  dataNascimento: z.string().min(1, { message: "Data de nascimento é obrigatória" }),
  endereco: z.string().min(1, { message: "Endereço é obrigatório" }),
  bairro: z.string().min(1, { message: "Bairro é obrigatório" }),
  telefone: z.string().min(1, { message: "Telefone é obrigatório" }),
  programas: z.array(z.string()).min(1, { message: "Selecione pelo menos um programa" }),
  ultimoAtendimento: z.string().min(1, { message: "Data do último atendimento é obrigatória" }),
});

type BeneficiarioFormValues = z.infer<typeof formSchema>;

interface BeneficiarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiario: any | null;
  onSave: (beneficiario: any) => void;
}

export function BeneficiarioDialog({
  open,
  onOpenChange,
  beneficiario,
  onSave,
}: BeneficiarioDialogProps) {
  const form = useForm<BeneficiarioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      dataNascimento: "",
      endereco: "",
      bairro: "",
      telefone: "",
      programas: [],
      ultimoAtendimento: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (beneficiario) {
      form.reset({
        id: beneficiario.id,
        nome: beneficiario.nome,
        cpf: beneficiario.cpf,
        dataNascimento: beneficiario.dataNascimento,
        endereco: beneficiario.endereco,
        bairro: beneficiario.bairro,
        telefone: beneficiario.telefone,
        programas: beneficiario.programas,
        ultimoAtendimento: beneficiario.ultimoAtendimento,
      });
    } else {
      form.reset({
        nome: "",
        cpf: "",
        dataNascimento: "",
        endereco: "",
        bairro: "",
        telefone: "",
        programas: [],
        ultimoAtendimento: new Date().toISOString().split('T')[0],
      });
    }
  }, [beneficiario, form]);

  const onSubmit = (values: BeneficiarioFormValues) => {
    onSave(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {beneficiario ? "Editar Beneficiário" : "Novo Beneficiário"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do beneficiário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ultimoAtendimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Último Atendimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <FormLabel>Programas</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {programasSociaisOptions.map((programa) => (
                  <FormField
                    key={programa.id}
                    control={form.control}
                    name="programas"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(programa.label)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, programa.label]);
                              } else {
                                field.onChange(
                                  field.value.filter((value) => value !== programa.label)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {programa.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage>
                {form.formState.errors.programas?.message}
              </FormMessage>
            </div>

            <DialogFooter>
              <Button type="submit">
                {beneficiario ? "Salvar Alterações" : "Cadastrar Beneficiário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
