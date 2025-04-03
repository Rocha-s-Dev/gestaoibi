
import React from "react";
import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// We don't need to create another QueryClient since we already have one in main.tsx
export function ContextContainer() {
  return <Outlet />;
}
