/**
 * Servicio de Envios al SII
 */
import { api, ApiResponse } from "../client";
import type { EnvioSIIResponse, EstadoEnvioResponse } from "../types";

const BASE_PATH = "/api/v1/envio";

export interface EnviarDTEsRequest {
  empresa_id: string;
  dte_ids: string[];
}

export const envioService = {
  /**
   * Listar envios
   */
  async listar(empresaId?: string): Promise<ApiResponse<EnvioSIIResponse[]>> {
    const query = empresaId ? `?empresa_id=${empresaId}` : "";
    return api.get<EnvioSIIResponse[]>(`${BASE_PATH}${query}`);
  },

  /**
   * Enviar DTEs al SII
   */
  async enviar(data: EnviarDTEsRequest): Promise<ApiResponse<EnvioSIIResponse>> {
    return api.post<EnvioSIIResponse>(BASE_PATH, data);
  },

  /**
   * Consultar estado de un envio por Track ID
   */
  async consultarEstado(
    trackId: string
  ): Promise<ApiResponse<EstadoEnvioResponse>> {
    return api.get<EstadoEnvioResponse>(`${BASE_PATH}/${trackId}`);
  },

  /**
   * Actualizar estado de un envio (re-consultar al SII)
   */
  async actualizarEstado(id: string): Promise<ApiResponse<EnvioSIIResponse>> {
    return api.post<EnvioSIIResponse>(`${BASE_PATH}/${id}/actualizar`, {});
  },
};
