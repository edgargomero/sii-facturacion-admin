/**
 * Tipos de datos para la API de Facturacion SII
 * Alineados con los DTOs del backend Go (sii-facturacion-go)
 *
 * IMPORTANTE: Estos tipos deben coincidir exactamente con:
 * - internal/api/dto/requests.go
 * - internal/api/dto/responses.go
 */

// ===========================================
// CONSTANTES SII
// ===========================================

/** Tipos de DTE soportados por el SII */
export type TipoDTE = 33 | 34 | 39 | 41 | 52 | 56 | 61;

/** Nombres de tipos de DTE */
export const TIPOS_DTE: Record<TipoDTE, string> = {
  33: "Factura Electronica",
  34: "Factura Exenta",
  39: "Boleta Electronica",
  41: "Boleta Exenta",
  52: "Guia de Despacho",
  56: "Nota de Debito",
  61: "Nota de Credito",
};

/** Ambientes del SII */
export type SIIAmbiente = "CERTIFICACION" | "PRODUCCION";

/** Estados de DTE */
export type EstadoDTE = "GENERADO" | "ENVIADO" | "ACEPTADO" | "RECHAZADO" | "REPARO" | "ANULADO";

/** Estados de CAF */
export type EstadoCAF = "ACTIVO" | "AGOTADO";

/** Indicadores de traslado para Guia de Despacho */
export const INDICADORES_TRASLADO: Record<number, string> = {
  1: "Operacion constituye venta",
  2: "Ventas por efectuar",
  3: "Consignaciones",
  4: "Entrega gratuita",
  5: "Traslados internos",
  6: "Otros traslados no venta",
  7: "Guia de devolucion",
  8: "Traslado para exportacion (no DUS)",
  9: "Venta para exportacion",
};

/** Codigos de referencia para Notas */
export const CODIGOS_REFERENCIA: Record<number, string> = {
  1: "Anula documento de referencia",
  2: "Corrige texto del documento de referencia",
  3: "Corrige montos del documento de referencia",
};

// ===========================================
// RESPUESTA API GENERICA
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  meta?: {
    pagina: number;
    limite: number;
    total: number;
    total_paginas: number;
  };
}

// ===========================================
// EMPRESA
// ===========================================

/** Respuesta de empresa del backend */
export interface Empresa {
  id: string;
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  acteco: number[];
  telefono?: string;
  email?: string;
  sii_ambiente: SIIAmbiente;
  fch_resol: string;
  nro_resol: number;
  tiene_certificado: boolean;
  cafs_activos: number;
  created_at: string;
}

/** Request para crear empresa - coincide con dto.CrearEmpresaRequest */
export interface CreateEmpresaRequest {
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  acteco: number[];
  telefono?: string;
  email?: string;
  sii_ambiente: SIIAmbiente;
  fch_resol: string;
  nro_resol: number;
}

/** Request para actualizar empresa - coincide con dto.ActualizarEmpresaRequest */
export interface UpdateEmpresaRequest {
  razon_social?: string;
  giro?: string;
  direccion?: string;
  comuna?: string;
  ciudad?: string;
  telefono?: string;
  email?: string;
  sii_ambiente?: SIIAmbiente;
}

// ===========================================
// CERTIFICADO DIGITAL
// ===========================================

/** Respuesta de certificado del backend */
export interface Certificado {
  id: string;
  rut: string;
  nombre: string;
  valido_desde: string;
  valido_hasta: string;
  es_valido: boolean;
  dias_restantes: number;
  created_at: string;
}

/** Request para cargar certificado (multipart) */
export interface CargarCertificadoRequest {
  password: string;
  // archivo PFX se envia como multipart file
}

// ===========================================
// CAF (Codigo de Autorizacion de Folios)
// ===========================================

/** Respuesta de CAF del backend */
export interface CAF {
  id: string;
  tipo_dte: TipoDTE;
  tipo_dte_nombre: string;
  folio_desde: number;
  folio_hasta: number;
  folio_actual: number;
  folios_disponibles: number;
  agotado: boolean;
  fecha_autorizacion: string;
  created_at: string;
}

/** Resumen de CAFs por tipo */
export interface ResumenCAF {
  tipo_dte: TipoDTE;
  tipo_dte_nombre: string;
  total_folios: number;
  folios_usados: number;
  folios_disponibles: number;
  cafs_activos: number;
}

/** Request para cargar CAF (multipart) */
export interface CargarCAFRequest {
  tipo_dte: TipoDTE;
  // archivo XML se envia como multipart file
}

