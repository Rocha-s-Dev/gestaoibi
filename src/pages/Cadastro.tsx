
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Cadastro() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Cadastro</h1>
          <p className="text-muted-foreground">
            Cadastre novos itens no sistema
          </p>
        </header>
        
        <Card>
          <CardHeader>
            <CardTitle>Formulário de Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione o tipo de cadastro que deseja realizar.
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <button className="rounded-lg border p-4 text-left hover:bg-gray-100">
                  <h3 className="font-medium">Usuário</h3>
                  <p className="text-sm text-muted-foreground">
                    Cadastrar novo usuário no sistema
                  </p>
                </button>
                
                <button className="rounded-lg border p-4 text-left hover:bg-gray-100">
                  <h3 className="font-medium">Departamento</h3>
                  <p className="text-sm text-muted-foreground">
                    Cadastrar novo departamento
                  </p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
