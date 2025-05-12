import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterFormValues } from "@/lib/schemas";
import AuthForm from "@/components/AuthForm";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      await register(values.email, values.password);
      setUserEmail(values.email);
      setShowEmailAlert(true);
    } catch (error) {
      // Error is handled in the useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertClose = () => {
    setShowEmailAlert(false);
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Criar Conta</h1>
        <p className="text-sm text-nexus-gray mt-2">
          Crie sua conta para começar a usar a Nexus Cripto
        </p>
      </div>

      <AuthForm
        type="register"
        onSubmit={handleRegister}
        isLoading={isLoading}
      />

      <div className="text-center text-sm">
        <span className="text-nexus-gray">Já tem uma conta?</span>{" "}
        <Link
          to="/login"
          className="text-nexus-red hover:underline font-medium"
        >
          Entrar
        </Link>
      </div>

      <AlertDialog open={showEmailAlert} onOpenChange={setShowEmailAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verifique seu e-mail</AlertDialogTitle>
            <AlertDialogDescription>
              Enviamos um e-mail de confirmação para{" "}
              <strong>{userEmail}</strong>. Por favor, verifique sua caixa de
              entrada e clique no link de confirmação para ativar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleAlertClose}
              className="bg-nexus-red hover:bg-nexus-red/90"
            >
              Entendi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Register;
