import { cn } from "@/lib/utils";
import {
  Building2,
  FileText,
  FolderKey,
  FileBarChart,
  LayoutDashboard,
  Send,
} from "lucide-react";
import { HelpDialog } from "@/components/sii/help-dialog";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
  { href: "/admin/dte", label: "DTEs", icon: FileText },
  { href: "/admin/caf", label: "Folios (CAF)", icon: FolderKey },
  { href: "/admin/rcof", label: "RCOF", icon: FileBarChart },
  { href: "/admin/envios", label: "Envios SII", icon: Send },
];

export function Header({ currentPath }: { currentPath: string }) {
  const isActive = (href: string) => {
    if (href === "/admin") {
      return currentPath === "/admin" || currentPath === "/admin/";
    }
    return currentPath.startsWith(href);
  };

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 h-16 border-b">
      <a href="/" className="text-sm font-bold leading-none text-foreground flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        SII Facturacion
      </a>
      <div className="h-6 w-px bg-border" />
      {links.map((link) => {
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
      <div className="ml-auto">
        <HelpDialog />
      </div>
    </nav>
  );
}
