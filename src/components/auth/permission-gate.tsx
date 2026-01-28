/**
 * Componente para mostrar/ocultar contenido basado en permisos
 */
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { hasPermission, hasAnyPermission, type Permission } from "@/lib/auth/permissions";

interface PermissionGateProps {
  /** Permiso requerido (se debe tener este permiso exacto) */
  permission?: Permission;
  /** Lista de permisos (se debe tener al menos uno) */
  permissions?: Permission[];
  /** Contenido a mostrar si tiene permisos */
  children: ReactNode;
  /** Contenido alternativo si no tiene permisos */
  fallback?: ReactNode;
}

/**
 * Muestra contenido solo si el usuario tiene los permisos requeridos
 *
 * @example
 * // Permiso unico
 * <PermissionGate permission="empresas:write">
 *   <Button>Nueva Empresa</Button>
 * </PermissionGate>
 *
 * @example
 * // Cualquiera de los permisos
 * <PermissionGate permissions={["empresas:read", "empresas:read:own"]}>
 *   <Link href="/admin/empresas">Ver Empresas</Link>
 * </PermissionGate>
 *
 * @example
 * // Con fallback
 * <PermissionGate permission="cafs:write" fallback={<span>Sin permisos</span>}>
 *   <Button>Cargar CAF</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { role } = useAuth();

  // Si no esta autenticado, no mostrar nada
  if (!role) {
    return fallback;
  }

  // Verificar permiso unico
  if (permission && !hasPermission(role, permission)) {
    return fallback;
  }

  // Verificar lista de permisos (al menos uno)
  if (permissions && permissions.length > 0 && !hasAnyPermission(role, permissions)) {
    return fallback;
  }

  return children;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Shortcut para mostrar contenido solo a admins
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { role } = useAuth();

  if (role !== "admin") {
    return fallback;
  }

  return children;
}

interface UserInfoProps {
  children: (info: {
    role: string | null;
    empresaId: string | null;
    isAdmin: boolean;
  }) => ReactNode;
}

/**
 * Render prop para acceder a info del usuario
 */
export function UserInfo({ children }: UserInfoProps) {
  const { role, empresaId } = useAuth();

  return children({
    role,
    empresaId,
    isAdmin: role === "admin",
  });
}
