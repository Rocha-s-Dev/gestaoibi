
import { useState } from "react";
import { toast } from "sonner";
import { 
  Edit2Icon,
  Trash2Icon,
  FileTextIcon,
  SearchIcon
} from "lucide-react";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BidFormValues } from "./BidForm";

// Sample data structure for bids
type Bid = BidFormValues & {
  id: string;
  createdAt: Date;
};

export function BidList({ onEdit }: { onEdit: (bid: Bid) => void }) {
  // In a real application, this would come from an API or database
  const [bids, setBids] = useState<Bid[]>([
    {
      id: "1",
      modalidade: "pregao_eletronico",
      numero: "045/2025",
      objeto: "Aquisição de materiais de escritório",
      dataAbertura: new Date("2025-04-15"),
      valorEstimado: "75000.00",
      situacao: "em_andamento",
      responsavel: "Maria Silva",
      descricao: "Compra de materiais para todas as secretarias",
      createdAt: new Date("2025-03-10"),
    },
    {
      id: "2",
      modalidade: "tomada_de_preco",
      numero: "021/2025",
      objeto: "Reforma da Escola Municipal João Silva",
      dataAbertura: new Date("2025-04-20"),
      valorEstimado: "950000.00",
      situacao: "documentacao",
      responsavel: "Paulo Santos",
      descricao: "Reforma completa incluindo telhado e instalações elétricas",
      createdAt: new Date("2025-03-05"),
    },
    {
      id: "3",
      modalidade: "concorrencia",
      numero: "008/2025",
      objeto: "Pavimentação da Av. Principal",
      dataAbertura: new Date("2025-05-05"),
      valorEstimado: "2450000.00",
      situacao: "publicada",
      responsavel: "Carlos Oliveira",
      descricao: "Pavimentação asfáltica de 3km da avenida principal",
      createdAt: new Date("2025-03-15"),
    },
    {
      id: "4",
      modalidade: "pregao_eletronico",
      numero: "046/2025",
      objeto: "Aquisição de equipamentos de informática",
      dataAbertura: new Date("2025-04-22"),
      valorEstimado: "120000.00",
      situacao: "impugnacao",
      responsavel: "Ana Ferreira",
      descricao: "Computadores e impressoras para o centro administrativo",
      createdAt: new Date("2025-03-12"),
    },
    {
      id: "5",
      modalidade: "convite",
      numero: "015/2025",
      objeto: "Serviços de manutenção predial",
      dataAbertura: new Date("2025-04-12"),
      valorEstimado: "45000.00",
      situacao: "suspensa",
      responsavel: "Roberto Martins",
      descricao: "Manutenção preventiva nos prédios municipais",
      createdAt: new Date("2025-03-01"),
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [bidToDelete, setBidToDelete] = useState<string | null>(null);

  const filteredBids = bids.filter(bid => 
    bid.objeto.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bid.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getModalidadeLabel(bid.modalidade).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteBid = (id: string) => {
    setBids(prevBids => prevBids.filter(bid => bid.id !== id));
    toast.success("Licitação removida com sucesso!");
    setBidToDelete(null);
  };

  const getModalidadeLabel = (value: string) => {
    const modalidades: {[key: string]: string} = {
      pregao_eletronico: "Pregão Eletrônico",
      pregao_presencial: "Pregão Presencial",
      tomada_de_preco: "Tomada de Preço",
      concorrencia: "Concorrência",
      convite: "Convite",
      leilao: "Leilão",
      concurso: "Concurso"
    };
    return modalidades[value] || value;
  };
  
  const getSituacaoLabel = (value: string) => {
    const situacoes: {[key: string]: {label: string, class: string}} = {
      publicada: {
        label: "Publicada",
        class: "bg-green-100 text-green-800"
      },
      em_andamento: {
        label: "Em andamento",
        class: "bg-yellow-100 text-yellow-800"
      },
      documentacao: {
        label: "Documentação",
        class: "bg-blue-100 text-blue-800"
      },
      impugnacao: {
        label: "Impugnação",
        class: "bg-purple-100 text-purple-800"
      },
      homologada: {
        label: "Homologada",
        class: "bg-indigo-100 text-indigo-800"
      },
      suspensa: {
        label: "Suspensa",
        class: "bg-red-100 text-red-800"
      },
      cancelada: {
        label: "Cancelada",
        class: "bg-gray-100 text-gray-800"
      },
      concluida: {
        label: "Concluída",
        class: "bg-teal-100 text-teal-800"
      }
    };
    return situacoes[value] || {label: value, class: "bg-gray-100 text-gray-800"};
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center relative">
        <SearchIcon className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, modalidade ou objeto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modalidade</TableHead>
              <TableHead>Número</TableHead>
              <TableHead className="hidden md:table-cell">Objeto</TableHead>
              <TableHead className="hidden md:table-cell">Abertura</TableHead>
              <TableHead className="text-right">Valor Est.</TableHead>
              <TableHead className="text-center">Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Nenhuma licitação encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredBids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>{getModalidadeLabel(bid.modalidade)}</TableCell>
                  <TableCell>{bid.numero}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                    {bid.objeto}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(bid.dataAbertura), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(bid.valorEstimado))}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSituacaoLabel(bid.situacao).class}`}>
                      {getSituacaoLabel(bid.situacao).label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(bid)}
                    >
                      <Edit2Icon className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setBidToDelete(bid.id)}
                    >
                      <Trash2Icon className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileTextIcon className="h-4 w-4" />
                      <span className="sr-only">Detalhes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={bidToDelete !== null} onOpenChange={() => setBidToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta licitação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => bidToDelete && handleDeleteBid(bidToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
