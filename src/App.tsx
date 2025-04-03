
import { AuthProvider } from "@/contexts/AuthContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/index";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import Cadastro from "./pages/Cadastro";
import { ContextContainer } from "@/contexts/ContextContainer";
import RelatoriosFinanceiros from "./pages/RelatoriosFinanceiros";
import MetasFinanceiras from "./pages/MetasFinanceiras";

function App() {
  return (
    <AuthProvider>
      <RouterProvider
        router={createBrowserRouter([
          {
            element: <ContextContainer />,
            children: [
              {
                path: "/",
                element: <Index />,
              },
              {
                path: "/profile",
                element: <Profile />,
              },
              {
                path: "/cadastro",
                element: <Cadastro />,
              },
              {
                path: "*",
                element: <NotFound />,
              },
              {
                path: "/relatorios-financeiros",
                element: <RelatoriosFinanceiros />,
              },
              {
                path: "/metas-financeiras",
                element: <MetasFinanceiras />,
              },
            ],
          },
        ])}
      />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