/** Request para solicitar CAF al SII */
export interface SolicitarCAFRequest {
  tipo_dte: TipoDTE;
  cantidad_folios: number;
}

/** Respuesta de solicitud CAF */
export interface SolicitudCAFResponse {
  tipo_dte: TipoDTE;
  tipo_dte_nombre: string;
  folio_desde: number;
  folio_hasta: number;
  cantidad_folios: number;
  fecha_autorizacion: string;
  estado: string;
  mensaje?: string;
}

// ===========================================
// DTE (Documento Tributario Electronico)
// ===========================================

/** Receptor para Factura/Nota - coincide con dto.ReceptorDTO */
export interface Receptor {
  rut: string;
  razon_social: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad?: string;
  correo?: string;
}

/** Receptor para Boleta (opcional) - coincide con dto.ReceptorBoletaDTO */
export interface ReceptorBoleta {
  rut?: string;
  razon_social?: string;
}

/** Detalle de linea - coincide con dto.DetalleDTO */
export interface Detalle {
  codigo?: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad_medida?: string;
  precio_unitario: number;
  descuento_pct?: number;
  es_exento: boolean;
}

/** Detalle simplificado para Boleta - coincide con dto.DetalleBoletaDTO */
export interface DetalleBoleta {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  es_exento: boolean;
}

/** Referencia a documento previo - coincide con dto.ReferenciaDTO */
export interface Referencia {
  tipo_doc_ref: string;
  folio_ref: string;
  fecha_ref: string;
  cod_ref: 1 | 2 | 3;
  razon_ref?: string;
}

/** Respuesta de DTE generado */
export interface DTE {
  id: string;
  tipo_dte: TipoDTE;
  tipo_dte_nombre: string;
  folio: number;
  fecha_emision: string;
  rut_receptor: string;
  razon_social_receptor: string;
  monto_neto: number;
  monto_exento: number;
  monto_iva: number;
  monto_total: number;
  estado: EstadoDTE;
  track_id?: string;
  url_timbre: string;
  url_pdf: string;
  url_xml: string;
  created_at: string;
}

/** DTE con detalles completos */
export interface DTEDetallado extends DTE {
  detalles: DetalleResponse[];
  referencias?: ReferenciaResponse[];
  auditorias?: AuditoriaResponse[];
  xml_content?: string;
}

/** Detalle en respuesta */
export interface DetalleResponse {
  numero_linea: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad_medida?: string;
  precio_unitario: number;
  descuento_pct?: number;
  descuento_monto?: number;
  es_exento: boolean;
  monto_item: number;
}

/** Referencia en respuesta */
export interface ReferenciaResponse {
  tipo_doc_ref: string;
  folio_ref: string;
  fecha_ref: string;
  cod_ref: number;
  razon_ref?: string;
}

/** Auditoria de DTE */
export interface AuditoriaResponse {
  accion: string;
  estado_anterior?: string;
  estado_nuevo: string;
  detalle?: string;
  usuario?: string;
  created_at: string;
}

/** Request para generar Factura - coincide con dto.GenerarFacturaRequest */
export interface GenerarFacturaRequest {
  receptor: Receptor;
  detalles: Detalle[];
  referencias?: Referencia[];
  fecha_emision?: string;
  observacion?: string;
}

/** Request para generar Boleta - coincide con dto.GenerarBoletaRequest */
export interface GenerarBoletaRequest {
  receptor?: ReceptorBoleta;
  detalles: DetalleBoleta[];
  monto_bruto: boolean;
  fecha_emision?: string;
}

/** Request para generar Nota de Credito - coincide con dto.GenerarNotaCreditoRequest */
export interface GenerarNotaCreditoRequest {
  receptor: Receptor;
  detalles: Detalle[];
  referencias: Referencia[];
  fecha_emision?: string;
}

/** Request para generar Guia de Despacho - coincide con dto.GenerarGuiaDespachoRequest */
export interface GenerarGuiaDespachoRequest {
  receptor: Receptor;
  detalles: Detalle[];
  transporte?: Transporte;
  ind_traslado: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  tipo_despacho?: 1 | 2 | 3;
  referencias?: Referencia[];
  fecha_emision?: string;
  observacion?: string;
}

/** Datos de transporte para Guia - coincide con dto.TransporteDTO */
export interface Transporte {
  patente?: string;
  rut_transportista?: string;
  rut_chofer?: string;
  nombre_chofer?: string;
  direccion_destino: string;
  comuna_destino: string;
  ciudad_destino?: string;
}

// ===========================================
// ENVIO SII
// ===========================================

