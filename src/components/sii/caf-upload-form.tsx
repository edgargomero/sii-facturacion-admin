import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { cafService, empresasService } from "@/lib/sii-api";
import type { Empresa } from "@/lib/sii-api";

interface CAFUploadFormProps {
  empresaId?: string;
  onSuccess?: () => void;
}

interface CAFPreview {
  tipo_dte: number;
  tipo_nombre: string;
  rango_desde: number;
  rango_hasta: number;
  fecha_autorizacion: string;
  rut_emisor: string;
}

const TIPOS_DTE: Record<number, string> = {
  33: "Factura Electronica",
  34: "Factura Exenta",
  39: "Boleta Electronica",
  41: "Boleta Exenta",
  52: "Guia de Despacho",
  56: "Nota de Debito",
  61: "Nota de Credito",
};

export function CAFUploadForm({ empresaId: initialEmpresaId, onSuccess }: CAFUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [xmlContent, setXmlContent] = useState<string>("");
  const [cafPreview, setCafPreview] = useState<CAFPreview | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(initialEmpresaId || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar lista de empresas
  useEffect(() => {
    const loadEmpresas = async () => {
      setIsLoadingEmpresas(true);
      try {
        const result = await empresasService.listar();
        if (result.success && result.data) {
          setEmpresas(result.data);
          if (!initialEmpresaId && result.data.length === 1) {
            setSelectedEmpresaId(result.data[0].id);
          }
        }
      } catch (err) {
        console.error("Error cargando empresas:", err);
      } finally {
        setIsLoadingEmpresas(false);
      }
    };
    loadEmpresas();
  }, [initialEmpresaId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".xml")) {
        setError("Solo se permiten archivos XML");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setCafPreview(null);

      // Leer y parsear el XML
      try {
        const content = await file.text();
        setXmlContent(content);
        const preview = parseCAFXML(content);
        if (preview) {
          setCafPreview(preview);
        } else {
          setError("El archivo no parece ser un CAF valido del SII");
        }
      } catch (err) {
        setError("Error al leer el archivo XML");
      }
    }
  };

  const parseCAFXML = (xml: string): CAFPreview | null => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "text/xml");

      // Verificar si es un CAF valido
      const cafNode = doc.querySelector("AUTORIZACION CAF");
      if (!cafNode) {
        return null;
      }

      const tipoDTE = parseInt(doc.querySelector("TD")?.textContent || "0", 10);
      const rangoDesde = parseInt(doc.querySelector("RNG D")?.textContent || "0", 10);
      const rangoHasta = parseInt(doc.querySelector("RNG H")?.textContent || "0", 10);
      const fechaAutorizacion = doc.querySelector("FA")?.textContent || "";
      const rutEmisor = doc.querySelector("RE")?.textContent || "";

      if (!tipoDTE || !rangoDesde || !rangoHasta) {
        return null;
      }

      return {
        tipo_dte: tipoDTE,
        tipo_nombre: TIPOS_DTE[tipoDTE] || `Tipo ${tipoDTE}`,
        rango_desde: rangoDesde,
        rango_hasta: rangoHasta,
        fecha_autorizacion: fechaAutorizacion,
        rut_emisor: rutEmisor,
      };
    } catch (err) {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !xmlContent) {
      setError("Selecciona un archivo CAF");
      return;
    }

    if (!selectedEmpresaId) {
      setError("Selecciona una empresa");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await cafService.cargar({
        empresa_id: selectedEmpresaId,
        archivo_xml: xmlContent,
      });

      if (!result.success) {
        setError(result.error?.message || "Error al cargar el CAF");
        return;
      }

      setSuccess(true);
      setSelectedFile(null);
      setXmlContent("");
      setCafPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err) {
      setError("Error al procesar el CAF");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEmpresa = empresas.find((e) => e.id === selectedEmpresaId);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h3 className="font-medium mb-4">Cargar Archivo CAF</h3>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-400">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-700 text-sm dark:bg-green-950 dark:border-green-800 dark:text-green-400">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              CAF cargado correctamente
            </div>
          )}

          <div className="space-y-4">
            {/* Selector de empresa */}
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa *</Label>
              {isLoadingEmpresas ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando empresas...
                </div>
              ) : empresas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay empresas registradas.{" "}
                  <a href="/admin/empresas/nueva" className="text-primary hover:underline">
                    Crear una empresa
                  </a>
                </p>
              ) : (
                <select
                  id="empresa"
                  value={selectedEmpresaId}
                  onChange={(e) => setSelectedEmpresaId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={!!initialEmpresaId}
                >
                  <option value="">Selecciona una empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.razon_social} ({empresa.rut})
                    </option>
                  ))}
                </select>
              )}
              {selectedEmpresa && (
                <p className="text-xs text-muted-foreground">
                  Ambiente: {selectedEmpresa.ambiente}
                </p>
              )}
            </div>

            {/* Input de archivo */}
            <div className="space-y-2">
              <Label htmlFor="caf">Archivo CAF (.xml) *</Label>
              <Input
                ref={fileInputRef}
                id="caf"
                type="file"
                accept=".xml"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Archivo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preview del CAF */}
        {cafPreview && (
          <div className="rounded-lg border p-6 bg-muted/50">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Contenido del CAF</h4>
            </div>
            <dl className="grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Tipo de Documento</dt>
                <dd className="font-medium">{cafPreview.tipo_nombre}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Codigo DTE</dt>
                <dd className="font-mono">{cafPreview.tipo_dte}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Rango de Folios</dt>
                <dd className="font-mono">
                  {cafPreview.rango_desde.toLocaleString()} - {cafPreview.rango_hasta.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total Folios</dt>
                <dd className="font-medium">
                  {(cafPreview.rango_hasta - cafPreview.rango_desde + 1).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">RUT Emisor</dt>
                <dd className="font-mono">{cafPreview.rut_emisor}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fecha Autorizacion</dt>
                <dd>{cafPreview.fecha_autorizacion}</dd>
              </div>
            </dl>

            {/* Validacion RUT */}
            {selectedEmpresa && cafPreview.rut_emisor && (
              <div className="mt-4 pt-4 border-t">
                {selectedEmpresa.rut.replace(/\./g, "").toLowerCase() ===
                cafPreview.rut_emisor.toLowerCase() ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    El RUT del CAF coincide con la empresa seleccionada
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Advertencia: El RUT del CAF ({cafPreview.rut_emisor}) no coincide con
                    la empresa ({selectedEmpresa.rut})
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading || !selectedFile || !selectedEmpresaId || !cafPreview}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Cargar CAF
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
        </div>
      </form>

      {/* Info adicional */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h4 className="font-medium text-sm mb-2">Informacion sobre CAFs</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- El CAF (Codigo de Autorizacion de Folios) es otorgado por el SII.</li>
          <li>- Cada CAF contiene un rango de folios autorizados para un tipo de documento especifico.</li>
          <li>- Debes cargar un CAF para cada tipo de documento que necesites emitir.</li>
          <li>- Los folios se consumiran automaticamente al emitir documentos.</li>
        </ul>
      </div>
    </div>
  );
}
