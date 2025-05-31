
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
import Financeiro from "@/pages/Financeiro";
import FinanceiroRelatorios from "@/pages/FinanceiroRelatorios";
import ContratosPagamentos from "@/pages/ContratosPagamentos";
import ComprasLicitacoes from "@/pages/ComprasLicitacoes";
import DesenvolvimentoEmpresas from "@/pages/DesenvolvimentoEmpresas";
import GestaoAmbiental from "@/pages/GestaoAmbiental";
import GestaoDeProgamasSociais from "@/pages/GestaoDeProgamasSociais";
import GestaoProjetos from "@/pages/GestaoProjetos";
import ProgramasIncentivo from "@/pages/ProgramasIncentivo";
import InfraestruturaCultural from "@/pages/InfraestruturaCultural";
import GestaoObras from "@/pages/GestaoObras";
import Manutencao from "@/pages/Manutencao";
import GestaoSaudePublica from "@/pages/GestaoSaudePublica";
import AtendimentoPaciente from "@/pages/AtendimentoPaciente";
import GestaoPoliticasPublicas from "@/pages/GestaoPoliticasPublicas";
import Transparencia from "@/pages/Transparencia";
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
        <Route
          path="/financeiro"
          element={
            <RequireAuth>
              <Financeiro />
            </RequireAuth>
          }
        />
        <Route
          path="/financeiro/relatorios"
          element={
            <RequireAuth>
              <FinanceiroRelatorios />
            </RequireAuth>
          }
        />
        <Route
          path="/contratos/pagamentos"
          element={
            <RequireAuth>
              <ContratosPagamentos />
            </RequireAuth>
          }
        />
        <Route
          path="/compras/licitacoes"
          element={
            <RequireAuth>
              <ComprasLicitacoes />
            </RequireAuth>
          }
        />
        <Route
          path="/desenvolvimento/empresas"
          element={
            <RequireAuth>
              <DesenvolvimentoEmpresas />
            </RequireAuth>
          }
        />
        <Route
          path="/desenvolvimento/ambiental"
          element={
            <RequireAuth>
              <GestaoAmbiental />
            </RequireAuth>
          }
        />
        <Route
          path="/social/programas"
          element={
            <RequireAuth>
              <GestaoDeProgamasSociais />
            </RequireAuth>
          }
        />
        <Route
          path="/cultura/projetos"
          element={
            <RequireAuth>
              <GestaoProjetos />
            </RequireAuth>
          }
        />
        <Route
          path="/cultura/incentivos"
          element={
            <RequireAuth>
              <ProgramasIncentivo />
            </RequireAuth>
          }
        />
        <Route
          path="/cultura/infraestrutura"
          element={
            <RequireAuth>
              <InfraestruturaCultural />
            </RequireAuth>
          }
        />
        <Route
          path="/infraestrutura/obras"
          element={
            <RequireAuth>
              <GestaoObras />
            </RequireAuth>
          }
        />
        <Route
          path="/infraestrutura/manutencao"
          element={
            <RequireAuth>
              <Manutencao />
            </RequireAuth>
          }
        />
        <Route
          path="/saude/gestao"
          element={
            <RequireAuth>
              <GestaoSaudePublica />
            </RequireAuth>
          }
        />
        <Route
          path="/saude/atendimento"
          element={
            <RequireAuth>
              <AtendimentoPaciente />
            </RequireAuth>
          }
        />
        <Route
          path="/governo/politicas"
          element={
            <RequireAuth>
              <GestaoPoliticasPublicas />
            </RequireAuth>
          }
        />
        <Route
          path="/governo/transparencia"
          element={
            <RequireAuth>
              <Transparencia />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}
