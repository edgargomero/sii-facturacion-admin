/**
 * Servicio de Autenticacion
 */
import { api, ApiResponse, setAuthToken, clearAuthToken } from "../client";
import type { LoginRequest, LoginResponse } from "../types";

const BASE_PATH = "/api/v1/auth";

export const authService = {
  /**
   * Iniciar sesion
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<LoginResponse>(`${BASE_PATH}/login`, data);

    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
    }

    return response;
  },

  /**
   * Cerrar sesion
   */
  logout() {
    clearAuthToken();
  },

  /**
   * Verificar si esta autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("sii_auth_token");
  },

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("sii_auth_token");
  },
};
