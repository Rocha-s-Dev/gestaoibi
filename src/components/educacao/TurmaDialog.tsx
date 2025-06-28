
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Turma } from "@/hooks/useTurmas";
import { useEscolas } from "@/hooks/useEscolas";
import { useProfessores } from "@/hooks/useProfessores";

type TurmaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (turma: Omit<Turma, "id"> | Turma) => void;
  turma?: Turma | null;
};

export function TurmaDialog({ open, onOpenChange, onSubmit, turma }: TurmaDialogProps) {
  const { escolas } = useEscolas();
  const { professores } = useProfessores();
  const [formData, setFormData] = useState({
    nome: "",
    serie: "",
    ano_letivo: new Date().getFullYear(),
    turno: "matutino" as const,
    modalidade: "fundamental_i" as const,
    capacidade: 30,
    sala: "",
    status: "ativa",
    escola_id: "",
    professor_responsavel_id: ""
  });

  useEffect(() => {
    if (turma) {
      setFormData({
        nome: turma.nome,
        serie: turma.serie,
        ano_letivo: turma.ano_letivo,
        turno: turma.turno,
        modalidade: turma.modalidade,
        capacidade: turma.capacidade || 30,
        sala: turma.sala || "",
        status: turma.status,
        escola_id: turma.escola_id,
        professor_responsavel_id: turma.professor_responsavel_id || ""
      });
    } else {
      setFormData({
        nome: "",
        serie: "",
        ano_letivo: new Date().getFullYear(),
        turno: "matutino",
        modalidade: "fundamental_i",
        capacidade: 30,
        sala: "",
        status: "ativa",
        escola_id: "",
        professor_responsavel_id: ""
      });
    }
  }, [turma]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const turmaData = {
      ...formData,
      professor_responsavel_id: formData.professor_responsavel_id || null
    };

    if (turma) {
      onSubmit({ ...turmaData, id: turma.id });
    } else {
      onSubmit(turmaData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {turma ? "Editar Turma" : "Nova Turma"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Turma *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: 5º Ano A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serie">Série *</Label>
              <Input
                id="serie"
                value={formData.serie}
                onChange={(e) => setFormData(prev => ({ ...prev, serie: e.target.value }))}
                placeholder="Ex: 5º Ano"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ano_letivo">Ano Letivo *</Label>
              <Input
                id="ano_letivo"
                type="number"
                value={formData.ano_letivo}
                onChange={(e) => setFormData(prev => ({ ...prev, ano_letivo: parseInt(e.target.value) }))}
                min="2020"
                max="2030"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade *</Label>
              <Input
                id="capacidade"
                type="number"
                value={formData.capacidade}
                onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) }))}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="turno">Turno *</Label>
              <Select
                value={formData.turno}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, turno: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matutino">Matutino</SelectItem>
                  <SelectItem value="vespertino">Vespertino</SelectItem>
                  <SelectItem value="noturno">Noturno</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade *</Label>
              <Select
                value={formData.modalidade}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, modalidade: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creche">Creche</SelectItem>
                  <SelectItem value="infantil">Educação Infantil</SelectItem>
                  <SelectItem value="fundamental_i">Fundamental I</SelectItem>
                  <SelectItem value="fundamental_ii">Fundamental II</SelectItem>
                  <SelectItem value="eja">EJA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="escola_id">Escola *</Label>
              <Select
                value={formData.escola_id}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, escola_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor_responsavel_id">Professor Responsável</Label>
              <Select
                value={formData.professor_responsavel_id}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, professor_responsavel_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum professor</SelectItem>
                  {professores.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sala">Sala</Label>
              <Input
                id="sala"
                value={formData.sala}
                onChange={(e) => setFormData(prev => ({ ...prev, sala: e.target.value }))}
                placeholder="Ex: Sala 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {turma ? "Atualizar" : "Cadastrar"} Turma
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
