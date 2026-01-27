# SII Facturacion Admin

Panel de administracion para el sistema de Facturacion Electronica SII Chile.

## Stack Tecnologico

- **Frontend:** [Astro](https://astro.build) + React
- **UI:** [Shadcn UI](https://ui.shadcn.com) + Tailwind CSS
- **Backend:** API Go (sii-facturacion-go)
- **Deploy:** Cloudflare Pages

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/          # Componentes Shadcn UI (atomos/moleculas)
│   ├── sii/         # Componentes especificos SII
│   └── Header.tsx   # Navegacion principal
├── layouts/
│   └── Layout.astro # Layout principal
├── lib/
│   ├── sii-api/     # Cliente API para backend Go
│   │   ├── client.ts
│   │   ├── types.ts
│   │   └── services/
│   └── utils.ts
├── pages/
│   ├── index.astro        # Landing page
│   └── admin/
│       ├── index.astro    # Dashboard
│       ├── empresas/      # Gestion de empresas
│       ├── dte/           # Documentos tributarios
│       ├── caf/           # Folios (CAF)
│       ├── rcof/          # Reportes consumo folios
│       └── envios/        # Envios al SII
└── styles/
    └── globals.css
```

## Instalacion

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu API

# Iniciar servidor de desarrollo
npm run dev
```

## Variables de Entorno

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `API_URL` | URL del backend Go | `http://localhost:8080` |

## Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para produccion
npm run preview  # Preview de build
npm run deploy   # Desplegar a Cloudflare Pages
```

## Despliegue

### Cloudflare Pages

```bash
# Login en Cloudflare
npx wrangler login

# Desplegar
npm run deploy
```

## Funcionalidades

- **Dashboard:** Estadisticas y acciones rapidas
- **Empresas:** CRUD de empresas emisoras
- **DTEs:** Emision de facturas, boletas, notas de credito/debito
- **CAFs:** Gestion de folios autorizados
- **RCOFs:** Reportes de consumo de folios
- **Envios:** Historial de envios al SII

## Conexion con Backend

El frontend se conecta a la API Go mediante el cliente en `src/lib/sii-api/`.

Servicios disponibles:
- `empresasService` - Gestion de empresas
- `dteService` - Emision de documentos
- `cafService` - Gestion de folios
- `rcofService` - Reportes
- `envioService` - Envios al SII
- `authService` - Autenticacion

## Licencia

MIT
