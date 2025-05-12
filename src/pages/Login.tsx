
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginFormValues } from "@/lib/schemas";
import AuthForm from "@/components/AuthForm";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      await login(values.email, values.password);
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta à Nexus Cripto!",
      });
    } catch (error) {
      // Error is handled in the useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-nexus-gray mt-2">
          Entre com sua conta para continuar
        </p>
      </div>
      
      <AuthForm
        type="login"
        onSubmit={handleLogin}
        isLoading={isLoading}
      />
      
      <div className="text-center text-sm">
        <span className="text-nexus-gray">Não tem uma conta?</span>{" "}
        <Link 
          to="/register" 
          className="text-nexus-red hover:underline font-medium"
        >
          Registrar
        </Link>
      </div>
    </div>
  );
};

export default Login;
