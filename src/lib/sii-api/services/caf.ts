/**
 * Servicio de CAFs (Codigo de Autorizacion de Folios)
 */
import { api, ApiResponse } from "../client";
import type { CAF, SolicitarCAFRequest, TipoDTE } from "../types";

const BASE_PATH = "/api/v1/caf";

export interface CAFResumen {
  empresa_id: string;
  tipo_dte: TipoDTE;
  nombre_tipo: string;
  folios_totales: number;
  folios_usados: number;
  folios_disponibles: number;
  porcentaje_uso: number;
  caf_activo?: CAF;
}

export const cafService = {
  /**
   * Listar CAFs
   */
  async listar(empresaId?: string): Promise<ApiResponse<CAF[]>> {
    const query = empresaId ? `?empresa_id=${empresaId}` : "";
    return api.get<CAF[]>(`${BASE_PATH}${query}`);
  },

  /**
   * Obtener un CAF por ID
   */
  async obtener(id: string): Promise<ApiResponse<CAF>> {
    return api.get<CAF>(`${BASE_PATH}/${id}`);
  },

  /**
   * Obtener resumen de folios por tipo DTE
   */
  async obtenerResumen(empresaId: string): Promise<ApiResponse<CAFResumen[]>> {
    return api.get<CAFResumen[]>(`${BASE_PATH}/resumen?empresa_id=${empresaId}`);
  },

  /**
   * Cargar un nuevo CAF (archivo XML) usando multipart/form-data
   * @param empresaId ID de la empresa
   * @param tipoDte Tipo de DTE (33, 34, 39, etc.)
   * @param file Archivo XML del CAF
   */
  async cargarMultipart(
    empresaId: string,
    tipoDte: TipoDTE,
    file: File
  ): Promise<ApiResponse<CAF>> {
    const formData = new FormData();
    formData.append("empresa_id", empresaId);
    formData.append("tipo_dte", tipoDte.toString());
    formData.append("file", file);
    return api.postMultipart<CAF>(BASE_PATH, formData);
  },

  /**
   * Solicitar CAF al SII (automatico)
   */
  async solicitar(data: SolicitarCAFRequest): Promise<ApiResponse<CAF>> {
    return api.post<CAF>(`${BASE_PATH}/solicitar`, data);
  },

  /**
   * Descargar XML del CAF
   */
  async descargarXML(id: string): Promise<ApiResponse<{ xml: string }>> {
    return api.get<{ xml: string }>(`${BASE_PATH}/${id}/xml`);
  },
};
