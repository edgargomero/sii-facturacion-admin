import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { empresasService } from "@/lib/sii-api";

const empresaSchema = z.object({
  rut: z.string().min(9, "RUT invalido").max(12),
  razon_social: z.string().min(3, "Razon social requerida"),
  giro: z.string().min(3, "Giro requerido"),
  direccion: z.string().min(5, "Direccion requerida"),
  comuna: z.string().min(2, "Comuna requerida"),
  ciudad: z.string().min(2, "Ciudad requerida"),
  acteco: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
  resolucion_numero: z.coerce.number().min(0, "Numero de resolucion requerido"),
  resolucion_fecha: z.string().min(1, "Fecha de resolucion requerida"),
  ambiente: z.enum(["CERTIFICACION", "PRODUCCION"]),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

interface EmpresaFormProps {
  initialData?: Partial<EmpresaFormData>;
  empresaId?: string; // Si se proporciona, es modo edicion
  onSuccess?: () => void;
}

export function EmpresaForm({ initialData, empresaId, onSuccess }: EmpresaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      ambiente: "CERTIFICACION",
      ...initialData,
    },
  });

  const onSubmit = async (data: EmpresaFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestData = {
        rut: data.rut,
        razon_social: data.razon_social,
        giro: data.giro,
        direccion: data.direccion,
        comuna: data.comuna,
        ciudad: data.ciudad,
        acteco: data.acteco || undefined,
        telefono: data.telefono || undefined,
        email: data.email || undefined,
        resolucion_numero: data.resolucion_numero,
        resolucion_fecha: data.resolucion_fecha,
        ambiente: data.ambiente,
      };

      const result = empresaId
        ? await empresasService.actualizar(empresaId, requestData)
        : await empresasService.crear(requestData);

      if (!result.success) {
        setError(result.error?.message || "Error al guardar la empresa");
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = "/admin/empresas";
      }
    } catch (err) {
      setError("Error al guardar la empresa");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rut">RUT Empresa *</Label>
          <Input
            id="rut"
            placeholder="76.XXX.XXX-X"
            {...register("rut")}
          />
          {errors.rut && (
            <p className="text-sm text-red-500">{errors.rut.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="razon_social">Razon Social *</Label>
          <Input
            id="razon_social"
            placeholder="Mi Empresa SpA"
            {...register("razon_social")}
          />
          {errors.razon_social && (
            <p className="text-sm text-red-500">{errors.razon_social.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="giro">Giro *</Label>
        <Input
          id="giro"
          placeholder="Servicios de software"
          {...register("giro")}
        />
        {errors.giro && (
          <p className="text-sm text-red-500">{errors.giro.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Direccion *</Label>
        <Input
          id="direccion"
          placeholder="Av. Principal 123, Of. 456"
          {...register("direccion")}
        />
        {errors.direccion && (
          <p className="text-sm text-red-500">{errors.direccion.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="comuna">Comuna *</Label>
          <Input
            id="comuna"
            placeholder="Santiago"
            {...register("comuna")}
          />
          {errors.comuna && (
            <p className="text-sm text-red-500">{errors.comuna.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ciudad">Ciudad *</Label>
          <Input
            id="ciudad"
            placeholder="Santiago"
            {...register("ciudad")}
          />
          {errors.ciudad && (
            <p className="text-sm text-red-500">{errors.ciudad.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="acteco">Codigo Actividad (ACTECO)</Label>
          <Input
            id="acteco"
            placeholder="620100"
            {...register("acteco")}
          />
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
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Resolucion SII</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="resolucion_numero">Numero Resolucion *</Label>
            <Input
              id="resolucion_numero"
              type="number"
              min="0"
              placeholder="0"
              {...register("resolucion_numero")}
            />
            <p className="text-xs text-muted-foreground">
              Para CERTIFICACION usar 0. Para PRODUCCION usar el numero real.
            </p>
            {errors.resolucion_numero && (
              <p className="text-sm text-red-500">{errors.resolucion_numero.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolucion_fecha">Fecha Resolucion *</Label>
            <Input
              id="resolucion_fecha"
              type="date"
              {...register("resolucion_fecha")}
            />
            {errors.resolucion_fecha && (
              <p className="text-sm text-red-500">{errors.resolucion_fecha.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Ambiente</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="CERTIFICACION"
              {...register("ambiente")}
              className="w-4 h-4"
            />
            <span>Certificacion (Pruebas)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="PRODUCCION"
              {...register("ambiente")}
              className="w-4 h-4"
            />
            <span>Produccion</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Empresa
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
