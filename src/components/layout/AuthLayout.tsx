import { Outlet, Link } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-nexus-dark">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img
                src="https://gruponexus.com.br/wp-content/uploads/2021/11/logo-principal.png"
                alt="Nexus Cripto Logo"
                className="h-19 w-auto mx-auto mb-4"
              />
            </Link>
            <h1 className="text-2xl font-bold text-nexus-light">
              Nexus Cripto
            </h1>
            <p className="text-sm text-nexus-gray mt-2">
              Soluções Financeiras em Criptomoedas
            </p>
          </div>
          <div className="bg-nexus-dark/60 border border-white/10 backdrop-blur-sm rounded-xl shadow-xl p-6">
            <Outlet />
          </div>
        </div>
      </div>
      <footer className="py-6 text-center text-sm text-nexus-gray">
        <p>© 2025 Nexus Cripto. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;
