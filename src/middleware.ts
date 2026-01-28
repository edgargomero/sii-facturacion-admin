/**
 * Middleware de Astro para autenticacion y RBAC
 * Protege las rutas /admin/* y valida permisos
 */
import { defineMiddleware } from "astro:middleware";
import { parseSessionCookies, isLocalhostRequest } from "@/lib/auth/cookies";
import { canAccessRoute } from "@/lib/auth/permissions";
import type { SupabaseUser, Perfil } from "@/lib/sii-api/types";

// URL del backend Go
const getBackendUrl = (isLocalhost: boolean) => {
  if (isLocalhost) {
    return "http://localhost:8080";
  }
  return "https://sii-facturacion-api.edgar-gomero.workers.dev";
};

// Rutas publicas que no requieren autenticacion
const PUBLIC_ROUTES = [
  "/login",
  "/api/auth/login",
  "/api/auth/refresh",
  "/",
  "/favicon.svg",
];

// Verifica si la ruta es publica
function isPublicRoute(pathname: string): boolean {
  // Rutas estaticas
  if (pathname.startsWith("/_astro/") || pathname.startsWith("/_image")) {
    return true;
  }

  // Rutas publicas definidas
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname === `${route}/`
  );
}

interface AuthMeResponse {
  success: boolean;
  data?: {
    user: SupabaseUser;
    perfil: Perfil;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, locals, url } = context;
  const pathname = url.pathname;

  // Inicializar locals
  locals.isAuthenticated = false;
  locals.user = undefined;
  locals.perfil = undefined;

  // Rutas publicas, continuar sin verificacion
  if (isPublicRoute(pathname)) {
    return next();
  }

  // Solo proteger rutas /admin/*
  if (!pathname.startsWith("/admin")) {
    return next();
  }

  // Obtener token de las cookies
  const cookieHeader = request.headers.get("Cookie");
  const { accessToken } = parseSessionCookies(cookieHeader);

  // Si no hay token, redirigir a login
  if (!accessToken) {
    const returnUrl = encodeURIComponent(pathname);
    return redirect(`/login?returnUrl=${returnUrl}`);
  }

  // Validar token con el backend
  const isLocalhost = isLocalhostRequest(request);
  const backendUrl = getBackendUrl(isLocalhost);

  try {
    const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // Token invalido o expirado, redirigir a login
      const returnUrl = encodeURIComponent(pathname);
      return redirect(`/login?returnUrl=${returnUrl}&error=session_expired`);
    }

    const data: AuthMeResponse = await response.json();

    if (!data.success || !data.data) {
      const returnUrl = encodeURIComponent(pathname);
      return redirect(`/login?returnUrl=${returnUrl}&error=invalid_session`);
    }

    // Guardar datos del usuario en locals
    const { user, perfil } = data.data;
    locals.isAuthenticated = true;
    locals.user = user;
    locals.perfil = perfil;

    // Verificar permisos RBAC
    if (!canAccessRoute(perfil.rol, pathname)) {
      // Usuario no tiene permisos para esta ruta
      // Redirigir a dashboard con mensaje de error
      return redirect("/admin?error=access_denied");
    }

    // Usuario autenticado y autorizado, continuar
    return next();
  } catch (error) {
    console.error("Middleware auth error:", error);
    // Error de red o servidor, redirigir a login
    const returnUrl = encodeURIComponent(pathname);
    return redirect(`/login?returnUrl=${returnUrl}&error=server_error`);
  }
});
