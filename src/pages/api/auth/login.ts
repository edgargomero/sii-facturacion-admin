/**
 * API Endpoint: POST /api/auth/login
 * Proxy para autenticacion con backend Go + Supabase Auth
 */
import type { APIRoute } from "astro";
import {
  createSessionCookies,
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
    const body = await request.json();
    const { email, password } = body;

    // Validacion basica
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email y password son requeridos",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const isLocalhost = isLocalhostRequest(request);
    const backendUrl = getBackendUrl(isLocalhost);

    // Llamar al backend Go
    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extraer tokens de la respuesta
    const { access_token, refresh_token, user, perfil } = data.data;

    if (!access_token || !refresh_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "AUTH_ERROR",
            message: "Respuesta de autenticacion invalida",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Crear cookies httpOnly
    const cookies = createSessionCookies(access_token, refresh_token, isLocalhost);

    // Retornar respuesta con cookies
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user,
          perfil,
        },
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
    console.error("Login error:", error);
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
