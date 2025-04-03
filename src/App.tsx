
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Financeiro from "@/pages/Financeiro";
import RelatoriosFinanceiros from "@/pages/RelatoriosFinanceiros";
import Funcionarios from "@/pages/Funcionarios";
import Metas from "@/pages/Metas";
import AcompanhamentoMetas from "@/pages/AcompanhamentoMetas";
import Mensagens from "@/pages/Mensagens";
import Notificacoes from "@/pages/Notificacoes";
import Configuracoes from "@/pages/Configuracoes";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/relatorios-financeiros" element={<RelatoriosFinanceiros />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/acompanhamento-metas" element={<AcompanhamentoMetas />} />
            <Route path="/mensagens" element={<Mensagens />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
