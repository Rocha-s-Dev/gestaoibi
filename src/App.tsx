
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
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Create the router outside of the component
const router = createBrowserRouter([
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
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
