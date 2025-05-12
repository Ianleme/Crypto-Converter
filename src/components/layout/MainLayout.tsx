
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-nexus-dark text-nexus-light flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-sm text-nexus-gray">
        <p>© 2025 Nexus Cripto. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
