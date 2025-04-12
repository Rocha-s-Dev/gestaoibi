
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
import { CheckCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const projectFormSchema = z.object({
  name: z.string().min(2, { message: "Nome do projeto é obrigatório" }),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
  budget: z.coerce.number().min(0, { message: "Orçamento deve ser um valor positivo" }),
  startDate: z.string().min(1, { message: "Data de início é obrigatória" }),
  endDate: z.string().min(1, { message: "Data de término é obrigatória" }),
  status: z.string().min(1, { message: "Status é obrigatório" }),
  partners: z.array(z.string()).optional(),
  description: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectRegistrationProps {
  onProjectAdded?: (data: ProjectFormValues) => void;
  defaultValues?: Partial<ProjectFormValues>;
  isEditing?: boolean;
}

export function ProjectRegistration({ 
  onProjectAdded, 
  defaultValues, 
  isEditing = false 
}: ProjectRegistrationProps) {
  const [partners, setPartners] = useState<string[]>(defaultValues?.partners || []);
  const [newPartner, setNewPartner] = useState("");

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      category: "",
      budget: 0,
      startDate: "",
      endDate: "",
      status: "",
      partners: [],
      description: "",
      ...defaultValues,
    },
  });

  const addPartner = () => {
    if (newPartner.trim() !== "" && !partners.includes(newPartner.trim())) {
      setPartners([...partners, newPartner.trim()]);
      setNewPartner("");
    }
  };

  const removePartner = (partner: string) => {
    setPartners(partners.filter(p => p !== partner));
  };

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      // Add partners array to form data
      data.partners = partners;
      
      // In a real application, this would be an API call to save the data
      // For now, just simulate a success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(
        isEditing ? "Projeto atualizado com sucesso!" : "Projeto cadastrado com sucesso!", 
        { duration: 3000 }
      );
      
      if (onProjectAdded) {
        onProjectAdded(data);
      }
      
      if (!isEditing) {
        form.reset();
        setPartners([]);
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Erro ao salvar projeto. Tente novamente.");
    }
  };

  const projectCategories = [
    "Infraestrutura",
    "Formação",
    "Evento",
    "Tecnologia",
    "Meio Ambiente",
    "Turismo",
    "Agronegócio",
    "Comércio",
    "Indústria",
    "Outro",
  ];

  const projectStatuses = [
    "Planejado",
    "Em andamento",
    "Concluído",
    "Suspenso",
    "Cancelado",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Projeto</FormLabel>
              <FormControl>
                <Input placeholder="Nome do projeto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
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
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orçamento (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Término</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div>
          <FormLabel>Parceiros</FormLabel>
          <div className="flex gap-2 mt-2 mb-1">
            <Input
              value={newPartner}
              onChange={(e) => setNewPartner(e.target.value)}
              placeholder="Nome do parceiro"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPartner();
                }
              }}
            />
            <Button type="button" onClick={addPartner}>
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {partners.map((partner) => (
              <Badge key={partner} variant="secondary" className="py-1.5">
                {partner}
                <button 
                  type="button" 
                  className="ml-1 hover:text-destructive" 
                  onClick={() => removePartner(partner)}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
            {partners.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum parceiro adicionado.</p>
            )}
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do Projeto</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva o projeto, seus objetivos e resultados esperados" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">
          {isEditing ? "Atualizar Projeto" : "Cadastrar Projeto"}
        </Button>
      </form>
    </Form>
  );
}
