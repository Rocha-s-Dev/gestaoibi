import { RegisterForm } from "@/components/auth/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sistema de Gestão Municipal
          </h1>
          <p className="text-gray-600">
            Crie sua conta para acessar o sistema
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;