import { Pencil, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Empresa {
  id: string;
  rut: string;
  razon_social: string;
  giro: string;
  comuna: string;
  sii_ambiente: string;
}

interface EmpresasTableProps {
  empresas: Empresa[];
}

export function EmpresasTable({ empresas }: EmpresasTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>RUT</TableHead>
          <TableHead>Razon Social</TableHead>
          <TableHead>Giro</TableHead>
          <TableHead>Comuna</TableHead>
          <TableHead>Ambiente</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {empresas.map((empresa) => (
          <TableRow key={empresa.id}>
            <TableCell className="font-mono">{empresa.rut}</TableCell>
            <TableCell className="font-medium">{empresa.razon_social}</TableCell>
            <TableCell className="text-muted-foreground max-w-xs truncate">
              {empresa.giro}
            </TableCell>
            <TableCell>{empresa.comuna}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  empresa.sii_ambiente === "PRODUCCION"
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                }`}
              >
                {empresa.sii_ambiente}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <a
                  href={`/admin/empresas/${empresa.id}`}
                  className="p-1 hover:bg-muted rounded"
                  title="Ver detalles"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href={`/admin/empresas/${empresa.id}/editar`}
                  className="p-1 hover:bg-muted rounded"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {empresas.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              No hay empresas registradas
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
