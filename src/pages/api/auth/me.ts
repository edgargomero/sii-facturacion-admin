/**
 * API Endpoint: GET /api/auth/me
 * Obtener informacion del usuario autenticado
 */
import type { APIRoute } from "astro";
import { parseSessionCookies, isLocalhostRequest } from "@/lib/auth/cookies";

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

export const GET: APIRoute = async ({ request }) => {
  try {
    const isLocalhost = isLocalhostRequest(request);
    const backendUrl = getBackendUrl(isLocalhost);

    // Obtener token de las cookies
    const cookieHeader = request.headers.get("Cookie");
    const { accessToken } = parseSessionCookies(cookieHeader);

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "No autenticado",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Llamar al backend Go
    const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Me error:", error);
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
