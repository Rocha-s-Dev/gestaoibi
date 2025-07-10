import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { GestaoNotas } from "./GestaoNotas";
import { GestaoFaltas } from "./GestaoFaltas";
import { BoletimEscolar } from "./BoletimEscolar";
import { CalendarioEscolar } from "./CalendarioEscolar";

export function SistemaAcademico() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sistema Acadêmico</h1>
        <p className="text-muted-foreground">Gestão completa de notas, faltas, boletins e calendário escolar</p>
      </div>

      <Tabs defaultValue="notas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notas" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="faltas" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Faltas
          </TabsTrigger>
          <TabsTrigger value="boletim" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Boletim
          </TabsTrigger>
          <TabsTrigger value="calendario" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Gestão de Notas
              </CardTitle>
              <CardDescription>
                Lançamento e controle de notas por disciplina e bimestre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GestaoNotas />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faltas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Controle de Faltas
              </CardTitle>
              <CardDescription>
                Registro e acompanhamento de frequência escolar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GestaoFaltas />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boletim">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Boletim Escolar
              </CardTitle>
              <CardDescription>
                Visualização e impressão de boletins dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BoletimEscolar />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário Escolar
              </CardTitle>
              <CardDescription>
                Planejamento e visualização de eventos e atividades escolares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarioEscolar />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}