/**
 * Sistema de permisos RBAC (Role-Based Access Control)
 */

export type Role = "admin" | "usuario";

export type Permission =
  | "empresas:read"
  | "empresas:read:own"
  | "empresas:write"
  | "dtes:read"
  | "dtes:read:own"
  | "dtes:write"
  | "dtes:write:own"
  | "cafs:read"
  | "cafs:read:own"
  | "cafs:write"
  | "certs:read"
  | "certs:write"
  | "users:manage";

/**
 * Permisos por rol
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "empresas:read",
    "empresas:write",
    "dtes:read",
    "dtes:write",
    "cafs:read",
    "cafs:write",
    "certs:read",
    "certs:write",
    "users:manage",
  ],
  usuario: [
    "empresas:read:own",
    "dtes:read:own",
    "dtes:write:own",
    "cafs:read:own",
  ],
};

/**
 * Rutas y permisos requeridos
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  // Empresas
  "/admin/empresas": ["empresas:read", "empresas:read:own"],
  "/admin/empresas/nueva": ["empresas:write"],
  // DTEs
  "/admin/dte": ["dtes:read", "dtes:read:own"],
  "/admin/dte/nueva-factura": ["dtes:write", "dtes:write:own"],
  "/admin/dte/nueva-boleta": ["dtes:write", "dtes:write:own"],
  // CAFs
  "/admin/caf": ["cafs:read", "cafs:read:own"],
  "/admin/caf/cargar": ["cafs:write"],
  "/admin/caf/solicitar": ["cafs:write"],
  // Certificados
  "/admin/certificados": ["certs:read"],
  "/admin/certificados/cargar": ["certs:write"],
  // RCOF
  "/admin/rcof": ["dtes:read", "dtes:read:own"],
  // Envios
  "/admin/envios": ["dtes:read", "dtes:read:own"],
  // Usuarios (solo admin)
  "/admin/usuarios": ["users:manage"],
};

/**
 * Links de navegacion con permisos requeridos
 */
export const NAV_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: "LayoutDashboard",
    permissions: [] as Permission[], // Todos pueden ver el dashboard
  },
  {
    href: "/admin/empresas",
    label: "Empresas",
    icon: "Building2",
    permissions: ["empresas:read", "empresas:read:own"] as Permission[],
  },
  {
    href: "/admin/dte",
    label: "DTEs",
    icon: "FileText",
    permissions: ["dtes:read", "dtes:read:own"] as Permission[],
  },
  {
    href: "/admin/caf",
    label: "Folios (CAF)",
    icon: "FolderKey",
    permissions: ["cafs:read", "cafs:read:own"] as Permission[],
  },
  {
    href: "/admin/rcof",
    label: "RCOF",
    icon: "FileBarChart",
    permissions: ["dtes:read", "dtes:read:own"] as Permission[],
  },
  {
    href: "/admin/envios",
    label: "Envios SII",
    icon: "Send",
    permissions: ["dtes:read", "dtes:read:own"] as Permission[],
  },
];

/**
 * Verifica si un rol tiene un permiso especifico
 */
export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Verifica si un rol tiene al menos uno de los permisos requeridos
 */
export function hasAnyPermission(
  role: Role | undefined,
  permissions: Permission[]
): boolean {
  if (!role) return false;
  if (permissions.length === 0) return true; // Sin restricciones
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Verifica si un rol puede acceder a una ruta especifica
 */
export function canAccessRoute(role: Role | undefined, path: string): boolean {
  if (!role) return false;

  // Admin tiene acceso a todo
  if (role === "admin") return true;

  // Dashboard es accesible para todos los autenticados
  if (path === "/admin" || path === "/admin/") return true;

  // Buscar la ruta mas especifica que coincida
  const matchingRoutes = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => path.startsWith(route))
    .sort((a, b) => b.length - a.length); // Mas especifica primero

  if (matchingRoutes.length === 0) {
    // Ruta no definida, denegar por defecto
    return false;
  }

  const routePermissions = ROUTE_PERMISSIONS[matchingRoutes[0]];
  return hasAnyPermission(role, routePermissions);
}

/**
 * Obtiene los links de navegacion visibles para un rol
 */
export function getVisibleNavLinks(role: Role | undefined) {
  if (!role) return [];
  return NAV_LINKS.filter((link) => hasAnyPermission(role, link.permissions));
}

/**
 * Verifica si el usuario es admin
 */
export function isAdmin(role: Role | undefined): boolean {
  return role === "admin";
}

/**
 * Verifica si el usuario puede ver todas las empresas o solo la suya
 */
export function canViewAllEmpresas(role: Role | undefined): boolean {
  return hasPermission(role, "empresas:read");
}

/**
 * Verifica si el usuario puede crear/editar empresas
 */
export function canManageEmpresas(role: Role | undefined): boolean {
  return hasPermission(role, "empresas:write");
}

/**
 * Verifica si el usuario puede cargar CAFs
 */
export function canUploadCAFs(role: Role | undefined): boolean {
  return hasPermission(role, "cafs:write");
}

/**
 * Verifica si el usuario puede gestionar certificados
 */
export function canManageCertificados(role: Role | undefined): boolean {
  return hasPermission(role, "certs:write");
}
