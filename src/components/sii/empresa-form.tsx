import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { empresasService } from "@/lib/sii-api";
import { validarRUT, formatearRUT, validarActeco } from "@/lib/sii-api/types";

// ===========================================
// VALIDACIONES ZOD CON REGLAS SII
// ===========================================

const empresaSchema = z.object({
  rut: z
    .string()
    .min(8, "RUT debe tener al menos 8 caracteres")
    .max(12, "RUT no puede tener mas de 12 caracteres")
    .refine((val) => validarRUT(val), {
      message: "RUT invalido. Verifica el digito verificador",
    }),
  razon_social: z
    .string()
    .min(3, "Razon social debe tener al menos 3 caracteres")
    .max(200, "Razon social no puede exceder 200 caracteres"),
  giro: z
    .string()
    .min(3, "Giro debe tener al menos 3 caracteres")
    .max(200, "Giro no puede exceder 200 caracteres"),
  direccion: z
    .string()
    .min(5, "Direccion debe tener al menos 5 caracteres")
    .max(200, "Direccion no puede exceder 200 caracteres"),
  comuna: z
    .string()
    .min(2, "Comuna debe tener al menos 2 caracteres")
    .max(100, "Comuna no puede exceder 100 caracteres"),
  ciudad: z
    .string()
    .min(2, "Ciudad debe tener al menos 2 caracteres")
    .max(100, "Ciudad no puede exceder 100 caracteres"),
  acteco: z
    .string()
    .min(1, "Codigo ACTECO es requerido por el SII")
    .refine(
      (val) => {
        const codes = val.split(",").map((c) => parseInt(c.trim(), 10));
        return codes.every((c) => !isNaN(c) && validarActeco(c));
      },
      { message: "Codigo ACTECO debe ser de 6 digitos (ej: 620100)" }
    ),
  telefono: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  nro_resol: z.coerce.number().min(0, "Numero de resolucion debe ser 0 o mayor"),
  fch_resol: z.string().min(1, "Fecha de resolucion es requerida por el SII"),
  sii_ambiente: z.enum(["CERTIFICACION", "PRODUCCION"]),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface EmpresaFormProps {
  initialData?: Partial<EmpresaFormData>;
  empresaId?: string;
  onSuccess?: () => void;
}

// ===========================================
// COMPONENTE PRINCIPAL
// ===========================================

export function EmpresaForm({ initialData, empresaId, onSuccess }: EmpresaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rutFormatted, setRutFormatted] = useState(initialData?.rut || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, dirtyFields },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    mode: "onChange",
    defaultValues: {
      sii_ambiente: "CERTIFICACION",
      nro_resol: 0,
      ...initialData,
    },
  });

  const watchedRut = watch("rut");
  const watchedAmbiente = watch("sii_ambiente");

  // Formatear RUT mientras se escribe
  useEffect(() => {
    if (watchedRut && watchedRut !== rutFormatted.replace(/\./g, "").replace(/-/g, "")) {
      const formatted = formatearRUT(watchedRut);
      setRutFormatted(formatted);
    }
  }, [watchedRut]);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo numeros, puntos, guion y K
    const cleaned = value.replace(/[^0-9kK.-]/g, "").toUpperCase();
    setRutFormatted(cleaned);
    // Guardar sin formato para validacion
    const sinFormato = cleaned.replace(/\./g, "").replace(/-/g, "");
    setValue("rut", sinFormato, { shouldValidate: true });
  };

  const onSubmit = async (data: EmpresaFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Convertir acteco de string a array de numeros
      const actecoArray = data.acteco
        .split(",")
        .map((code) => parseInt(code.trim(), 10))
        .filter((code) => !isNaN(code));

      const requestData = {
        rut: formatearRUT(data.rut), // Enviar formateado
        razon_social: data.razon_social,
        giro: data.giro,
        direccion: data.direccion,
        comuna: data.comuna,
        ciudad: data.ciudad,
        acteco: actecoArray,
        telefono: data.telefono || undefined,
        email: data.email || undefined,
        nro_resol: data.nro_resol,
        fch_resol: data.fch_resol,
        sii_ambiente: data.sii_ambiente,
      };

      const result = empresaId
        ? await empresasService.actualizar(empresaId, requestData)
        : await empresasService.crear(requestData);

      if (!result.success) {
        setError(result.error?.message || "Error al guardar la empresa");
        return;
      }

      setSuccess(true);

      // Esperar un momento para mostrar el exito antes de redirigir
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = "/admin/empresas";
        }
      }, 1500);
    } catch (err) {
      setError("Error de conexion. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Mensaje de exito */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>Empresa guardada correctamente. Redirigiendo...</span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Seccion: Identificacion */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Identificacion de la Empresa</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rut" className="flex items-center gap-1">
              RUT Empresa <span className="text-red-500">*</span>
              {!errors.rut && dirtyFields.rut && (
                <CheckCircle2 className="h-3 w-3 text-green-500 ml-1" />
              )}
            </Label>
            <Input
              id="rut"
              placeholder="76.123.456-7"
              value={rutFormatted}
              onChange={handleRutChange}
              className={`transition-all duration-200 ${
                errors.rut
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : dirtyFields.rut
                    ? "border-green-300 focus:border-green-500 focus:ring-green-200"
                    : ""
              }`}
            />
            {errors.rut && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-3 w-3" />
                {errors.rut.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              RUT de la empresa emisora de documentos
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="razon_social" className="flex items-center gap-1">
              Razon Social <span className="text-red-500">*</span>
            </Label>
            <Input
              id="razon_social"
              placeholder="Mi Empresa SpA"
              {...register("razon_social")}
              className={`transition-all duration-200 ${
                errors.razon_social ? "border-red-300" : ""
              }`}
            />
            {errors.razon_social && (
              <p className="text-sm text-red-500 animate-in fade-in duration-200">
                {errors.razon_social.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="giro" className="flex items-center gap-1">
            Giro <span className="text-red-500">*</span>
          </Label>
          <Input
            id="giro"
            placeholder="Servicios de tecnologia e informatica"
            {...register("giro")}
            className={`transition-all duration-200 ${errors.giro ? "border-red-300" : ""}`}
          />
          {errors.giro && (
            <p className="text-sm text-red-500 animate-in fade-in duration-200">
              {errors.giro.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Actividad economica principal de la empresa
          </p>
        </div>
      </div>

      {/* Seccion: Ubicacion */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Ubicacion</span>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion" className="flex items-center gap-1">
            Direccion <span className="text-red-500">*</span>
          </Label>
          <Input
            id="direccion"
            placeholder="Av. Principal 123, Of. 456"
            {...register("direccion")}
            className={`transition-all duration-200 ${errors.direccion ? "border-red-300" : ""}`}
          />
          {errors.direccion && (
            <p className="text-sm text-red-500 animate-in fade-in duration-200">
              {errors.direccion.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="comuna" className="flex items-center gap-1">
              Comuna <span className="text-red-500">*</span>
            </Label>
            <Input
              id="comuna"
              placeholder="Santiago"
              {...register("comuna")}
              className={`transition-all duration-200 ${errors.comuna ? "border-red-300" : ""}`}
            />
            {errors.comuna && (
              <p className="text-sm text-red-500 animate-in fade-in duration-200">
                {errors.comuna.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciudad" className="flex items-center gap-1">
              Ciudad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ciudad"
              placeholder="Santiago"
              {...register("ciudad")}
              className={`transition-all duration-200 ${errors.ciudad ? "border-red-300" : ""}`}
            />
            {errors.ciudad && (
              <p className="text-sm text-red-500 animate-in fade-in duration-200">
                {errors.ciudad.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seccion: Contacto y Actividad */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Contacto y Actividad Economica</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="acteco" className="flex items-center gap-1">
              Codigo ACTECO <span className="text-red-500">*</span>
            </Label>
            <Input
              id="acteco"
              placeholder="620100"
              {...register("acteco")}
              className={`transition-all duration-200 font-mono ${
                errors.acteco ? "border-red-300" : ""
              }`}
            />
            {errors.acteco && (
              <p className="text-sm text-red-500 animate-in fade-in duration-200">
                {errors.acteco.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Codigo de actividad economica SII (6 digitos). Separar multiples con coma.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Telefono</Label>
            <Input
              id="telefono"
              placeholder="+56 9 1234 5678"
              {...register("telefono")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contacto@empresa.cl"
              {...register("email")}
              className={`transition-all duration-200 ${errors.email ? "border-red-300" : ""}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 animate-in fade-in duration-200">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seccion: Resolucion SII */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Resolucion SII</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nro_resol" className="flex items-center gap-1">
              Numero Resolucion <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nro_resol"
              type="number"
              min="0"
              placeholder="0"
              {...register("nro_resol")}
              className={`transition-all duration-200 ${errors.nro_resol ? "border-red-300" : ""}`}
            />
            {errors.nro_resol && (
              <p className="text-sm text-red-500 animate-in fade-in duration-200">
                {errors.nro_resol.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Para ambiente CERTIFICACION usar 0. Para PRODUCCION usar el numero real de la resolucion.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fch_resol" className="flex items-center gap-1">
              Fecha Resolucion <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fch_resol"
              type="date"
              {...register("fch_resol")}
              className={`transition-all duration-200 ${errors.fch_resol ? "border-red-300" : ""}`}
            />
            {errors.fch_resol && (
              <p className="text-sm text-red-500 animate-in fade-in duration-200">
                {errors.fch_resol.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seccion: Ambiente */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span>Ambiente SII</span>
        </div>

        <div className="flex gap-4">
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex-1 ${
              watchedAmbiente === "CERTIFICACION"
                ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950"
                : "border-muted hover:border-yellow-200"
            }`}
          >
            <input
              type="radio"
              value="CERTIFICACION"
              {...register("sii_ambiente")}
              className="w-4 h-4 text-yellow-600"
            />
            <div>
              <span className="font-medium">Certificacion</span>
              <p className="text-xs text-muted-foreground">
                Ambiente de pruebas del SII
              </p>
            </div>
          </label>

          <label
            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex-1 ${
              watchedAmbiente === "PRODUCCION"
                ? "border-green-400 bg-green-50 dark:bg-green-950"
                : "border-muted hover:border-green-200"
            }`}
          >
            <input
              type="radio"
              value="PRODUCCION"
              {...register("sii_ambiente")}
              className="w-4 h-4 text-green-600"
            />
            <div>
              <span className="font-medium">Produccion</span>
              <p className="text-xs text-muted-foreground">
                Documentos tributarios reales
              </p>
            </div>
          </label>
        </div>

        {watchedAmbiente === "PRODUCCION" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <strong>Atencion:</strong> En ambiente de produccion los documentos emitidos tienen
            validez tributaria ante el SII.
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-6 border-t">
        <Button
          type="submit"
          disabled={isLoading || success}
          className="transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Guardado
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Empresa
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isLoading}
          className="transition-all duration-200"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
