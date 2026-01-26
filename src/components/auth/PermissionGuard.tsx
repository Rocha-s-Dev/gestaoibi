import { ReactNode } from "react";
import { useUserPermissions } from "@/hooks/usePapeisUsuario";
import { useCheckPermission } from "@/hooks/usePermissoes";
import { useQuery } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type PapelSistemico = Database["public"]["Enums"]["papel_sistemico"];
type TipoPermissao = Database["public"]["Enums"]["tipo_permissao"];

interface PermissionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: PapelSistemico;
  requiredRoles?: PapelSistemico[];
  requiredModule?: string;
  requiredAction?: TipoPermissao;
  secretariaId?: string;
  requireAny?: boolean;
}

export function PermissionGuard({
  children,
  fallback = null,
  requiredRole,
  requiredRoles,
  requiredModule,
  requiredAction,
  secretariaId,
  requireAny = false,
}: PermissionGuardProps) {
  const { hasRole, isAdmin, hasSecretariaAccess, isLoading: rolesLoading } = useUserPermissions();
  const { checkPermission, currentUserId } = useCheckPermission();

  const { data: hasModulePermission, isLoading: permissionLoading } = useQuery({
    queryKey: ["permission_check", currentUserId, requiredModule, requiredAction],
    queryFn: async () => {
      if (!requiredModule || !requiredAction) return true;
      return await checkPermission(requiredModule, requiredAction);
    },
    enabled: !!currentUserId && !!requiredModule && !!requiredAction,
  });

  const isLoading = rolesLoading || permissionLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Admin sempre tem acesso
  if (isAdmin()) {
    return <>{children}</>;
  }

  // Verificar role específico
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Verificar múltiplos roles
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some(role => hasRole(role));
    const hasAllRoles = requiredRoles.every(role => hasRole(role));

    if (requireAny && !hasAnyRole) {
      return <>{fallback}</>;
    }

    if (!requireAny && !hasAllRoles) {
      return <>{fallback}</>;
    }
  }

  // Verificar acesso à secretaria
  if (secretariaId && !hasSecretariaAccess(secretariaId)) {
    return <>{fallback}</>;
  }

  // Verificar permissão de módulo
  if (requiredModule && requiredAction && !hasModulePermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface CanAccessProps {
  children: (canAccess: boolean, isLoading: boolean) => ReactNode;
  requiredRole?: PapelSistemico;
  requiredRoles?: PapelSistemico[];
  requiredModule?: string;
  requiredAction?: TipoPermissao;
  secretariaId?: string;
  requireAny?: boolean;
}

export function CanAccess({
  children,
  requiredRole,
  requiredRoles,
  requiredModule,
  requiredAction,
  secretariaId,
  requireAny = false,
}: CanAccessProps) {
  const { hasRole, isAdmin, hasSecretariaAccess, isLoading: rolesLoading } = useUserPermissions();
  const { checkPermission, currentUserId } = useCheckPermission();

  const { data: hasModulePermission, isLoading: permissionLoading } = useQuery({
    queryKey: ["permission_check_can", currentUserId, requiredModule, requiredAction],
    queryFn: async () => {
      if (!requiredModule || !requiredAction) return true;
      return await checkPermission(requiredModule, requiredAction);
    },
    enabled: !!currentUserId && !!requiredModule && !!requiredAction,
  });

  const isLoading = rolesLoading || permissionLoading;

  if (isLoading) {
    return <>{children(false, true)}</>;
  }

  // Admin sempre tem acesso
  if (isAdmin()) {
    return <>{children(true, false)}</>;
  }

  let canAccess = true;

  // Verificar role específico
  if (requiredRole && !hasRole(requiredRole)) {
    canAccess = false;
  }

  // Verificar múltiplos roles
  if (canAccess && requiredRoles && requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some(role => hasRole(role));
    const hasAllRoles = requiredRoles.every(role => hasRole(role));

    if (requireAny && !hasAnyRole) {
      canAccess = false;
    }

    if (!requireAny && !hasAllRoles) {
      canAccess = false;
    }
  }

  // Verificar acesso à secretaria
  if (canAccess && secretariaId && !hasSecretariaAccess(secretariaId)) {
    canAccess = false;
  }

  // Verificar permissão de módulo
  if (canAccess && requiredModule && requiredAction && !hasModulePermission) {
    canAccess = false;
  }

  return <>{children(canAccess, false)}</>;
}
