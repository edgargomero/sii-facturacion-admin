/**
 * Servicio de Autenticacion
 * Usa el nuevo sistema de cookies httpOnly
 */
import { api, ApiResponse } from "../client";
import type { LoginRequest, LoginResponse, AuthUser } from "../types";

const BASE_PATH = "/api/v1/auth";

export const authService = {
  /**
   * Iniciar sesion
   * Nota: El endpoint /api/auth/login del frontend maneja las cookies
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // Llamar al endpoint del frontend que hace proxy al backend
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // Importante para cookies
    });

    return response.json();
  },

  /**
   * Cerrar sesion
   */
  async logout(): Promise<void> {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  },

  /**
   * Obtener informacion del usuario actual
   */
  async me(): Promise<ApiResponse<AuthUser>> {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });
    return response.json();
  },

  /**
   * Refrescar token
   */
  async refresh(): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return response.json();
  },

  /**
   * Verificar si esta autenticado (cliente)
   * Nota: Esto hace una llamada al servidor para verificar
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.me();
      return response.success && !!response.data;
    } catch {
      return false;
    }
  },

  /**
   * Login directo al backend (para SSR)
   * Solo usar en el servidor
   */
  async loginBackend(
    email: string,
    password: string,
    backendUrl: string
  ): Promise<ApiResponse<LoginResponse>> {
    return api.post<LoginResponse>(`${BASE_PATH}/login`, { email, password });
  },

  /**
   * Obtener usuario del backend (para SSR)
   * Solo usar en el servidor
   */
  async meBackend(
    accessToken: string,
    backendUrl: string
  ): Promise<ApiResponse<AuthUser>> {
    const response = await fetch(`${backendUrl}${BASE_PATH}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.json();
  },
};
