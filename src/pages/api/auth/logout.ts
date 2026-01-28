/**
 * API Endpoint: POST /api/auth/logout
 * Cerrar sesion y limpiar cookies
 */
import type { APIRoute } from "astro";
import {
  clearSessionCookies,
  parseSessionCookies,
  isLocalhostRequest,
} from "@/lib/auth/cookies";

// URL del backend Go
const getBackendUrl = (isLocalhost: boolean) => {
  if (isLocalhost) {
    return "http://localhost:8080";
  }
  return (
    import.meta.env.API_URL ||
    "https://sii-facturacion-api.edgar-gomero.workers.dev"
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const isLocalhost = isLocalhostRequest(request);
    const backendUrl = getBackendUrl(isLocalhost);

    // Obtener token de las cookies
    const cookieHeader = request.headers.get("Cookie");
    const { accessToken } = parseSessionCookies(cookieHeader);

    // Llamar al backend Go para invalidar el token (si existe)
    if (accessToken) {
      try {
        await fetch(`${backendUrl}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch {
        // Ignorar errores del backend, igual limpiamos las cookies
      }
    }

    // Limpiar cookies
    const clearCookies = clearSessionCookies(isLocalhost);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sesion cerrada correctamente",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": clearCookies.join(", "),
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);

    // Aun en caso de error, intentamos limpiar las cookies
    const isLocalhost = isLocalhostRequest(request);
    const clearCookies = clearSessionCookies(isLocalhost);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sesion cerrada",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": clearCookies.join(", "),
        },
      }
    );
  }
};
