import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { FiltrosAuditoria as FiltrosType, CategoriaAuditoria, TipoAcaoAuditoria } from "@/hooks/useAuditoria";
import { cn } from "@/lib/utils";

interface FiltrosAuditoriaProps {
  filtros: FiltrosType;
  onFiltrosChange: (filtros: FiltrosType) => void;
}

const categorias: { value: CategoriaAuditoria; label: string }[] = [
  { value: "seguranca", label: "Segurança" },
  { value: "dados", label: "Dados" },
  { value: "financeiro", label: "Financeiro" },
  { value: "documental", label: "Documental" },
];

const tiposAcao: { value: TipoAcaoAuditoria; label: string }[] = [
  { value: "criar", label: "Criar" },
  { value: "editar", label: "Editar" },
  { value: "excluir", label: "Excluir" },
  { value: "visualizar", label: "Visualizar" },
  { value: "aprovar", label: "Aprovar" },
  { value: "rejeitar", label: "Rejeitar" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "exportar", label: "Exportar" },
  { value: "importar", label: "Importar" },
  { value: "reverter", label: "Reverter" },
];

export function FiltrosAuditoria({ filtros, onFiltrosChange }: FiltrosAuditoriaProps) {
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    filtros.dataInicio ? new Date(filtros.dataInicio) : undefined
  );
  const [dataFim, setDataFim] = useState<Date | undefined>(
    filtros.dataFim ? new Date(filtros.dataFim) : undefined
  );

  const activeFiltersCount = Object.values(filtros).filter(Boolean).length;

  const handleClearFilters = () => {
    setDataInicio(undefined);
    setDataFim(undefined);
    onFiltrosChange({});
  };

  const handleDateChange = (tipo: "inicio" | "fim", date: Date | undefined) => {
    if (tipo === "inicio") {
      setDataInicio(date);
      onFiltrosChange({
        ...filtros,
        dataInicio: date?.toISOString(),
      });
    } else {
      setDataFim(date);
      onFiltrosChange({
        ...filtros,
        dataFim: date?.toISOString(),
      });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Busca rápida */}
      <Input
        placeholder="Buscar..."
        value={filtros.busca || ""}
        onChange={(e) => onFiltrosChange({ ...filtros, busca: e.target.value })}
        className="w-[200px]"
      />

      {/* Categoria */}
      <Select
        value={filtros.categoria || "all"}
        onValueChange={(value) =>
          onFiltrosChange({
            ...filtros,
            categoria: value === "all" ? undefined : (value as CategoriaAuditoria),
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {categorias.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tipo de Ação */}
      <Select
        value={filtros.tipoAcao || "all"}
        onValueChange={(value) =>
          onFiltrosChange({
            ...filtros,
            tipoAcao: value === "all" ? undefined : (value as TipoAcaoAuditoria),
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Tipo de Ação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {tiposAcao.map((tipo) => (
            <SelectItem key={tipo.value} value={tipo.value}>
              {tipo.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Data Início */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !dataInicio && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Data Início"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dataInicio}
            onSelect={(date) => handleDateChange("inicio", date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Data Fim */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal",
              !dataFim && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dataFim ? format(dataFim, "dd/MM/yyyy") : "Data Fim"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dataFim}
            onSelect={(date) => handleDateChange("fim", date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Filtros Avançados */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Mais Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Módulo</Label>
              <Input
                placeholder="Ex: public"
                value={filtros.modulo || ""}
                onChange={(e) =>
                  onFiltrosChange({ ...filtros, modulo: e.target.value || undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Entidade</Label>
              <Input
                placeholder="Ex: contracts"
                value={filtros.entidade || ""}
                onChange={(e) =>
                  onFiltrosChange({ ...filtros, entidade: e.target.value || undefined })
                }
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Limpar Filtros */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
