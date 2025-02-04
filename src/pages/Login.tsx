import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema de Gestão Municipal
          </h1>
          <p className="text-gray-600">
            Acesse sua conta para gerenciar a prefeitura
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;