import { cn } from "@/lib/utils";
import {
  Building2,
  FileText,
  FolderKey,
  FileBarChart,
  LayoutDashboard,
  Send,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { HelpDialog } from "@/components/sii/help-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SupabaseUser, Perfil } from "@/lib/sii-api/types";
import { hasAnyPermission, type Permission, type Role } from "@/lib/auth/permissions";

// Links de navegacion con permisos requeridos
const links: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permissions: Permission[];
}> = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    permissions: [], // Todos pueden ver
  },
  {
    href: "/admin/empresas",
    label: "Empresas",
    icon: Building2,
    permissions: ["empresas:read", "empresas:read:own"],
  },
  {
    href: "/admin/dte",
    label: "DTEs",
    icon: FileText,
    permissions: ["dtes:read", "dtes:read:own"],
  },
  {
    href: "/admin/caf",
    label: "Folios (CAF)",
    icon: FolderKey,
    permissions: ["cafs:read", "cafs:read:own"],
  },
  {
    href: "/admin/rcof",
    label: "RCOF",
    icon: FileBarChart,
    permissions: ["dtes:read", "dtes:read:own"],
  },
  {
    href: "/admin/envios",
    label: "Envios SII",
    icon: Send,
    permissions: ["dtes:read", "dtes:read:own"],
  },
];

interface HeaderProps {
  currentPath: string;
  user?: SupabaseUser;
  perfil?: Perfil;
}

export function Header({ currentPath, user, perfil }: HeaderProps) {
  const role = perfil?.rol as Role | undefined;

  const isActive = (href: string) => {
    if (href === "/admin") {
      return currentPath === "/admin" || currentPath === "/admin/";
    }
    return currentPath.startsWith(href);
  };

  // Filtrar links segun permisos
  const visibleLinks = links.filter((link) => {
    if (link.permissions.length === 0) return true;
    return hasAnyPermission(role, link.permissions);
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 h-16 border-b">
      <a
        href="/"
        className="text-sm font-bold leading-none text-foreground flex items-center gap-2"
      >
        <FileText className="h-5 w-5 text-primary" />
        SII Facturacion
      </a>
      <div className="h-6 w-px bg-border" />

      {visibleLinks.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.href}
            className={cn(
              "text-sm font-medium leading-none flex items-center gap-1.5 py-2 px-3 rounded-md transition-colors",
              isActive(link.href)
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </a>
        );
      })}

      <div className="ml-auto flex items-center gap-2">
        <HelpDialog />

        {user && perfil && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline-block max-w-[150px] truncate">
                  {perfil.nombre || user.email}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{perfil.nombre}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <span className="text-xs text-muted-foreground">
                  Rol: {perfil.rol === "admin" ? "Administrador" : "Usuario"}
                </span>
              </DropdownMenuItem>
              {perfil.empresa && (
                <DropdownMenuItem disabled>
                  <span className="text-xs text-muted-foreground truncate">
                    Empresa: {perfil.empresa.razon_social}
                  </span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!user && (
          <Button variant="outline" size="sm" asChild>
            <a href="/login">Iniciar Sesion</a>
          </Button>
        )}
      </div>
    </nav>
  );
}
