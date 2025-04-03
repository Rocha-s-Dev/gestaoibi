
import React from "react";
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

export function ContextContainer() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
