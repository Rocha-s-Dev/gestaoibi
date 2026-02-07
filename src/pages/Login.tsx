import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sistema de Gestão Municipal
          </h1>
          <p className="text-muted-foreground">
            Acesse sua conta para gerenciar a prefeitura
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Usuários são criados exclusivamente pelo Departamento de RH
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;