/**
 * Servicio de Certificados Digitales
 */
import { api, ApiResponse } from "../client";
import type { Certificado } from "../types";

const BASE_PATH = "/api/v1/certificados";

export const certificadosService = {
  /**
   * Cargar un certificado digital (.pfx) usando multipart/form-data
   * @param empresaId ID de la empresa
   * @param password Contrasena del certificado
   * @param file Archivo .pfx o .p12
   */
  async cargarMultipart(
    empresaId: string,
    password: string,
    file: File
  ): Promise<ApiResponse<Certificado>> {
    const formData = new FormData();
    formData.append("empresa_id", empresaId);
    formData.append("password", password);
    formData.append("file", file);
    return api.postMultipart<Certificado>(BASE_PATH, formData);
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
