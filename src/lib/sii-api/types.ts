/**
 * Tipos de datos para la API de Facturacion SII
 */

// ===========================================
// EMPRESA
// ===========================================
export interface Empresa {
  id: string;
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  acteco?: string;
  telefono?: string;
  email?: string;
  resolucion_numero: number;
  resolucion_fecha: string;
  ambiente: "CERTIFICACION" | "PRODUCCION";
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmpresaRequest {
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  acteco?: string;
  telefono?: string;
  email?: string;
  resolucion_numero: number;
  resolucion_fecha: string;
  ambiente?: "CERTIFICACION" | "PRODUCCION";
}

// ===========================================
// CERTIFICADO DIGITAL
// ===========================================
export interface Certificado {
  id: string;
  empresa_id: string;
  nombre: string;
  rut_titular: string;
  fecha_vencimiento: string;
  activo: boolean;
  created_at: string;
}

export interface CargarCertificadoRequest {
  empresa_id: string;
  archivo_pfx: string; // Base64
  password: string;
  nombre?: string;
}

// ===========================================
// CAF (Codigo de Autorizacion de Folios)
// ===========================================
export interface CAF {
  id: string;
  empresa_id: string;
  tipo_dte: number;
  rango_desde: number;
  rango_hasta: number;
  folios_disponibles: number;
  fecha_autorizacion: string;
  estado: "ACTIVO" | "AGOTADO" | "VENCIDO";
  created_at: string;
}

export interface CargarCAFRequest {
  empresa_id: string;
  archivo_xml: string; // Contenido XML del CAF
}

export interface SolicitarCAFRequest {
  empresa_id: string;
  tipo_dte: number;
  cantidad_folios: number;
}

// ===========================================
// DTE (Documento Tributario Electronico)
// ===========================================
export type TipoDTE = 33 | 34 | 39 | 41 | 52 | 56 | 61;

export const TIPOS_DTE: Record<TipoDTE, string> = {
  33: "Factura Electronica",
  34: "Factura Exenta",
  39: "Boleta Electronica",
  41: "Boleta Exenta",
  52: "Guia de Despacho",
  56: "Nota de Debito",
  61: "Nota de Credito",
};

export interface Receptor {
  rut: string;
  razon_social: string;
  giro?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  email?: string;
}

export interface DetalleDTE {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad?: string;
  precio_unitario: number;
  descuento_porcentaje?: number;
  es_exento?: boolean;
}

export interface DTE {
  id: string;
  empresa_id: string;
  tipo_dte: TipoDTE;
  folio: number;
  fecha_emision: string;
  receptor_rut: string;
  receptor_razon_social: string;
  monto_neto: number;
  monto_iva: number;
  monto_exento: number;
  monto_total: number;
  estado: "GENERADO" | "ENVIADO" | "ACEPTADO" | "RECHAZADO";
  track_id?: string;
  xml_content?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerarFacturaRequest {
  empresa_id: string;
  receptor: Receptor;
  detalles: DetalleDTE[];
  fecha_emision?: string;
  observacion?: string;
}

export interface GenerarBoletaRequest {
  empresa_id: string;
  detalles: DetalleDTE[];
  fecha_emision?: string;
}

export interface GenerarNotaCreditoRequest {
  empresa_id: string;
  receptor: Receptor;
  detalles: DetalleDTE[];
  tipo_dte_ref: TipoDTE;
  folio_ref: number;
  fecha_ref: string;
  codigo_ref: 1 | 2 | 3; // 1: Anula, 2: Corrige texto, 3: Corrige monto
  razon_ref: string;
}

// ===========================================
// RCOF (Reporte de Consumo de Folios)
// ===========================================
export interface RCOF {
  id: string;
  empresa_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  secuencia_envio: number;
  estado: "GENERADO" | "ENVIADO" | "ACEPTADO" | "RECHAZADO";
  track_id?: string;
  created_at: string;
}

export interface GenerarRCOFRequest {
  empresa_id: string;
  fecha_inicio: string;
  fecha_fin: string;
}

// ===========================================
// ENVIO SII
// ===========================================
export interface EnvioSII {
  id: string;
  empresa_id: string;
  tipo: "DTE" | "RCOF" | "BOLETA";
  track_id: string;
  estado: "ENVIADO" | "ACEPTADO" | "RECHAZADO" | "REPARO";
  glosa?: string;
  fecha_envio: string;
  fecha_respuesta?: string;
}

export interface ConsultaEstadoResponse {
  track_id: string;
  estado: string;
  glosa: string;
  fecha_recepcion?: string;
  cantidad_dte?: number;
  cantidad_aceptados?: number;
  cantidad_rechazados?: number;
}

// ===========================================
// AUTH
// ===========================================
export interface LoginRequest {
  empresa_id: string;
  api_key: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
}

// ===========================================
// ESTADISTICAS DASHBOARD
// ===========================================
export interface DashboardStats {
  total_empresas: number;
  total_dtes_mes: number;
  total_facturado_mes: number;
  cafs_por_vencer: number;
  dtes_por_tipo: Record<TipoDTE, number>;
  facturacion_ultimos_meses: Array<{
    mes: string;
    total: number;
  }>;
}
