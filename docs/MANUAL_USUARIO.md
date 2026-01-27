# Manual de Usuario - SII Facturación Electrónica

Sistema de facturación electrónica para Chile conforme a las especificaciones del SII.

**URL del Sistema:** https://master.sii-facturacion-admin.pages.dev

---

## Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Configuración Inicial](#2-configuración-inicial)
3. [Gestión de Empresas](#3-gestión-de-empresas)
4. [Certificado Digital](#4-certificado-digital)
5. [Folios CAF](#5-folios-caf)
6. [Emisión de Documentos](#6-emisión-de-documentos)
7. [Consulta de DTEs](#7-consulta-de-dtes)
8. [Envío al SII](#8-envío-al-sii)
9. [RCOF (Boletas)](#9-rcof-boletas)
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)

---

## 1. Requisitos Previos

Antes de usar el sistema necesitas:

| Requisito | Descripción | Dónde obtenerlo |
|-----------|-------------|-----------------|
| **Certificado Digital** | Archivo .pfx o .p12 válido | E-Sign, E-Cert, Acepta, etc. |
| **Archivos CAF** | XML de folios autorizados por tipo de documento | Portal SII |
| **Datos de Resolución** | Número y fecha de resolución SII | Portal SII |

### Ambientes SII

| Ambiente | Uso | Resolución |
|----------|-----|------------|
| **CERTIFICACION** | Pruebas y certificación | Número = 0 |
| **PRODUCCION** | Documentos reales | Número real de resolución |

---

## 2. Configuración Inicial

### Flujo de configuración

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Crear       │     │  2. Subir       │     │  3. Cargar      │
│     Empresa     │ ──► │     Certificado │ ──► │     CAFs        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  4. Emitir      │
                                               │     Documentos  │
                                               └─────────────────┘
```

---

## 3. Gestión de Empresas

### Crear una Empresa

1. Ir a **Empresas** → **Nueva Empresa**
2. Completar los datos:

| Campo | Obligatorio | Ejemplo |
|-------|-------------|---------|
| RUT Empresa | Sí | 76.755.891-6 |
| Razón Social | Sí | KNTOR SPA |
| Giro | Sí | ACTIVIDADES DE AGENCIA DE VIAJES |
| Dirección | Sí | PASAJE TRES 2773 INDEPENDENCIA |
| Comuna | Sí | INDEPENDENCIA |
| Ciudad | Sí | SANTIAGO |
| Código ACTECO | No | 791100 |
| Teléfono | No | +56962442055 |
| Email | No | edgar@kntor.io |

### Resolución SII

| Campo | CERTIFICACION | PRODUCCION |
|-------|---------------|------------|
| Número Resolución | **0** | Número real (ej: 80) |
| Fecha Resolución | Cualquier fecha | Fecha real de resolución |

3. Seleccionar **Ambiente**: Certificación o Producción
4. Click en **Guardar Empresa**

### Ver/Editar Empresa

- Click en una empresa de la lista para ver detalles
- Desde el detalle puedes:
  - Editar datos
  - Subir certificado
  - Ver CAFs cargados
  - Crear documentos

---

## 4. Certificado Digital

### Subir Certificado

1. Ir a **Empresas** → Seleccionar empresa → **Certificado Digital**
2. Click en **Seleccionar archivo**
3. Seleccionar archivo `.pfx` o `.p12`
4. Ingresar la **contraseña** del certificado
5. Click en **Cargar Certificado**

### Información del Certificado

Una vez cargado, el sistema muestra:
- Nombre del titular
- RUT del titular
- Fecha de vencimiento
- Estado (Vigente / Por vencer / Vencido)

### Notas Importantes

- El certificado debe estar **vigente**
- La contraseña **no se almacena**, solo se usa para validar
- Un solo certificado activo por empresa
- El RUT del certificado debe corresponder al representante legal

---

## 5. Folios CAF

### ¿Qué es un CAF?

**CAF** = Código de Autorización de Folios

Es un archivo XML que el SII entrega con un rango de folios autorizados para emitir documentos.

### Obtener CAF del SII

1. Ir a https://maullin.sii.cl/cvc_cgi/dte/of_solicita_folios (certificación)
2. Ingresar con certificado digital
3. Seleccionar tipo de documento
4. Indicar cantidad de folios
5. Descargar archivo XML

### Cargar CAF en el Sistema

1. Ir a **Folios (CAF)** → **Cargar CAF**
2. Seleccionar la empresa
3. Seleccionar el archivo XML del CAF
4. El sistema muestra vista previa:
   - Tipo de documento
   - Rango de folios (desde - hasta)
   - RUT emisor
5. Click en **Cargar CAF**

### Tipos de Documento

| Código | Tipo | Descripción |
|--------|------|-------------|
| 33 | Factura Electrónica | Documento con IVA |
| 34 | Factura Exenta | Sin IVA |
| 39 | Boleta Electrónica | Venta a consumidor final |
| 41 | Boleta Exenta | Sin IVA, consumidor final |
| 52 | Guía de Despacho | Traslado de mercadería |
| 56 | Nota de Débito | Aumentar monto facturado |
| 61 | Nota de Crédito | Anular o disminuir monto |

### Ver Resumen de Folios

En **Folios (CAF)** puedes ver:
- Folios disponibles por tipo de documento
- Folios utilizados
- CAFs próximos a agotarse

---

## 6. Emisión de Documentos

### Generar Factura Electrónica (Tipo 33)

1. Ir a **DTEs** → **Nueva Factura**
2. Seleccionar **Empresa Emisora**
3. Completar datos del **Receptor (Cliente)**:
   - RUT (obligatorio)
   - Razón Social (obligatorio)
   - Giro
   - Dirección
   - Comuna

4. Agregar **Items/Detalles**:
   - Descripción del producto/servicio
   - Cantidad
   - Precio unitario
   - Descuento (%) opcional

5. El sistema calcula automáticamente:
   - Neto
   - IVA (19%)
   - Total

6. Opcional: Agregar observaciones
7. Click en **Generar Factura**

### Generar Boleta Electrónica (Tipo 39)

1. Ir a **DTEs** → **Nueva Boleta**
2. Proceso similar a factura pero:
   - Receptor puede ser anónimo (66.666.666-6)
   - No requiere giro ni dirección
   - Incluye IVA en el precio

### Notas de Crédito/Débito

1. Ir a **DTEs** → **Nueva Nota Crédito/Débito**
2. Indicar documento de referencia (Tipo + Folio)
3. Razón de la nota
4. Items a modificar

---

## 7. Consulta de DTEs

### Lista de Documentos

En **DTEs** puedes ver todos los documentos emitidos con:
- Tipo y número de folio
- Fecha de emisión
- Receptor
- Monto total
- Estado (Pendiente, Enviado, Aceptado, Rechazado)

### Acciones por Documento

| Acción | Descripción |
|--------|-------------|
| **Ver XML** | Descargar XML del DTE |
| **Ver PDF** | Descargar representación impresa |
| **Ver Timbre** | Ver código PDF417 |
| **Enviar SII** | Enviar al SII si no se ha enviado |

### Filtros

Puedes filtrar por:
- Tipo de documento
- Rango de fechas
- Estado
- RUT receptor

---

## 8. Envío al SII

### Envío Manual

1. En la lista de DTEs, seleccionar documentos pendientes
2. Click en **Enviar al SII**
3. El sistema genera el sobre (EnvioDTE) y lo envía

### Estados de Envío

| Estado | Significado |
|--------|-------------|
| **Pendiente** | No enviado al SII |
| **Enviado** | Enviado, esperando respuesta |
| **Aceptado** | SII aceptó el documento |
| **Aceptado con Reparos** | Aceptado pero con observaciones |
| **Rechazado** | SII rechazó el documento |

### Consultar Estado

1. Ir a **Envíos SII**
2. Ver lista de envíos con Track ID
3. Click en un envío para ver detalle y documentos incluidos

### Track ID

El SII asigna un **Track ID** a cada envío. Úsalo para:
- Consultar estado en el portal SII
- Hacer seguimiento de documentos

---

## 9. RCOF (Boletas)

### ¿Qué es el RCOF?

**RCOF** = Reporte de Consumo de Folios

Es un informe **obligatorio** que se envía al SII con el resumen de boletas emitidas.

### Generar RCOF

1. Ir a **RCOF** → **Generar RCOF**
2. Seleccionar empresa
3. Seleccionar período (fecha desde - hasta)
4. El sistema genera automáticamente:
   - Resumen por tipo de documento
   - Rangos de folios utilizados
   - Montos totales

5. Click en **Generar**

### Enviar RCOF al SII

1. En lista de RCOFs, seleccionar el reporte
2. Click en **Enviar al SII**
3. Verificar estado del envío

### Frecuencia

- Enviar **diariamente** o al menos antes del día 15 del mes siguiente

---

## 10. Preguntas Frecuentes

### ¿Por qué no puedo crear documentos?

Verifica que:
1. ✅ La empresa tiene **certificado digital** cargado y vigente
2. ✅ La empresa tiene **CAFs** cargados para el tipo de documento
3. ✅ Los CAFs tienen **folios disponibles**

### ¿Cómo sé si el SII aceptó mi documento?

1. Ve a **Envíos SII**
2. Busca el envío por Track ID
3. El estado debe ser "Aceptado"

También puedes verificar en:
- Certificación: https://maullin.sii.cl/cgi_dte/UPL/DTEauth?1
- Producción: https://palena.sii.cl/cgi_dte/UPL/DTEauth?1

### ¿Qué hago si el documento es rechazado?

1. Ver el motivo del rechazo en el detalle del envío
2. Corregir el error
3. Generar un nuevo documento con nuevo folio
4. El folio anterior queda **anulado**

### ¿Puedo anular un documento?

No directamente. Debes emitir una **Nota de Crédito** que anule el documento original.

### ¿Cómo cambio de CERTIFICACION a PRODUCCION?

1. Completar el proceso de certificación con el SII
2. Obtener resolución de autorización
3. Editar la empresa y cambiar:
   - Ambiente: PRODUCCION
   - Número Resolución: El número real de la resolución

### ¿El timbre PDF417 es correcto?

Sí, el sistema genera el timbre según especificaciones del SII:
- Contiene el XML del TED firmado
- Usa codificación PDF417
- Se puede validar con cualquier lector de códigos

---

## URLs del SII

### Certificación (Pruebas)

| Función | URL |
|---------|-----|
| Inscripción | https://maullin.sii.cl/cvc_cgi/dte/pe_ingrut |
| Solicitar Folios | https://maullin.sii.cl/cvc_cgi/dte/of_solicita_folios |
| Consultar Envíos | https://maullin.sii.cl/cgi_dte/UPL/DTEauth?1 |
| Set de Pruebas | https://maullin.sii.cl/cvc_cgi/dte/pe_generar |

### Producción

| Función | URL |
|---------|-----|
| Solicitar Folios | https://palena.sii.cl/cvc_cgi/dte/of_solicita_folios |
| Consultar Envíos | https://palena.sii.cl/cgi_dte/UPL/DTEauth?1 |

---

## Soporte

Para reportar problemas o sugerencias:
- GitHub: https://github.com/edgargomero/sii-facturacion-admin/issues

---

*Última actualización: Enero 2026*
