/**
 * Cliente HTTP para la API de Facturacion SII
 *
 * Este cliente maneja todas las comunicaciones con el backend Go
 */

// URL base de la API (se configura en wrangler.toml o .env)
const getApiUrl = () => {
  if (typeof window !== "undefined") {
    // Cliente: usar variable publica
    return import.meta.env.PUBLIC_API_URL || "http://localhost:8080";
  }
  // Servidor: usar variable de entorno
  return process.env.API_URL || "http://localhost:8080";
};

// Tipos de respuesta de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Opciones de request
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

// Almacenamiento del token (en memoria para SSR, localStorage para cliente)
let serverToken: string | null = null;

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("sii_auth_token", token);
  } else {
    serverToken = token;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("sii_auth_token");
  }
  return serverToken;
};

export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("sii_auth_token");
  } else {
    serverToken = null;
  }
};

/**
 * Realiza una peticion a la API SII
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, token } = options;

  const authToken = token || getAuthToken();
  const url = `${getApiUrl()}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (authToken) {
    requestHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: "HTTP_ERROR",
          message: `Error ${response.status}: ${response.statusText}`,
        },
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error("API Request Error:", error);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Error de conexion",
      },
    };
  }
}

/**
 * Helpers para metodos HTTP comunes
 */
export const api = {
  get: <T>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body: unknown, token?: string) =>
    apiRequest<T>(endpoint, { method: "POST", body, token }),

  put: <T>(endpoint: string, body: unknown, token?: string) =>
    apiRequest<T>(endpoint, { method: "PUT", body, token }),

  patch: <T>(endpoint: string, body: unknown, token?: string) =>
    apiRequest<T>(endpoint, { method: "PATCH", body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: "DELETE", token }),
};
