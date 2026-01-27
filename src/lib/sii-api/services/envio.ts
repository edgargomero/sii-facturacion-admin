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
};
