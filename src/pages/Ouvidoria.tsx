import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { OuvidoriaMunicipal } from "@/components/governo/OuvidoriaMunicipal";

export default function Ouvidoria() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Ouvidoria Municipal</h1>
          <p className="text-muted-foreground mt-2">
            Canal de reclamações, sugestões, elogios e denúncias do cidadão
          </p>
        </header>
        <Card>
          <CardHeader><CardTitle>Manifestações</CardTitle></CardHeader>
          <CardContent>
            <OuvidoriaMunicipal />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
