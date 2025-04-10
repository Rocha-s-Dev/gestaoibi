
import { useState, useEffect } from "react";
import { 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  ChevronDown,
  ChevronUp,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

// Dados simulados de fornecedores
const MOCK_SUPPLIERS = [
  {
    id: "1",
    nome: "Construções Rápidas Ltda",
    cnpj: "12.345.678/0001-90",
    email: "contato@construcoesrapidas.com",
    telefone: "(11) 98765-4321",
    endereco: "Rua das Obras, 123",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    tipo: "obras",
    contato: "João Silva",
    servicos: "Construção civil, reformas, manutenção predial",
    contratoRecente: "Reforma do prédio da prefeitura",
  },
  {
    id: "2",
    nome: "Infotech Sistemas",
    cnpj: "98.765.432/0001-21",
    email: "contato@infotech.com.br",
    telefone: "(11) 91234-5678",
    endereco: "Av. da Tecnologia, 456",
    cidade: "São Paulo",
    estado: "SP",
    cep: "04321-765",
    tipo: "servicos",
    contato: "Maria Oliveira",
    servicos: "Desenvolvimento de software, suporte técnico, infraestrutura de TI",
    contratoRecente: "Sistema de gestão municipal",
  },
  {
    id: "3",
    nome: "Móveis Profissionais SA",
    cnpj: "45.678.910/0001-32",
    email: "vendas@moveispro.com.br",
    telefone: "(11) 95555-1234",
    endereco: "Rua dos Móveis, 789",
    cidade: "Guarulhos",
    estado: "SP",
    cep: "07123-456",
    tipo: "produtos",
    contato: "Carlos Mendes",
    servicos: "Móveis corporativos, cadeiras ergonômicas, estações de trabalho",
    contratoRecente: "Mobiliário para nova ala administrativa",
  },
];

interface SupplierListProps {
  refreshTrigger: number;
}

export function SupplierList({ refreshTrigger }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Em uma aplicação real, aqui faríamos uma chamada à API
    // para atualizar a lista de fornecedores
    console.log("Atualizar lista de fornecedores", refreshTrigger);
  }, [refreshTrigger]);
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.servicos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'produtos':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Produtos</Badge>;
      case 'servicos':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Serviços</Badge>;
      case 'obras':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Obras</Badge>;
      case 'consultoria':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Consultoria</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Fornecedores Cadastrados</span>
          <span className="text-sm font-normal text-muted-foreground">
            Total: {suppliers.length}
          </span>
        </CardTitle>
        <div className="pt-2">
          <Input
            placeholder="Buscar por nome, serviços ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 overflow-auto max-h-[600px]">
          {filteredSuppliers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum fornecedor encontrado.
            </p>
          ) : (
            filteredSuppliers.map((supplier) => (
              <Collapsible
                key={supplier.id}
                open={openItems[supplier.id]}
                onOpenChange={() => toggleItem(supplier.id)}
                className="border rounded-lg p-4 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{supplier.nome}</h3>
                      <p className="text-sm text-muted-foreground">{supplier.cnpj}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getTypeBadge(supplier.tipo)}
                    <CollapsibleTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-muted">
                        {openItems[supplier.id] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                
                <CollapsibleContent className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{supplier.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{supplier.telefone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Contato: {supplier.contato}</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">Último contrato: {supplier.contratoRecente}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md">
                    <h4 className="text-sm font-medium mb-1">Serviços oferecidos:</h4>
                    <p className="text-sm">{supplier.servicos}</p>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Endereço: {supplier.endereco}, {supplier.cidade} - {supplier.estado}, CEP: {supplier.cep}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
