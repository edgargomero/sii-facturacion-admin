/**
 * Exports de autenticacion
 */

// Cookies
export {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  createSessionCookies,
  parseCookies,
  parseSessionCookies,
  clearSessionCookies,
  isLocalhostRequest,
} from "./cookies";

// Permissions (RBAC)
export {
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS,
  NAV_LINKS,
  hasPermission,
  hasAnyPermission,
  canAccessRoute,
  getVisibleNavLinks,
  isAdmin,
  canViewAllEmpresas,
  canManageEmpresas,
  canUploadCAFs,
  canManageCertificados,
  type Role,
  type Permission,
} from "./permissions";

// Context (solo para cliente)
export {
  AuthProvider,
  useAuth,
  useRole,
  useIsAdmin,
  useEmpresaId,
} from "./auth-context";
