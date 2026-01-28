/**
 * Cliente HTTP para la API de Facturacion SII
 *
 * Este cliente maneja todas las comunicaciones con el backend Go
 * a traves de un proxy que agrega autenticacion desde cookies httpOnly
 */

// Usar proxy del frontend para todas las llamadas
// El proxy lee el token de la cookie httpOnly y lo agrega al request
const getApiUrl = () => "/api/proxy";

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
 * Realiza una peticion a la API SII a traves del proxy
 * El proxy agrega automaticamente el token de autenticacion desde cookies httpOnly
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {} } = options;

  // El endpoint viene como /api/v1/empresas, remover /api/v1
  const path = endpoint.replace(/^\/api\/v1\//, "");
  const url = `${getApiUrl()}/${path}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // NO necesitamos agregar Authorization - el proxy lo hace

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", // Importante para enviar cookies al proxy
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
 * Realiza una peticion multipart/form-data a la API SII
 * Usado para subir archivos (CAF, certificados)
 */
export async function apiRequestMultipart<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  // El endpoint viene como /api/v1/empresas, remover /api/v1
  const path = endpoint.replace(/^\/api\/v1\//, "");
  const url = `${getApiUrl()}/${path}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      // NO incluir Content-Type - el browser lo agrega con boundary automaticamente
      credentials: "include", // Importante para enviar cookies al proxy
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
    console.error("API Multipart Request Error:", error);
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

  postMultipart: <T>(endpoint: string, formData: FormData) =>
    apiRequestMultipart<T>(endpoint, formData),
};
