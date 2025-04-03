
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações de perfil
          </p>
        </header>
        
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nome</label>
                <input
                  type="text"
                  className="rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Seu nome"
                  disabled
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="rounded-md border border-gray-300 px-3 py-2"
                  placeholder="seu.email@exemplo.com"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
