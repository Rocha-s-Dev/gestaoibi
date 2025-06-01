
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Escola } from "@/hooks/useEscolas";

type NovaEscolaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (escola: Omit<Escola, "id"> | Escola) => void;
  escola?: Escola | null;
};

export function NovaEscolaDialog({ open, onOpenChange, onSubmit, escola }: NovaEscolaDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
    diretor: "",
    status: "ativa",
    codigo_mec: "",
    cnpj: "",
    cep: "",
    bairro: "",
    cidade: "",
    estado: "",
    capacidade_total: 0,
    tem_biblioteca: false,
    tem_laboratorio_informatica: false,
    tem_quadra_esportes: false,
    tem_cozinha: false,
    tem_refeitorio: false,
    tem_sala_professores: false,
    tem_sala_diretoria: false,
    tem_secretaria: false,
    acessibilidade_cadeirante: false,
    internet_banda_larga: false,
    energia_eletrica: true,
    agua_potavel: true,
    esgoto_sanitario: true
  });

  useEffect(() => {
    if (escola) {
      setFormData({
        nome: escola.nome,
        endereco: escola.endereco || "",
        telefone: escola.telefone || "",
        email: escola.email || "",
        diretor: escola.diretor || "",
        status: escola.status,
        codigo_mec: escola.codigo_mec || "",
        cnpj: escola.cnpj || "",
        cep: escola.cep || "",
        bairro: escola.bairro || "",
        cidade: escola.cidade || "",
        estado: escola.estado || "",
        capacidade_total: escola.capacidade_total,
        tem_biblioteca: escola.tem_biblioteca,
        tem_laboratorio_informatica: escola.tem_laboratorio_informatica,
        tem_quadra_esportes: escola.tem_quadra_esportes,
        tem_cozinha: escola.tem_cozinha,
        tem_refeitorio: escola.tem_refeitorio,
        tem_sala_professores: escola.tem_sala_professores,
        tem_sala_diretoria: escola.tem_sala_diretoria,
        tem_secretaria: escola.tem_secretaria,
        acessibilidade_cadeirante: escola.acessibilidade_cadeirante,
        internet_banda_larga: escola.internet_banda_larga,
        energia_eletrica: escola.energia_eletrica,
        agua_potavel: escola.agua_potavel,
        esgoto_sanitario: escola.esgoto_sanitario
      });
    } else {
      setFormData({
        nome: "",
        endereco: "",
        telefone: "",
        email: "",
        diretor: "",
        status: "ativa",
        codigo_mec: "",
        cnpj: "",
        cep: "",
        bairro: "",
        cidade: "",
        estado: "",
        capacidade_total: 0,
        tem_biblioteca: false,
        tem_laboratorio_informatica: false,
        tem_quadra_esportes: false,
        tem_cozinha: false,
        tem_refeitorio: false,
        tem_sala_professores: false,
        tem_sala_diretoria: false,
        tem_secretaria: false,
        acessibilidade_cadeirante: false,
        internet_banda_larga: false,
        energia_eletrica: true,
        agua_potavel: true,
        esgoto_sanitario: true
      });
    }
  }, [escola]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (escola) {
      onSubmit({ ...formData, id: escola.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {escola ? "Editar Escola" : "Nova Escola"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Escola *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: EMEF Dom Pedro II"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diretor">Diretor(a) *</Label>
                <Input
                  id="diretor"
                  value={formData.diretor}
                  onChange={(e) => setFormData(prev => ({ ...prev, diretor: e.target.value }))}
                  placeholder="Nome do diretor"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo_mec">Código MEC</Label>
                <Input
                  id="codigo_mec"
                  value={formData.codigo_mec}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo_mec: e.target.value }))}
                  placeholder="Código do MEC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 3456-7890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="escola@educacao.gov.br"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacidade_total">Capacidade Total de Alunos</Label>
                <Input
                  id="capacidade_total"
                  type="number"
                  value={formData.capacidade_total}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacidade_total: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
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
                    <SelectItem value="em_reforma">Em Reforma</SelectItem>
                    <SelectItem value="em_construcao">Em Construção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                  placeholder="00000-000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                  placeholder="Nome do bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  placeholder="Nome da cidade"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>

          {/* Infraestrutura */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Infraestrutura</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tem_biblioteca"
                  checked={formData.tem_biblioteca}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tem_biblioteca: checked as boolean }))
                  }
                />
                <Label htmlFor="tem_biblioteca">Biblioteca</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tem_laboratorio_informatica"
                  checked={formData.tem_laboratorio_informatica}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tem_laboratorio_informatica: checked as boolean }))
                  }
                />
                <Label htmlFor="tem_laboratorio_informatica">Lab. Informática</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tem_quadra_esportes"
                  checked={formData.tem_quadra_esportes}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tem_quadra_esportes: checked as boolean }))
                  }
                />
                <Label htmlFor="tem_quadra_esportes">Quadra de Esportes</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tem_cozinha"
                  checked={formData.tem_cozinha}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tem_cozinha: checked as boolean }))
                  }
                />
                <Label htmlFor="tem_cozinha">Cozinha</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tem_refeitorio"
                  checked={formData.tem_refeitorio}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tem_refeitorio: checked as boolean }))
                  }
                />
                <Label htmlFor="tem_refeitorio">Refeitório</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tem_sala_professores"
                  checked={formData.tem_sala_professores}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tem_sala_professores: checked as boolean }))
                  }
                />
                <Label htmlFor="tem_sala_professores">Sala de Professores</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tem_sala_diretoria"
                  checked={formData.tem_sala_diretoria}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tem_sala_diretoria: checked as boolean }))
                  }
                />
                <Label htmlFor="tem_sala_diretoria">Diretoria</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tem_secretaria"
                  checked={formData.tem_secretaria}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, tem_secretaria: checked as boolean }))
                  }
                />
                <Label htmlFor="tem_secretaria">Secretaria</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acessibilidade_cadeirante"
                  checked={formData.acessibilidade_cadeirante}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acessibilidade_cadeirante: checked as boolean }))
                  }
                />
                <Label htmlFor="acessibilidade_cadeirante">Acessibilidade</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internet_banda_larga"
                  checked={formData.internet_banda_larga}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, internet_banda_larga: checked as boolean }))
                  }
                />
                <Label htmlFor="internet_banda_larga">Internet Banda Larga</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="energia_eletrica"
                  checked={formData.energia_eletrica}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, energia_eletrica: checked as boolean }))
                  }
                />
                <Label htmlFor="energia_eletrica">Energia Elétrica</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agua_potavel"
                  checked={formData.agua_potavel}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agua_potavel: checked as boolean }))
                  }
                />
                <Label htmlFor="agua_potavel">Água Potável</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="esgoto_sanitario"
                  checked={formData.esgoto_sanitario}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, esgoto_sanitario: checked as boolean }))
                  }
                />
                <Label htmlFor="esgoto_sanitario">Esgoto Sanitário</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {escola ? "Atualizar" : "Cadastrar"} Escola
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
