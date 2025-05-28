
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, MapPin, Users, Calendar } from "lucide-react";
import { EspacoCulturalDialog } from "./EspacoCulturalDialog";

export interface EspacoCultural {
  id: string;
  nome: string;
  tipo: "teatro" | "cinema" | "biblioteca" | "museu" | "quadra-esportiva" | "ginasio" | "piscina" | "auditorio" | "outro";
  endereco: string;
  capacidade: number;
  disponivel: boolean;
  condicoes: string;
  equipamentos: string[];
  responsavel: string;
  contato: string;
  observacoes?: string;
  dataCriacao: string;
}

export function EspacosCulturais() {
  const [espacos, setEspacos] = useState<EspacoCultural[]>([
    {
      id: "1",
      nome: "Teatro Municipal",
      tipo: "teatro",
      endereco: "Rua das Artes, 123 - Centro",
      capacidade: 300,
      disponivel: true,
      condicoes: "Excelente estado, ar condicionado, sistema de som profissional",
      equipamentos: ["Sistema de som", "Iluminação cênica", "Ar condicionado", "Projetor"],
      responsavel: "Maria Silva",
      contato: "(11) 1234-5678",
      observacoes: "Agendamento com 30 dias de antecedência",
      dataCriacao: "2024-01-15"
    },
    {
      id: "2",
      nome: "Ginásio Poliesportivo",
      tipo: "ginasio",
      endereco: "Av. do Esporte, 456 - Vila Esportiva",
      capacidade: 1000,
      disponivel: true,
      condicoes: "Bom estado, arquibancadas reformadas recentemente",
      equipamentos: ["Quadra oficial", "Vestiários", "Placar eletrônico", "Iluminação LED"],
      responsavel: "João Santos",
      contato: "(11) 9876-5432",
      observacoes: "Disponível para eventos esportivos e culturais de grande porte",
      dataCriacao: "2024-02-10"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEspaco, setSelectedEspaco] = useState<EspacoCultural | null>(null);

  const filteredEspacos = espacos.filter(espaco =>
    espaco.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    espaco.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEspaco = (espacoData: Omit<EspacoCultural, "id">) => {
    const newEspaco: EspacoCultural = {
      ...espacoData,
      id: Date.now().toString()
    };
    setEspacos([...espacos, newEspaco]);
  };

  const handleEditEspaco = (espacoData: EspacoCultural) => {
    setEspacos(espacos.map(espaco => 
      espaco.id === espacoData.id ? espacoData : espaco
    ));
  };

  const getTipoColor = (tipo: EspacoCultural["tipo"]) => {
    switch (tipo) {
      case "teatro":
        return "bg-purple-100 text-purple-800";
      case "cinema":
        return "bg-red-100 text-red-800";
      case "biblioteca":
        return "bg-green-100 text-green-800";
      case "museu":
        return "bg-yellow-100 text-yellow-800";
      case "quadra-esportiva":
        return "bg-blue-100 text-blue-800";
      case "ginasio":
        return "bg-orange-100 text-orange-800";
      case "piscina":
        return "bg-cyan-100 text-cyan-800";
      case "auditorio":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoLabel = (tipo: EspacoCultural["tipo"]) => {
    switch (tipo) {
      case "teatro":
        return "Teatro";
      case "cinema":
        return "Cinema";
      case "biblioteca":
        return "Biblioteca";
      case "museu":
        return "Museu";
      case "quadra-esportiva":
        return "Quadra Esportiva";
      case "ginasio":
        return "Ginásio";
      case "piscina":
        return "Piscina";
      case "auditorio":
        return "Auditório";
      default:
        return "Outro";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar espaços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => {
            setSelectedEspaco(null);
            setDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Espaço
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEspacos.map((espaco) => (
              <TableRow key={espaco.id}>
                <TableCell>
                  <div className="font-medium">{espaco.nome}</div>
                </TableCell>
                <TableCell>
                  <Badge className={getTipoColor(espaco.tipo)}>
                    {getTipoLabel(espaco.tipo)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {espaco.endereco}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-1" />
                    {espaco.capacidade} pessoas
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={espaco.disponivel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {espaco.disponivel ? "Disponível" : "Indisponível"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">{espaco.responsavel}</div>
                    <div className="text-xs text-gray-500">{espaco.contato}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedEspaco(espaco);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredEspacos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum espaço encontrado</p>
        </div>
      )}

      <EspacoCulturalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        espaco={selectedEspaco}
        onSubmit={selectedEspaco ? handleEditEspaco : handleAddEspaco}
      />
    </div>
  );
}
