import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Eye,
  Download,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TIPOS_DTE: Record<number, string> = {
  33: "Factura",
  34: "Factura Exenta",
  39: "Boleta",
  41: "Boleta Exenta",
  52: "Guia Despacho",
  56: "Nota Debito",
  61: "Nota Credito",
};

interface DTE {
  id: string;
  tipo_dte: number;
  folio: number;
  fecha_emision: string;
  receptor_rut: string;
  receptor_razon_social: string;
  monto_total: number;
  estado: string;
}

interface DTETableProps {
  dtes: DTE[];
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusConfig = (estado: string) => {
  switch (estado) {
    case "ACEPTADO":
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bg: "bg-green-100 dark:bg-green-950",
      };
    case "ENVIADO":
      return {
        icon: Clock,
        color: "text-yellow-600",
        bg: "bg-yellow-100 dark:bg-yellow-950",
      };
    case "RECHAZADO":
      return {
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-100 dark:bg-red-950",
      };
    default:
      return {
        icon: FileText,
        color: "text-gray-600",
        bg: "bg-gray-100 dark:bg-gray-950",
      };
  }
};

export function DTETable({ dtes }: DTETableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Folio</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Receptor</TableHead>
          <TableHead className="text-right">Monto Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dtes.map((dte) => {
          const status = getStatusConfig(dte.estado);
          const StatusIcon = status.icon;

          return (
            <TableRow key={dte.id}>
              <TableCell>
                <span className="font-medium">
                  {TIPOS_DTE[dte.tipo_dte] || `Tipo ${dte.tipo_dte}`}
                </span>
              </TableCell>
              <TableCell className="font-mono">#{dte.folio}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(dte.fecha_emision).toLocaleDateString("es-CL")}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{dte.receptor_razon_social}</div>
                  {dte.receptor_rut && (
                    <div className="text-sm text-muted-foreground font-mono">
                      {dte.receptor_rut}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatMoney(dte.monto_total)}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {dte.estado}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <a
                    href={`/admin/dte/${dte.id}`}
                    className="p-1.5 hover:bg-muted rounded"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </a>
                  <button
                    className="p-1.5 hover:bg-muted rounded"
                    title="Descargar PDF"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {dte.estado === "GENERADO" && (
                    <button
                      className="p-1.5 hover:bg-muted rounded"
                      title="Enviar al SII"
                    >
                      <Send className="h-4 w-4 text-primary" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {dtes.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center py-8 text-muted-foreground"
            >
              No hay documentos emitidos
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
