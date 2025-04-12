
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

const businessFormSchema = z.object({
  name: z.string().min(2, { message: "Nome da empresa é obrigatório" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }),
  businessType: z.string().min(1, { message: "Tipo de atividade é obrigatório" }),
  address: z.string().min(5, { message: "Endereço é obrigatório" }),
  contact: z.string().min(5, { message: "Contato é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  taxIncentives: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type BusinessFormValues = z.infer<typeof businessFormSchema>;

interface BusinessRegistrationProps {
  onBusinessAdded?: () => void;
  defaultValues?: Partial<BusinessFormValues>;
  isEditing?: boolean;
}

export function BusinessRegistration({ 
  onBusinessAdded, 
  defaultValues, 
  isEditing = false 
}: BusinessRegistrationProps) {
  const [taxIncentives, setTaxIncentives] = useState<string[]>(defaultValues?.taxIncentives || []);

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      businessType: "",
      address: "",
      contact: "",
      email: "",
      phone: "",
      taxIncentives: [],
      notes: "",
      ...defaultValues,
    },
  });

  const onSubmit = async (data: BusinessFormValues) => {
    try {
      // Add tax incentives array to form data
      data.taxIncentives = taxIncentives;
      
      // In a real application, this would be an API call to save the data
      // For now, just simulate a success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(
        isEditing ? "Empresa atualizada com sucesso!" : "Empresa cadastrada com sucesso!", 
        { duration: 3000 }
      );
      
      if (!isEditing) {
        form.reset();
        setTaxIncentives([]);
      }
      
      if (onBusinessAdded) {
        onBusinessAdded();
      }
    } catch (error) {
      console.error("Error saving business:", error);
      toast.error("Erro ao salvar empresa. Tente novamente.");
    }
  };

  const businessTypes = [
    "Comércio",
    "Indústria",
    "Serviço",
    "Agronegócio",
    "Tecnologia",
    "Turismo",
    "Outro",
  ];

  const availableTaxIncentives = [
    "Redução de ISSQN",
    "Isenção de IPTU",
    "Redução de Taxas Municipais",
    "Programa de Desenvolvimento Local",
    "Incentivo à Exportação",
    "Incentivo à Contratação Local"
  ];

  const toggleIncentive = (incentive: string) => {
    setTaxIncentives(prev => {
      if (prev.includes(incentive)) {
        return prev.filter(item => item !== incentive);
      } else {
        return [...prev, incentive];
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Atividade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de atividade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pessoa de Contato</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do contato" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@empresa.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
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
        </div>
        
        <div>
          <FormLabel>Incentivos Fiscais Disponíveis</FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {availableTaxIncentives.map(incentive => (
              <Button
                key={incentive}
                type="button"
                variant={taxIncentives.includes(incentive) ? "default" : "outline"}
                onClick={() => toggleIncentive(incentive)}
                className="justify-start"
              >
                {taxIncentives.includes(incentive) && (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {incentive}
              </Button>
            ))}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Informações adicionais sobre a empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          {isEditing ? "Atualizar Empresa" : "Cadastrar Empresa"}
        </Button>
      </form>
    </Form>
  );
}
