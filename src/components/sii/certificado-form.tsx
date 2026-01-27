import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { certificadosService } from "@/lib/sii-api";

interface CertificadoFormProps {
  empresaId: string;
  empresaNombre: string;
  certificadoActual?: {
    nombre: string;
    rut_titular: string;
    fecha_vencimiento: string;
    activo: boolean;
  };
  onSuccess?: () => void;
}

export function CertificadoForm({
  empresaId,
  empresaNombre,
  certificadoActual,
  onSuccess,
}: CertificadoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pfx") && !file.name.toLowerCase().endsWith(".p12")) {
        setError("Solo se permiten archivos .pfx o .p12");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Selecciona un archivo de certificado");
      return;
    }

    if (!password) {
      setError("Ingresa la contrasena del certificado");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Convertir archivo a base64
      const base64 = await fileToBase64(selectedFile);

      const result = await certificadosService.cargar({
        empresa_id: empresaId,
        archivo_pfx: base64,
        password: password,
        nombre: selectedFile.name,
      });

      if (!result.success) {
        setError(result.error?.message || "Error al cargar el certificado");
        return;
      }

      setSuccess(true);
      setSelectedFile(null);
      setPassword("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err) {
      setError("Error al procesar el certificado");
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:application/x-pkcs12;base64," o similar
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const diasRestantes = certificadoActual
    ? Math.ceil(
        (new Date(certificadoActual.fecha_vencimiento).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Estado actual del certificado */}
      {certificadoActual && (
        <div
          className={`p-4 rounded-lg border ${
            diasRestantes > 30
              ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
              : diasRestantes > 0
              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
              : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <Shield
              className={`h-5 w-5 mt-0.5 ${
                diasRestantes > 30
                  ? "text-green-600"
                  : diasRestantes > 0
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            />
            <div className="flex-1">
              <h4 className="font-medium">Certificado Actual</h4>
              <dl className="mt-2 grid gap-1 text-sm">
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Nombre:</dt>
                  <dd>{certificadoActual.nombre}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">RUT Titular:</dt>
                  <dd className="font-mono">{certificadoActual.rut_titular}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Vencimiento:</dt>
                  <dd>
                    {new Date(certificadoActual.fecha_vencimiento).toLocaleDateString("es-CL")}
                    {diasRestantes > 0 ? (
                      <span className="ml-2 text-muted-foreground">
                        ({diasRestantes} dias restantes)
                      </span>
                    ) : (
                      <span className="ml-2 text-red-600 font-medium">VENCIDO</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de carga */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border p-6">
          <h3 className="font-medium mb-4">
            {certificadoActual ? "Actualizar Certificado" : "Cargar Certificado"}
          </h3>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-400">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-green-700 text-sm dark:bg-green-950 dark:border-green-800 dark:text-green-400">
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              Certificado cargado correctamente
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="certificado">Archivo Certificado (.pfx o .p12) *</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="certificado"
                  type="file"
                  accept=".pfx,.p12"
                  onChange={handleFileChange}
                  className="flex-1"
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contrasena del Certificado *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contrasena"
              />
              <p className="text-xs text-muted-foreground">
                La contrasena se usa solo para verificar y extraer el certificado.
                Se almacena de forma segura y encriptada.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || !selectedFile || !password}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {certificadoActual ? "Actualizar Certificado" : "Cargar Certificado"}
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
        <h4 className="font-medium text-sm mb-2">Informacion importante</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>- El certificado digital debe ser emitido por una entidad certificadora autorizada por el SII.</li>
          <li>- El certificado debe estar vigente y pertenecer a un representante legal de la empresa.</li>
          <li>- Formatos aceptados: .pfx (PKCS#12) o .p12</li>
        </ul>
      </div>
    </div>
  );
}
