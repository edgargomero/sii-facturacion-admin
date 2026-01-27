import * as React from "react";
import {
  HelpCircle,
  Building2,
  ShieldCheck,
  FolderKey,
  FileText,
  Send,
  FileBarChart,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HelpSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

const DocumentTypes = () => (
  <div className="space-y-2">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2">Codigo</th>
          <th className="text-left py-2">Tipo</th>
          <th className="text-left py-2">Descripcion</th>
        </tr>
      </thead>
      <tbody className="text-muted-foreground">
        <tr className="border-b">
          <td className="py-2 font-mono">33</td>
          <td className="py-2">Factura</td>
          <td className="py-2">Documento con IVA</td>
        </tr>
        <tr className="border-b">
          <td className="py-2 font-mono">34</td>
          <td className="py-2">Factura Exenta</td>
          <td className="py-2">Sin IVA</td>
        </tr>
        <tr className="border-b">
          <td className="py-2 font-mono">39</td>
          <td className="py-2">Boleta</td>
          <td className="py-2">Consumidor final</td>
        </tr>
        <tr className="border-b">
          <td className="py-2 font-mono">41</td>
          <td className="py-2">Boleta Exenta</td>
          <td className="py-2">Sin IVA, consumidor final</td>
        </tr>
        <tr className="border-b">
          <td className="py-2 font-mono">52</td>
          <td className="py-2">Guia Despacho</td>
          <td className="py-2">Traslado mercaderia</td>
        </tr>
        <tr className="border-b">
          <td className="py-2 font-mono">56</td>
          <td className="py-2">Nota Debito</td>
          <td className="py-2">Aumentar monto</td>
        </tr>
        <tr>
          <td className="py-2 font-mono">61</td>
          <td className="py-2">Nota Credito</td>
          <td className="py-2">Anular/disminuir monto</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const helpSections: HelpSection[] = [
  {
    id: "empresas",
    title: "Empresas",
    icon: Building2,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Registra los datos de tu empresa emisora de documentos:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <strong>RUT y Razon Social:</strong> Datos fiscales de la empresa
          </li>
          <li>
            <strong>Giro:</strong> Actividad economica principal
          </li>
          <li>
            <strong>Resolucion SII:</strong> Usa 0 para certificacion, numero
            real para produccion
          </li>
          <li>
            <strong>Ambiente:</strong> CERTIFICACION (pruebas) o PRODUCCION
            (real)
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "certificado",
    title: "Certificado Digital",
    icon: ShieldCheck,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>El certificado digital es necesario para firmar documentos:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Formato .pfx o .p12</li>
          <li>Debe estar vigente</li>
          <li>Corresponde al representante legal</li>
          <li>La contrasena no se almacena, solo se valida</li>
        </ul>
        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg mt-3">
          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-yellow-600 dark:text-yellow-400">
            Obtener en: E-Sign, E-Cert, Acepta u otro proveedor autorizado
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "caf",
    title: "Folios (CAF)",
    icon: FolderKey,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          <strong>CAF</strong> = Codigo de Autorizacion de Folios
        </p>
        <p>Es un archivo XML con folios autorizados por el SII.</p>
        <div className="space-y-2 mt-3">
          <p className="font-medium text-foreground">Como obtener:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Ingresar al portal SII con certificado</li>
            <li>Ir a "Solicitar folios"</li>
            <li>Seleccionar tipo de documento</li>
            <li>Indicar cantidad</li>
            <li>Descargar archivo XML</li>
          </ol>
        </div>
      </div>
    ),
  },
  {
    id: "dte",
    title: "Documentos (DTE)",
    icon: FileText,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          <strong>DTE</strong> = Documento Tributario Electronico
        </p>
        <DocumentTypes />
      </div>
    ),
  },
  {
    id: "envios",
    title: "Envios al SII",
    icon: Send,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Estados de envio al SII:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />
            <span>
              <strong>Pendiente:</strong> No enviado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>
              <strong>Enviado:</strong> Esperando respuesta
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span>
              <strong>Aceptado:</strong> SII acepto el documento
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>
              <strong>Rechazado:</strong> SII rechazo el documento
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "rcof",
    title: "RCOF",
    icon: FileBarChart,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          <strong>RCOF</strong> = Reporte de Consumo de Folios
        </p>
        <p>Informe obligatorio con resumen de boletas emitidas.</p>
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg mt-3">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-blue-600 dark:text-blue-400">
            Debe enviarse diariamente o antes del dia 15 del mes siguiente
          </p>
        </div>
      </div>
    ),
  },
];

const faqItems = [
  {
    question: "No puedo crear documentos",
    answer: (
      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
        <li>Verifica que la empresa tiene certificado digital cargado</li>
        <li>Verifica que hay CAFs cargados para el tipo de documento</li>
        <li>Verifica que los CAFs tienen folios disponibles</li>
      </ul>
    ),
  },
  {
    question: "Como se si el SII acepto mi documento?",
    answer: (
      <p className="text-muted-foreground">
        Ve a "Envios SII" y busca el envio por Track ID. El estado debe ser
        "Aceptado".
      </p>
    ),
  },
  {
    question: "Puedo anular un documento?",
    answer: (
      <p className="text-muted-foreground">
        No directamente. Debes emitir una Nota de Credito que anule el documento
        original.
      </p>
    ),
  },
  {
    question: "Como cambio de CERTIFICACION a PRODUCCION?",
    answer: (
      <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
        <li>Completar el proceso de certificacion con el SII</li>
        <li>Obtener resolucion de autorizacion</li>
        <li>Editar la empresa y cambiar ambiente a PRODUCCION</li>
        <li>Actualizar el numero de resolucion real</li>
      </ol>
    ),
  },
];

const siiLinks = [
  {
    label: "Solicitar Folios (Certificacion)",
    url: "https://maullin.sii.cl/cvc_cgi/dte/of_solicita_folios",
  },
  {
    label: "Consultar Envios (Certificacion)",
    url: "https://maullin.sii.cl/cgi_dte/UPL/DTEauth?1",
  },
  {
    label: "Solicitar Folios (Produccion)",
    url: "https://palena.sii.cl/cvc_cgi/dte/of_solicita_folios",
  },
  {
    label: "Consultar Envios (Produccion)",
    url: "https://palena.sii.cl/cgi_dte/UPL/DTEauth?1",
  },
];

export function HelpDialog() {
  const [activeTab, setActiveTab] = React.useState<"guia" | "faq" | "links">(
    "guia"
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Ayuda</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Centro de Ayuda
          </DialogTitle>
          <DialogDescription>
            Guia de uso del sistema de facturacion electronica SII
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          <button
            onClick={() => setActiveTab("guia")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === "guia"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Guia de Uso
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === "faq"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Preguntas Frecuentes
          </button>
          <button
            onClick={() => setActiveTab("links")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === "links"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Links SII
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          {activeTab === "guia" && (
            <Accordion type="single" collapsible className="w-full">
              {helpSections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <section.icon className="h-4 w-4 text-primary" />
                      {section.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>{section.content}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {activeTab === "faq" && (
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="hover:no-underline text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {activeTab === "links" && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Enlaces directos al portal del SII:
              </p>
              <div className="space-y-2">
                {siiLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <span className="text-sm">{link.label}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-4 space-y-2">
          <a
            href="/ayuda"
            className="block w-full text-center py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm font-medium transition-colors"
          >
            Ver Guia Completa
          </a>
          <p className="text-xs text-muted-foreground text-center">
            Para mas informacion, consulta el{" "}
            <a
              href="https://github.com/edgargomero/sii-facturacion-admin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              repositorio del proyecto
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
