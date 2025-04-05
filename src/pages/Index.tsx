
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-blue-100">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-5xl font-bold mb-6 text-blue-800">CitySync Dashboard</h1>
        <p className="text-xl text-gray-700 mb-8">
          Sistema integrado para gestão municipal - controle de metas, finanças, recursos humanos e comunicação.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/login">Entrar no Sistema</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/register">Criar Nova Conta</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
