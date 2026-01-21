import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, FileSearch, ArrowLeft } from "lucide-react";
import { FormularioMatricula } from "@/components/matricula/FormularioMatricula";
import { ConsultaProtocolo } from "@/components/matricula/ConsultaProtocolo";

export default function MatriculaOnline() {
  const [activeTab, setActiveTab] = useState("solicitar");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold">Matrícula Online</h1>
              <p className="text-xs text-muted-foreground">Sistema Municipal de Educação</p>
            </div>
          </div>
          <Link to="/login">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Área Restrita
            </Button>
          </Link>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Solicitação de Matrícula</h2>
            <p className="mt-2 text-muted-foreground">
              Preencha o formulário abaixo para solicitar a matrícula do seu filho(a) na rede municipal de ensino
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="solicitar" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Solicitar Matrícula
              </TabsTrigger>
              <TabsTrigger value="consultar" className="flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                Consultar Protocolo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="solicitar">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Solicitação de Matrícula</CardTitle>
                  <CardDescription>
                    Preencha todos os dados obrigatórios (*) para solicitar a matrícula
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormularioMatricula onSuccess={() => setActiveTab("consultar")} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultar">
              <Card>
                <CardHeader>
                  <CardTitle>Acompanhar Solicitação</CardTitle>
                  <CardDescription>
                    Digite o número do protocolo para consultar o status da sua solicitação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConsultaProtocolo />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold">Documentos Necessários</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Certidão de nascimento ou RG do aluno</li>
              <li>• Comprovante de residência atualizado</li>
              <li>• Histórico escolar (para transferências)</li>
              <li>• Documento de identidade do responsável</li>
              <li>• Cartão de vacinação (para educação infantil)</li>
              <li>• Laudo médico (se necessidades especiais)</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Prefeitura Municipal - Secretaria de Educação</p>
      </footer>
    </div>
  );
}
