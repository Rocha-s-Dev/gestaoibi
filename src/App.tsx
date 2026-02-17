import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";

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
import GestaoEducacao from "@/pages/GestaoEducacao";
import AdminRH from "@/pages/AdminRH";
import Auditoria from "@/pages/Auditoria";
import GestaoFinanceiraPublica from "@/pages/GestaoFinanceiraPublica";
import ArrecadacaoTributaria from "@/pages/ArrecadacaoTributaria";
import MatriculaOnline from "@/pages/MatriculaOnline";
import PortalResponsavelLogin from "@/pages/PortalResponsavelLogin";
import PortalResponsavelDashboard from "@/pages/PortalResponsavelDashboard";
import GestaoTransportes from "@/pages/GestaoTransportes";
import GestaoAgricultura from "@/pages/GestaoAgricultura";
import GestaoTurismoCultura from "@/pages/GestaoTurismoCultura";
import Controladoria from "@/pages/Controladoria";
import GabinetePrefeito from "@/pages/GabinetePrefeito";
import CoordenacaoPedagogica from "@/pages/CoordenacaoPedagogica";
import Ouvidoria from "@/pages/Ouvidoria";
import { AuthProvider, RequireAuth } from "@/contexts/AuthContext";
import { SecretariaProvider } from "@/contexts/SecretariaContext";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <SecretariaProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="/funcionarios" element={<Navigate to="/admin/rh" replace />} />
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
        <Route
          path="/admin/rh"
          element={
            <RequireAuth>
              <AdminRH />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/auditoria"
          element={
            <RequireAuth>
              <Auditoria />
            </RequireAuth>
          }
        />
        <Route
          path="/educacao/gestao"
          element={
            <RequireAuth>
              <GestaoEducacao />
            </RequireAuth>
          }
        />
        <Route
          path="/educacao/coordenacao"
          element={
            <RequireAuth>
              <CoordenacaoPedagogica />
            </RequireAuth>
          }
        />
        <Route
          path="/gestao-financeira-publica"
          element={
            <RequireAuth>
              <GestaoFinanceiraPublica />
            </RequireAuth>
          }
        />
        <Route
          path="/arrecadacao-tributaria"
          element={
            <RequireAuth>
              <ArrecadacaoTributaria />
            </RequireAuth>
          }
        />
        {/* Matrícula Online - Página Pública */}
        <Route path="/matricula-online" element={<MatriculaOnline />} />
        
        {/* Portal do Responsável */}
        <Route path="/portal-responsavel/login" element={<PortalResponsavelLogin />} />
        <Route
          path="/portal-responsavel/dashboard"
          element={
            <RequireAuth>
              <PortalResponsavelDashboard />
            </RequireAuth>
          }
        />
        <Route path="/transportes" element={<RequireAuth><GestaoTransportes /></RequireAuth>} />
        <Route path="/agricultura" element={<RequireAuth><GestaoAgricultura /></RequireAuth>} />
        <Route path="/turismo-cultura" element={<RequireAuth><GestaoTurismoCultura /></RequireAuth>} />
        <Route path="/controladoria" element={<RequireAuth><Controladoria /></RequireAuth>} />
        <Route path="/gabinete-prefeito" element={<RequireAuth><GabinetePrefeito /></RequireAuth>} />
        <Route path="/governo/ouvidoria" element={<RequireAuth><Ouvidoria /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      </SecretariaProvider>
    </AuthProvider>
  );
}
