/**
 * Servicio de Empresas
 */
import { api, ApiResponse } from "../client";
import type { Empresa, CreateEmpresaRequest } from "../types";

const BASE_PATH = "/api/v1/empresas";

export const empresasService = {
  /**
   * Listar todas las empresas
   */
  async listar(): Promise<ApiResponse<Empresa[]>> {
    return api.get<Empresa[]>(BASE_PATH);
  },

  /**
   * Obtener una empresa por ID
   */
  async obtener(id: string): Promise<ApiResponse<Empresa>> {
    return api.get<Empresa>(`${BASE_PATH}/${id}`);
  },

  /**
   * Crear una nueva empresa
   */
  async crear(data: CreateEmpresaRequest): Promise<ApiResponse<Empresa>> {
    return api.post<Empresa>(BASE_PATH, data);
  },

  /**
   * Actualizar una empresa
   */
  async actualizar(
    id: string,
    data: Partial<CreateEmpresaRequest>
  ): Promise<ApiResponse<Empresa>> {
    return api.put<Empresa>(`${BASE_PATH}/${id}`, data);
  },

  /**
   * Eliminar una empresa
   */
  async eliminar(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${BASE_PATH}/${id}`);
  },
};
