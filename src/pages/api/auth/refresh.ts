/**
 * API Endpoint: POST /api/auth/refresh
 * Refrescar token de acceso usando refresh token
 */
import type { APIRoute } from "astro";
import {
  createSessionCookies,
  parseSessionCookies,
  clearSessionCookies,
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

    // Obtener refresh token de las cookies
    const cookieHeader = request.headers.get("Cookie");
    const { refreshToken } = parseSessionCookies(cookieHeader);

    if (!refreshToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "No hay token de refresco",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Llamar al backend Go
    const response = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Token de refresco invalido, limpiar cookies
      const clearCookies = clearSessionCookies(isLocalhost);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "INVALID_REFRESH_TOKEN",
            message: "Sesion expirada, por favor inicie sesion nuevamente",
          },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": clearCookies.join(", "),
          },
        }
      );
    }

    // Extraer nuevos tokens
    const { access_token, refresh_token } = data.data;

    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "AUTH_ERROR",
            message: "Respuesta de refresco invalida",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Crear nuevas cookies
    const cookies = createSessionCookies(access_token, refresh_token, isLocalhost);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Token refrescado correctamente",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookies.join(", "),
        },
      }
    );
  } catch (error) {
    console.error("Refresh error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Error interno del servidor",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
