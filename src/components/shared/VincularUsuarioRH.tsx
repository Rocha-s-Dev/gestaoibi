import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Mail, CreditCard, Loader2, AlertTriangle } from "lucide-react";
import { useUsuariosRH, UsuarioRH } from "@/hooks/useUsuariosRH";

interface VincularUsuarioRHProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUsuarioSelecionado: (usuario: UsuarioRH) => void;
  titulo?: string;
  descricao?: string;
}

export function VincularUsuarioRH({
  open,
  onOpenChange,
  onUsuarioSelecionado,
  titulo = "Vincular Usuário do RH",
  descricao = "Busque e selecione um servidor previamente cadastrado pelo Departamento de RH.",
}: VincularUsuarioRHProps) {
  const [termo, setTermo] = useState("");
  const { usuarios, loading, buscarUsuarios, limparBusca } = useUsuariosRH();

  useEffect(() => {
    if (!open) {
      setTermo("");
      limparBusca();
    }
  }, [open, limparBusca]);

  const handleSearch = useCallback(
    (value: string) => {
      setTermo(value);
      if (value.length >= 2) {
        buscarUsuarios(value);
      } else {
        limparBusca();
      }
    },
    [buscarUsuarios, limparBusca]
  );

  const handleSelect = (usuario: UsuarioRH) => {
    onUsuarioSelecionado(usuario);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {titulo}
          </DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aviso institucional */}
          <div className="flex items-start gap-2 p-3 rounded-md bg-muted border border-border">
            <AlertTriangle className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Apenas usuários previamente cadastrados pelo RH podem ser vinculados.
              Caso o servidor não apareça na busca, solicite o cadastro ao Departamento de RH.
            </p>
          </div>

          {/* Campo de busca */}
          <div className="space-y-2">
            <Label htmlFor="busca-rh">Buscar por nome, CPF, matrícula ou e-mail</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="busca-rh"
                placeholder="Digite pelo menos 2 caracteres..."
                value={termo}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          {/* Resultados */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                <span className="text-muted-foreground">Buscando servidores...</span>
              </div>
            ) : usuarios.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {usuarios.length} servidor(es) encontrado(s)
                </p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {usuarios.map((usuario) => (
                    <Card
                      key={usuario.user_id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleSelect(usuario)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{usuario.nome}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {usuario.email}
                              </span>
                              {usuario.cpf && (
                                <span className="flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  {usuario.cpf}
                                </span>
                              )}
                              {usuario.matricula && (
                                <span className="text-xs">Mat: {usuario.matricula}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={usuario.status_cadastral === "ativo" ? "default" : "secondary"}>
                              {usuario.status_cadastral}
                            </Badge>
                            {usuario.secretaria_atual && (
                              <span className="text-xs text-muted-foreground">
                                {usuario.secretaria_atual}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : termo.length >= 2 && !loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum servidor encontrado com "{termo}"</p>
                <p className="text-xs mt-1">
                  Verifique se o servidor está cadastrado no módulo de RH
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Digite o nome, CPF, matrícula ou e-mail do servidor</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
