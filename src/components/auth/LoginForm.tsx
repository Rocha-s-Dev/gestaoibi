
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn(email, password);
      if (result?.error) {
        const errorMessage = result.error.message || "Erro ao fazer login";
        console.error("Login error:", errorMessage);
        
        // Provide more user-friendly error messages based on error code
        if (errorMessage.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos. Por favor, verifique suas credenciais.");
        } else if (errorMessage.includes("Email not confirmed")) {
          toast.error("Email não confirmado. Por favor, verifique sua caixa de entrada.");
        } else {
          toast.error("Erro ao fazer login: " + errorMessage);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm animate-fadeIn">
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground mt-4">
        O cadastro de novos usuários é realizado exclusivamente pelo Departamento de Recursos Humanos.
      </p>
    </form>
  );
};
