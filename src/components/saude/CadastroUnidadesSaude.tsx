
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Clock, Users, Edit, Trash2 } from "lucide-react";
import { UnidadeSaudeDialog } from "./UnidadeSaudeDialog";

export interface UnidadeSaude {
  id: string;
  nome: string;
  tipo: "UBS" | "UPA" | "Hospital" | "Clinica" | "CAPS" | "Laboratorio";
  endereco: string;
  telefone: string;
  horarioFuncionamento: {
    segunda: string;
    terca: string;
    quarta: string;
    quinta: string;
    sexta: string;
    sabado: string;
    domingo: string;
  };
  especialidades: string[];
  responsavel: string;
  capacidade: number;
  status: "ativo" | "inativo" | "manutencao";
  observacoes?: string;
}

const unidadesMock: UnidadeSaude[] = [
  {
    id: "1",
    nome: "UBS Centro",
    tipo: "UBS",
    endereco: "Rua Principal, 123 - Centro",
    telefone: "(11) 1234-5678",
    horarioFuncionamento: {
      segunda: "08:00-17:00",
      terca: "08:00-17:00",
      quarta: "08:00-17:00",
      quinta: "08:00-17:00",
      sexta: "08:00-17:00",
      sabado: "08:00-12:00",
      domingo: "Fechado"
    },
    especialidades: ["Clínica Geral", "Pediatria", "Ginecologia"],
    responsavel: "Dr. João Silva",
    capacidade: 200,
    status: "ativo",
    observacoes: "Unidade principal do centro da cidade"
  },
  {
    id: "2",
    nome: "UPA 24h Norte",
    tipo: "UPA",
    endereco: "Av. Norte, 456 - Bairro Norte",
    telefone: "(11) 9876-5432",
    horarioFuncionamento: {
      segunda: "24h",
      terca: "24h",
      quarta: "24h",
      quinta: "24h",
      sexta: "24h",
      sabado: "24h",
      domingo: "24h"
    },
    especialidades: ["Urgência e Emergência", "Ortopedia", "Cardiologia"],
    responsavel: "Dr. Maria Santos",
    capacidade: 100,
    status: "ativo"
  },
  {
    id: "3",
    nome: "Hospital Municipal",
    tipo: "Hospital",
    endereco: "Rua da Saúde, 789 - Centro",
    telefone: "(11) 2468-1357",
    horarioFuncionamento: {
      segunda: "24h",
      terca: "24h",
      quarta: "24h",
      quinta: "24h",
      sexta: "24h",
      sabado: "24h",
      domingo: "24h"
    },
    especialidades: ["Cirurgia Geral", "UTI", "Maternidade", "Pediatria"],
    responsavel: "Dr. Carlos Oliveira",
    capacidade: 150,
    status: "ativo"
  }
];

const tipoColors = {
  UBS: "bg-blue-100 text-blue-800",
  UPA: "bg-red-100 text-red-800",
  Hospital: "bg-green-100 text-green-800",
  Clinica: "bg-purple-100 text-purple-800",
  CAPS: "bg-yellow-100 text-yellow-800",
  Laboratorio: "bg-orange-100 text-orange-800"
};

const statusColors = {
  ativo: "bg-green-100 text-green-800",
  inativo: "bg-gray-100 text-gray-800",
  manutencao: "bg-yellow-100 text-yellow-800"
};

export function CadastroUnidadesSaude() {
  const [unidades, setUnidades] = useState<UnidadeSaude[]>(unidadesMock);
  const [filteredUnidades, setFilteredUnidades] = useState<UnidadeSaude[]>(unidadesMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUnidade, setSelectedUnidade] = useState<UnidadeSaude | null>(null);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredUnidades(unidades);
    } else {
      const filtered = unidades.filter(
        unidade =>
          unidade.nome.toLowerCase().includes(term.toLowerCase()) ||
          unidade.tipo.toLowerCase().includes(term.toLowerCase()) ||
          unidade.endereco.toLowerCase().includes(term.toLowerCase()) ||
          unidade.especialidades.some(esp => esp.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredUnidades(filtered);
    }
  };

  const handleUnidadeCreated = () => {
    // Aqui seria implementada a lógica de atualização da lista
    console.log("Unidade criada/atualizada");
  };

  const handleEdit = (unidade: UnidadeSaude) => {
    setSelectedUnidade(unidade);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = unidades.filter((u) => u.id !== id);
    setUnidades(updated);
    if (searchTerm) {
      setFilteredUnidades(updated.filter(
        (u) =>
          u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.especialidades.some((esp) => esp.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    } else {
      setFilteredUnidades(updated);
    }
  };

  const openNewUnidadeDialog = () => {
    setSelectedUnidade(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Buscar unidades..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openNewUnidadeDialog} className="flex items-center gap-2">
          <Plus size={20} />
          Nova Unidade
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUnidades.map((unidade) => (
          <Card key={unidade.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{unidade.nome}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={tipoColors[unidade.tipo]}>{unidade.tipo}</Badge>
                    <Badge className={statusColors[unidade.status]}>{unidade.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(unidade)}
                    className="h-8 w-8"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(unidade.id)}
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{unidade.endereco}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>Seg-Sex: {unidade.horarioFuncionamento.segunda}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>Capacidade: {unidade.capacidade} pacientes</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {unidade.especialidades.slice(0, 3).map((esp, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {esp}
                    </Badge>
                  ))}
                  {unidade.especialidades.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{unidade.especialidades.length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Responsável:</span> {unidade.responsavel}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telefone:</span> {unidade.telefone}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUnidades.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma unidade encontrada</p>
        </div>
      )}

      <UnidadeSaudeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unidade={selectedUnidade}
        onUnidadeCreated={handleUnidadeCreated}
      />
    </div>
  );
}
