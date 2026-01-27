/**
 * Servicio de Envios al SII
 */
import { api, ApiResponse } from "../client";
import type { EnvioSII, ConsultaEstadoResponse } from "../types";

const BASE_PATH = "/api/v1/envio";

export interface EnviarDTEsRequest {
  empresa_id: string;
  dte_ids: string[];
}

export const envioService = {
  /**
   * Listar envios
   */
  async listar(empresaId?: string): Promise<ApiResponse<EnvioSII[]>> {
    const query = empresaId ? `?empresa_id=${empresaId}` : "";
    return api.get<EnvioSII[]>(`${BASE_PATH}${query}`);
  },

  /**
   * Enviar DTEs al SII
   */
  async enviar(data: EnviarDTEsRequest): Promise<ApiResponse<EnvioSII>> {
    return api.post<EnvioSII>(BASE_PATH, data);
  },

  /**
   * Consultar estado de un envio por Track ID
   */
  async consultarEstado(
    trackId: string
  ): Promise<ApiResponse<ConsultaEstadoResponse>> {
    return api.get<ConsultaEstadoResponse>(`${BASE_PATH}/${trackId}`);
  },

  /**
   * Actualizar estado de un envio (re-consultar al SII)
   */
  async actualizarEstado(id: string): Promise<ApiResponse<EnvioSII>> {
    return api.post<EnvioSII>(`${BASE_PATH}/${id}/actualizar`, {});
  },
};
