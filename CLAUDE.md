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

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run check     # TypeScript type checking
npm run deploy    # Build and deploy to Cloudflare Pages
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
