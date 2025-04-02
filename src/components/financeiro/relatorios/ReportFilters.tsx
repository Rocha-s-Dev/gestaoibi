
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

type ReportFiltersProps = {
  filters: {
    startDate: Date;
    endDate: Date;
    categoryId: string;
    departmentId: string;
    transactionType: string;
  };
  onFilterChange: (filters: any) => void;
};

export function ReportFilters({ filters, onFilterChange }: ReportFiltersProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Carregar categorias e departamentos
  useEffect(() => {
    const fetchData = async () => {
      // Buscar categorias
      const { data: categoriesData } = await supabase
        .from("financial_categories")
        .select("*")
        .order("name");
      
      setCategories(categoriesData || []);
      
      // Buscar departamentos
      const { data: departmentsData } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      
      setDepartments(departmentsData || []);
    };
    
    fetchData();
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-5">
          {/* Seletor de Data Inicial */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    format(filters.startDate, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => {
                    if (date) {
                      onFilterChange({ startDate: date });
                      setStartDateOpen(false);
                    }
                  }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seletor de Data Final */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final</Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    format(filters.endDate, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => {
                    if (date) {
                      onFilterChange({ endDate: date });
                      setEndDateOpen(false);
                    }
                  }}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seletor de Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={filters.categoryId || ""}
              onValueChange={(value) => onFilterChange({ categoryId: value })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Departamento */}
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Select
              value={filters.departmentId || ""}
              onValueChange={(value) => onFilterChange({ departmentId: value })}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Todos os departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os departamentos</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Tipo de Transação */}
          <div className="space-y-2">
            <Label htmlFor="transactionType">Tipo</Label>
            <Select
              value={filters.transactionType}
              onValueChange={(value) => onFilterChange({ transactionType: value })}
            >
              <SelectTrigger id="transactionType">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
