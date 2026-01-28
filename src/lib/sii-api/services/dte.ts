/**
 * Servicio de DTEs (Documentos Tributarios Electronicos)
 */
import { api, ApiResponse } from "../client";
import type {
  DTE,
  GenerarFacturaRequest,
  GenerarBoletaRequest,
  GenerarNotaCreditoRequest,
  GenerarGuiaDespachoRequest,
  TipoDTE,
} from "../types";

const BASE_PATH = "/api/v1/dte";

export interface ListarDTEsParams {
  empresa_id?: string;
  tipo_dte?: TipoDTE;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

export const dteService = {
  /**
   * Listar DTEs con filtros
   */
  async listar(params?: ListarDTEsParams): Promise<ApiResponse<DTE[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return api.get<DTE[]>(`${BASE_PATH}${query ? `?${query}` : ""}`);
  },

  /**
   * Obtener un DTE por ID
   */
  async obtener(id: string): Promise<ApiResponse<DTE>> {
    return api.get<DTE>(`${BASE_PATH}/${id}`);
  },

  /**
   * Generar Factura Electronica (tipo 33)
   */
  async generarFactura(
    data: GenerarFacturaRequest
  ): Promise<ApiResponse<DTE>> {
    return api.post<DTE>(`${BASE_PATH}/factura`, data);
  },

  /**
   * Generar Factura Exenta (tipo 34)
   */
  async generarFacturaExenta(
    data: GenerarFacturaRequest
  ): Promise<ApiResponse<DTE>> {
    return api.post<DTE>(`${BASE_PATH}/factura-exenta`, data);
  },

  /**
   * Generar Boleta Electronica (tipo 39)
   */
  async generarBoleta(data: GenerarBoletaRequest): Promise<ApiResponse<DTE>> {
    return api.post<DTE>(`${BASE_PATH}/boleta`, data);
  },

  /**
   * Generar Nota de Credito (tipo 61)
   */
  async generarNotaCredito(
    data: GenerarNotaCreditoRequest
  ): Promise<ApiResponse<DTE>> {
    return api.post<DTE>(`${BASE_PATH}/nota-credito`, data);
  },

  /**
   * Generar Nota de Debito (tipo 56)
   */
  async generarNotaDebito(
    data: GenerarNotaCreditoRequest
  ): Promise<ApiResponse<DTE>> {
    return api.post<DTE>(`${BASE_PATH}/nota-debito`, data);
  },

  /**
   * Generar Guia de Despacho (tipo 52)
   */
  async generarGuiaDespacho(
    data: GenerarGuiaDespachoRequest
  ): Promise<ApiResponse<DTE>> {
    return api.post<DTE>(`${BASE_PATH}/guia-despacho`, data);
  },

  /**
   * Descargar XML del DTE
   */
  async descargarXML(id: string): Promise<ApiResponse<{ xml: string }>> {
    return api.get<{ xml: string }>(`${BASE_PATH}/${id}/xml`);
  },

  /**
   * Descargar PDF del DTE
   */
  async descargarPDF(id: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${BASE_PATH}/${id}/pdf`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("sii_auth_token")}`,
        },
      });
      if (response.ok) {
        return response.blob();
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Obtener timbre (TED) del DTE
   */
  async obtenerTimbre(id: string): Promise<ApiResponse<{ timbre: string }>> {
    return api.get<{ timbre: string }>(`${BASE_PATH}/${id}/timbre`);
  },
};
