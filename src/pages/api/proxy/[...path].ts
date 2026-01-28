/**
 * Proxy API - Agrega autenticacion desde cookies httpOnly
 * Todas las llamadas al backend pasan por aqui
 */
import type { APIRoute } from "astro";
import { parseSessionCookies, isLocalhostRequest } from "@/lib/auth/cookies";

const API_URL_PROD = "https://sii-facturacion-api.edgar-gomero.workers.dev";
const API_URL_DEV = "http://localhost:8080";

const getBackendUrl = (isLocalhost: boolean) => {
  if (isLocalhost) {
    return API_URL_DEV;
  }
  return import.meta.env.API_URL || API_URL_PROD;
};

export const ALL: APIRoute = async ({ request, params }) => {
  const path = params.path || "";
  const isLocalhost = isLocalhostRequest(request);
  const backendUrl = getBackendUrl(isLocalhost);

  // Obtener token de la cookie httpOnly
  const cookieHeader = request.headers.get("Cookie");
  const { accessToken } = parseSessionCookies(cookieHeader);

  // Construir headers para el backend
  const headers = new Headers();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Copiar Content-Type del request original
  const contentType = request.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  } else {
    headers.set("Content-Type", "application/json");
  }

  // Hacer request al backend
  const backendResponse = await fetch(`${backendUrl}/api/v1/${path}`, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD"
      ? await request.text()
      : undefined,
  });

  // Retornar respuesta del backend
  const responseBody = await backendResponse.text();

  return new Response(responseBody, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("Content-Type") || "application/json",
    },
  });
};
