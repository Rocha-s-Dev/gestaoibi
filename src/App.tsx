
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import Funcionarios from "@/pages/Funcionarios";
import Metas from "@/pages/Metas";
import AcompanhamentoMetas from "@/pages/AcompanhamentoMetas";
import Mensagens from "@/pages/Mensagens";
import Notificacoes from "@/pages/Notificacoes";
import { AuthProvider, RequireAuth } from "@/contexts/AuthContext";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/funcionarios"
          element={
            <RequireAuth>
              <Funcionarios />
            </RequireAuth>
          }
        />
        <Route
          path="/metas"
          element={
            <RequireAuth>
              <Metas />
            </RequireAuth>
          }
        />
        <Route
          path="/acompanhamento-metas"
          element={
            <RequireAuth>
              <AcompanhamentoMetas />
            </RequireAuth>
          }
        />
        <Route
          path="/mensagens"
          element={
            <RequireAuth>
              <Mensagens />
            </RequireAuth>
          }
        />
        <Route
          path="/notificacoes"
          element={
            <RequireAuth>
              <Notificacoes />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}
