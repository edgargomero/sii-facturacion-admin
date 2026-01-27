import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Plus, Trash2, FileText } from "lucide-react";
import { dteService, empresasService } from "@/lib/sii-api";
import type { Empresa } from "@/lib/sii-api";

const detalleSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  cantidad: z.coerce.number().min(0.01, "Cantidad debe ser mayor a 0"),
  precio_unitario: z.coerce.number().min(0, "Precio debe ser mayor o igual a 0"),
});

const boletaSchema = z.object({
  empresa_id: z.string().min(1, "Seleccione una empresa"),
  fecha_emision: z.string().optional(),
  detalles: z.array(detalleSchema).min(1, "Agregue al menos un item"),
});

type BoletaFormData = z.infer<typeof boletaSchema>;

interface BoletaFormProps {
  empresaId?: string | null;
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
};

export function BoletaForm({ empresaId }: BoletaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(true);

  // Cargar lista de empresas
  useEffect(() => {
    const loadEmpresas = async () => {
      setIsLoadingEmpresas(true);
      try {
        const result = await empresasService.listar();
        if (result.success && result.data) {
          setEmpresas(result.data);
        }
      } catch (err) {
        console.error("Error cargando empresas:", err);
      } finally {
        setIsLoadingEmpresas(false);
      }
    };
    loadEmpresas();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BoletaFormData>({
    resolver: zodResolver(boletaSchema),
    defaultValues: {
      empresa_id: empresaId || "",
      detalles: [{ nombre: "", cantidad: 1, precio_unitario: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const detalles = watch("detalles");

  // Calcular total (boletas incluyen IVA)
  const calcularTotal = () => {
    let total = 0;
    detalles?.forEach((d) => {
      total += (d.cantidad || 0) * (d.precio_unitario || 0);
    });
    return Math.round(total);
  };

  const total = calcularTotal();

  const onSubmit = async (data: BoletaFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dteService.generarBoleta({
        empresa_id: data.empresa_id,
        detalles: data.detalles.map((d) => ({
          nombre: d.nombre,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
        })),
        fecha_emision: data.fecha_emision || undefined,
      });

      if (!result.success) {
        setError(result.error?.message || "Error al generar la boleta");
        return;
      }

      window.location.href = "/admin/dte";
    } catch (err) {
      setError("Error al generar la boleta");
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

      {/* Empresa emisora */}
      <div className="rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold">Empresa Emisora</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="empresa_id">Empresa *</Label>
            {isLoadingEmpresas ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando empresas...
              </div>
            ) : empresas.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No hay empresas registradas.{" "}
                <a href="/admin/empresas/nueva" className="text-primary hover:underline">
                  Crear una empresa
                </a>
              </p>
            ) : (
              <select
                id="empresa_id"
                {...register("empresa_id")}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Seleccione una empresa</option>
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.rut} - {empresa.razon_social}
                  </option>
                ))}
              </select>
            )}
            {errors.empresa_id && (
              <p className="text-sm text-red-500">{errors.empresa_id.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_emision">Fecha Emision</Label>
            <Input
              id="fecha_emision"
              type="date"
              {...register("fecha_emision")}
            />
            <p className="text-xs text-muted-foreground">Dejar vacio para fecha actual</p>
          </div>
        </div>
      </div>

      {/* Info boleta */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Las boletas electronicas no requieren datos del receptor. Los montos incluyen IVA.
        </p>
      </div>

      {/* Detalles */}
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Detalle de Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ nombre: "", cantidad: 1, precio_unitario: 0 })}
          >
            <Plus className="mr-1 h-4 w-4" /> Agregar Item
          </Button>
        </div>

        {errors.detalles && (
          <p className="text-sm text-red-500">{errors.detalles.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-12 items-end p-3 bg-muted/30 rounded-lg">
              <div className="md:col-span-6 space-y-1">
                <Label className="text-xs">Descripcion</Label>
                <Input
                  placeholder="Nombre del producto/servicio"
                  {...register(`detalles.${index}.nombre`)}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Cantidad</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register(`detalles.${index}.cantidad`)}
                />
              </div>
              <div className="md:col-span-3 space-y-1">
                <Label className="text-xs">Precio (IVA incl.)</Label>
                <Input
                  type="number"
                  {...register(`detalles.${index}.precio_unitario`)}
                />
              </div>
              <div className="md:col-span-1">
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between font-semibold text-xl">
                <span>Total:</span>
                <span>{formatMoney(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-right mt-1">IVA incluido</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generar Boleta
            </>
          )}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
