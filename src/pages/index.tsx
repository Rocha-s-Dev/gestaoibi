
import React from "react";
import { Layout } from "@/components/layout/Layout";

export default function Index() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel administrativo
          </p>
        </header>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-medium">Bem-vindo</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Use o menu lateral para navegar entre as diferentes seções do sistema.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-medium">Metas Financeiras</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Defina e acompanhe suas metas de receitas e despesas.
            </p>
          </div>
          
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-medium">Relatórios</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Visualize relatórios financeiros detalhados.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
