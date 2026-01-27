/**
 * Servicio de Certificados Digitales
 */
import { api, ApiResponse } from "../client";
import type { Certificado, CargarCertificadoRequest } from "../types";

const BASE_PATH = "/api/v1/certificados";

export const certificadosService = {
  /**
   * Cargar un certificado digital (.pfx) para una empresa
   */
  async cargar(data: CargarCertificadoRequest): Promise<ApiResponse<Certificado>> {
    return api.post<Certificado>(BASE_PATH, data);
  },

  /**
   * Obtener el certificado activo de una empresa
   */
  async obtener(empresaId: string): Promise<ApiResponse<Certificado>> {
    return api.get<Certificado>(`${BASE_PATH}?empresa_id=${empresaId}`);
  },

  /**
   * Obtener certificado por ID
   */
  async obtenerPorId(id: string): Promise<ApiResponse<Certificado>> {
    return api.get<Certificado>(`${BASE_PATH}/${id}`);
  },

  /**
   * Eliminar un certificado
   */
  async eliminar(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${BASE_PATH}/${id}`);
  },

  /**
   * Validar un certificado (verificar si es valido y no esta vencido)
   */
  async validar(empresaId: string): Promise<ApiResponse<{
    valido: boolean;
    dias_restantes: number;
    mensaje: string;
  }>> {
    return api.get(`${BASE_PATH}/validar?empresa_id=${empresaId}`);
  },
};
