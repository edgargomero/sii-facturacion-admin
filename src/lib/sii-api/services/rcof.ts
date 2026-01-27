/**
 * Servicio de RCOF (Reporte de Consumo de Folios)
 */
import { api, ApiResponse } from "../client";
import type { RCOF, GenerarRCOFRequest } from "../types";

const BASE_PATH = "/api/v1/rcof";

export const rcofService = {
  /**
   * Listar RCOFs
   */
  async listar(empresaId?: string): Promise<ApiResponse<RCOF[]>> {
    const query = empresaId ? `?empresa_id=${empresaId}` : "";
    return api.get<RCOF[]>(`${BASE_PATH}${query}`);
  },

  /**
   * Obtener un RCOF por ID
   */
  async obtener(id: string): Promise<ApiResponse<RCOF>> {
    return api.get<RCOF>(`${BASE_PATH}/${id}`);
  },

  /**
   * Generar RCOF para un periodo
   */
  async generar(data: GenerarRCOFRequest): Promise<ApiResponse<RCOF>> {
    return api.post<RCOF>(`${BASE_PATH}/generar`, data);
  },

  /**
   * Enviar RCOF al SII
   */
  async enviar(id: string): Promise<ApiResponse<RCOF>> {
    return api.post<RCOF>(`${BASE_PATH}/${id}/enviar`, {});
  },

  /**
   * Descargar XML del RCOF
   */
  async descargarXML(id: string): Promise<ApiResponse<{ xml: string }>> {
    return api.get<{ xml: string }>(`${BASE_PATH}/${id}/xml`);
  },
};