/** Request para enviar DTEs al SII */
export interface EnviarDTERequest {
  dte_ids: string[];
}

/** Respuesta de envio al SII */
export interface EnvioSIIResponse {
  track_id: string;
  estado: string;
  glosa?: string;
  dtes_enviados: number;
  fecha_envio: string;
}

/** Estado de envio consultado */
export interface EstadoEnvioResponse {
  track_id: string;
  estado: string;
  glosa_estado: string;
  fecha_recepcion?: string;
  cantidad_dte: number;
  cantidad_aceptados: number;
  cantidad_rechazados: number;
  cantidad_reparos: number;
}

// ===========================================
// RCOF (Reporte de Consumo de Folios)
// ===========================================

/** Request para generar RCOF - coincide con dto.GenerarRCOFRequest */
export interface GenerarRCOFRequest {
  fecha_inicio: string;
  fecha_fin: string;
  secuencia_envio: number;
}

/** Respuesta de RCOF generado */
export interface RCOF {
  id: string;
  fecha_inicio: string;
  fecha_fin: string;
  secuencia_envio: number;
  estado: string;
  track_id?: string;
  resumenes: ResumenRCOF[];
  created_at: string;
}

/** Resumen por tipo de DTE en RCOF */
export interface ResumenRCOF {
  tipo_dte: TipoDTE;
  tipo_dte_nombre: string;
  folios_emitidos: number;
  folios_anulados: number;
  folios_utilizados: number;
  rango_inicial?: number;
  rango_final?: number;
  monto_neto: number;
  monto_exento: number;
  monto_iva: number;
  monto_total: number;
}

// ===========================================
// BHE (Boleta de Honorarios Electronica)
// ===========================================

/** Request para emitir BHE - coincide con dto.EmitirBHERequest */
export interface EmitirBHERequest {
  rut_emisor: string;
  nombre_emisor: string;
  rut_receptor: string;
  razon_social_receptor: string;
  direccion_receptor: string;
  comuna_receptor: string;
  descripcion: string;
  monto_bruto: number;
  fecha_emision?: string;
  fecha_pago?: string;
}

/** Request para anular BHE */
export interface AnularBHERequest {
  causa: 1 | 2 | 3;
  motivo?: string;
}

/** Respuesta de BHE */
export interface BHE {
  id: string;
  folio: number;
  fecha_emision: string;
  rut_emisor: string;
  nombre_emisor: string;
  rut_receptor: string;
  razon_social_receptor: string;
  descripcion: string;
  monto_bruto: number;
  tasa_retencion: number;
  monto_retenido: number;
  monto_liquido: number;
  estado: "VIGENTE" | "ANULADA";
  fecha_anulacion?: string;
  url_pdf?: string;
}

// ===========================================
// AUTH
// ===========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SupabaseUser {
  id: string;
  email: string;
  role?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export interface Perfil {
  id: string;
  user_id: string;
  nombre: string;
  rol: "admin" | "usuario";
  empresa_id?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  empresa?: Empresa;
}

export interface AuthUser {
  user: SupabaseUser;
  perfil: Perfil;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: SupabaseUser;
  perfil: Perfil;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
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

// ===========================================
// UTILIDADES DE VALIDACION
// ===========================================

/**
 * Valida formato de RUT chileno
 * @param rut RUT con o sin puntos y guion
 * @returns true si el formato es valido
 */
export function validarRUT(rut: string): boolean {
  if (!rut || rut.length < 8) return false;

  // Limpiar RUT
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  if (!/^\d+$/.test(cuerpo)) return false;

  // Calcular digito verificador
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvCalculado = 11 - (suma % 11);
  const dvEsperado = dvCalculado === 11 ? "0" : dvCalculado === 10 ? "K" : dvCalculado.toString();

  return dv === dvEsperado;
}

/**
 * Formatea RUT chileno con puntos y guion
 * @param rut RUT sin formato
 * @returns RUT formateado (ej: 12.345.678-9)
 */
export function formatearRUT(rut: string): string {
  const rutLimpio = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  if (rutLimpio.length < 2) return rutLimpio;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Agregar puntos cada 3 digitos desde la derecha
  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpoFormateado}-${dv}`;
}

/**
 * Valida codigo ACTECO (6 digitos)
 * @param acteco Codigo de actividad economica
 * @returns true si es valido
 */
export function validarActeco(acteco: number): boolean {
  return acteco >= 100000 && acteco <= 999999;
}

/**
 * Formatea monto en pesos chilenos
 * @param monto Monto numerico
 * @returns Monto formateado (ej: $1.234.567)
 */
export function formatearMonto(monto: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(monto);
}
