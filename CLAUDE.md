# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SII Facturacion Admin** - Admin panel for Chilean electronic invoicing system (SII - Servicio de Impuestos Internos). This is the frontend for `sii-facturacion-go` backend API.

## Tech Stack

- **Framework:** Astro 4 with React integration
- **UI:** Shadcn UI (new-york style) + Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Deploy:** Cloudflare Pages (SSR mode)

## Commands

**IMPORTANTE:** Usar siempre `pnpm` y PowerShell para todos los comandos.

```powershell
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm preview   # Preview production build locally
pnpm check     # TypeScript type checking
pnpm deploy    # Build and deploy to Cloudflare Pages
```

## Architecture

### Astro + React Hybrid

- **Astro pages** (`.astro`) handle routing and server-side data fetching
- **React components** (`.tsx`) handle interactive UI with `client:load` directive
- Server-side API calls happen in Astro frontmatter (between `---` fences)

```astro
---
// Server-side: fetch data from Go API
const response = await empresasService.listar();
const empresas = response.data || [];
---

<!-- Client-side: interactive React component -->
<EmpresasTable empresas={empresas} client:load />
```

### API Client Layer

`src/lib/sii-api/` provides typed API client for the Go backend:

- `client.ts` - Base HTTP client with auth token handling
- `types.ts` - TypeScript interfaces matching Go API responses
- `services/` - Domain-specific service modules (empresas, dte, caf, rcof, envio, certificados, auth)

Services use `api.get/post/put/delete` helpers and return `ApiResponse<T>` wrapper.

**Multipart uploads:** For file uploads (CAF, certificados), use `api.postMultipart()`:
```typescript
const formData = new FormData();
formData.append("empresa_id", empresaId);
formData.append("file", file);
return api.postMultipart<CAF>(BASE_PATH, formData);
```

### Component Organization

- `src/components/ui/` - Shadcn UI primitives (button, card, table, form, etc.)
- `src/components/sii/` - Domain-specific components (forms, tables for SII entities)
- `src/components/Header.tsx` - Navigation header

### Page Structure

Pages follow `/admin/{entity}/` pattern:
- `index.astro` - List view
- `nueva.astro` - Create form
- `[id].astro` - Detail view
- `[id]/editar.astro` - Edit form

## Key Conventions

### Import Aliases

```typescript
import { Button } from "@/components/ui/button";
import { empresasService } from "@/lib/sii-api";
import Layout from "@/layouts/Layout.astro";
```

### Adding Shadcn Components

```bash
npx shadcn@latest add [component-name]
```

Components install to `src/components/ui/` with Tailwind CSS variables.

### Form Pattern

Forms use React Hook Form + Zod:
```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

### API Response Handling

```typescript
const response = await empresasService.listar();
if (response.success && response.data) {
  // Use response.data
} else {
  // Handle response.error
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `API_URL` | Backend Go API URL (defaults to production URL) |

For local development, the client auto-detects localhost and uses `http://localhost:8080`.

## Data Tables

Uses TanStack Table (v8) for data grids with sorting, filtering, and pagination. Tables are in `src/components/sii/*-table.tsx`.

## Theming

Dark mode supported via Tailwind CSS classes. Theme toggle persists to localStorage.

## Backend Connection

This frontend connects to `sii-facturacion-go` backend. The API client auto-detects environment:
- **Local:** `http://localhost:8080` (when running on localhost:3000)
- **Production:** `https://sii-facturacion-api.edgar-gomero.workers.dev`

## SII Domain Context

- **DTE Types:** 33 (Factura), 34 (Factura Exenta), 39 (Boleta), 41 (Boleta Exenta), 52 (Guia), 56 (Nota Debito), 61 (Nota Credito)
- **CAF:** Authorized folio codes from SII
- **RCOF:** Folio consumption reports (mandatory for boletas)
- **Ambientes:** CERTIFICACION (testing), PRODUCCION (live)

## Field Naming Conventions

### Frontend ↔ Backend DTO ↔ Database

Los nombres de campos deben coincidir entre frontend, backend DTOs y base de datos:

| Frontend (JSON) | Backend DTO | Database Column |
|-----------------|-------------|-----------------|
| `sii_ambiente` | `SIIAmbiente` | `ambiente` |
| `fch_resol` | `FchResol` | `fecha_resolucion` |
| `nro_resol` | `NroResol` | `numero_resolucion` |
| `descuento_pct` | `DescuentoPct` | `descuento_porcentaje` |

### Campos Requeridos por Formulario

**Factura (tipo 33/34):**
- Receptor: `rut`, `razon_social`, `giro`, `direccion`, `comuna` (todos requeridos)
- Detalle: `nombre`, `cantidad`, `precio_unitario`, `es_exento`

**Boleta (tipo 39/41):**
- Receptor: opcional (`rut`, `razon_social`)
- `monto_bruto`: boolean - indica si precios incluyen IVA
- Detalle: `nombre`, `cantidad`, `precio_unitario`, `es_exento`

**Guia Despacho (tipo 52):**
- Requiere `ind_traslado` (1-9)
- Opcional: `transporte` (patente, chofer, direccion destino)

## Authentication Flow

1. Login envia credenciales a `/api/v1/auth/login`
2. Backend retorna JWT tokens
3. Frontend guarda en cookies: `sii_session` (access), `sii_refresh` (refresh)
4. Middleware valida token en cada request a `/admin/*`
5. Si token invalido: redirect a `/login?error=session_expired`

**IMPORTANTE:** La pagina de login NO debe redirigir a `/admin` si hay parametro `error` en la URL (evita redirect loop).

## Deploy

### Frontend (Cloudflare Pages)
```powershell
pnpm run deploy
```

### Backend (Cloudflare Workers Containers)
```powershell
cd ../sii-facturacion-go
pnpm run deploy
```

El backend usa Docker para compilar Go y despliega como container en Cloudflare Workers.
