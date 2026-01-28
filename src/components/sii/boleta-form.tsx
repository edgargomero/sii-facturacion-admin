import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Plus, Trash2, FileText } from "lucide-react";
import { dteService, empresasService } from "@/lib/sii-api";
import type { Empresa } from "@/lib/sii-api";

const detalleSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(80, "Maximo 80 caracteres"),
  cantidad: z.coerce.number().min(0.01, "Cantidad debe ser mayor a 0"),
  precio_unitario: z.coerce.number().min(0, "Precio debe ser mayor o igual a 0"),
  es_exento: z.boolean().default(false),
});

const receptorBoletaSchema = z.object({
  rut: z.string().optional(),
  razon_social: z.string().optional(),
}).optional();

const boletaSchema = z.object({
  empresa_id: z.string().min(1, "Seleccione una empresa"),
  receptor: receptorBoletaSchema,
  monto_bruto: z.boolean().default(false),
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
    setValue,
    formState: { errors },
  } = useForm<BoletaFormData>({
    resolver: zodResolver(boletaSchema),
    defaultValues: {
      empresa_id: empresaId || "",
      monto_bruto: false,
      detalles: [{ nombre: "", cantidad: 1, precio_unitario: 0, es_exento: false }],
    },
  });

  const montoBruto = watch("monto_bruto");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "detalles",
  });

  const detalles = watch("detalles");

  // Calcular total (boletas pueden incluir o no IVA segun monto_bruto)
  const calcularTotales = () => {
    let afecto = 0;
    let exento = 0;
    detalles?.forEach((d) => {
      const subtotal = (d.cantidad || 0) * (d.precio_unitario || 0);
      if (d.es_exento) {
        exento += subtotal;
      } else {
        afecto += subtotal;
      }
    });

    // Si monto_bruto es true, los precios ya incluyen IVA
    // Si es false, hay que agregar IVA al monto afecto
    let total: number;
    let iva: number;
    if (montoBruto) {
      // Precios incluyen IVA - calcular IVA inverso
      iva = Math.round(afecto - (afecto / 1.19));
      total = Math.round(afecto + exento);
    } else {
      // Precios netos - agregar IVA
      iva = Math.round(afecto * 0.19);
      total = Math.round(afecto + iva + exento);
    }

    return { afecto: Math.round(afecto), exento: Math.round(exento), iva, total };
  };

  const totales = calcularTotales();

  const onSubmit = async (data: BoletaFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Preparar receptor solo si tiene datos
      const receptor = data.receptor?.rut || data.receptor?.razon_social
        ? {
            rut: data.receptor?.rut || undefined,
            razon_social: data.receptor?.razon_social || undefined,
          }
        : undefined;

      const result = await dteService.generarBoleta({
        empresa_id: data.empresa_id,
        receptor,
        monto_bruto: data.monto_bruto,
        detalles: data.detalles.map((d) => ({
          nombre: d.nombre,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          es_exento: d.es_exento,
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

      {/* Opciones de boleta */}
      <div className="rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold">Opciones</h3>
        <div className="flex items-center gap-3">
          <Checkbox
            id="monto_bruto"
            checked={montoBruto}
            onCheckedChange={(checked) => setValue("monto_bruto", checked === true)}
          />
          <div>
            <Label htmlFor="monto_bruto" className="cursor-pointer">
              Precios incluyen IVA
            </Label>
            <p className="text-xs text-muted-foreground">
              Marcar si los precios ingresados ya incluyen el 19% de IVA
            </p>
          </div>
        </div>
      </div>

      {/* Receptor opcional */}
      <div className="rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold">Receptor (Opcional)</h3>
        <p className="text-sm text-muted-foreground">
          Las boletas electronicas no requieren datos del receptor, pero puede agregarlos si lo desea.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="receptor_rut">RUT</Label>
            <Input
              id="receptor_rut"
              placeholder="12.345.678-9"
              {...register("receptor.rut")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receptor_razon_social">Razon Social</Label>
            <Input
              id="receptor_razon_social"
              placeholder="Nombre del cliente"
              {...register("receptor.razon_social")}
            />
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Detalle de Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ nombre: "", cantidad: 1, precio_unitario: 0, es_exento: false })}
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
              <div className="md:col-span-5 space-y-1">
                <Label className="text-xs">Descripcion *</Label>
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
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Precio</Label>
                <Input
                  type="number"
                  {...register(`detalles.${index}.precio_unitario`)}
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 pb-2">
                <Checkbox
                  id={`detalles.${index}.es_exento`}
                  checked={watch(`detalles.${index}.es_exento`)}
                  onCheckedChange={(checked) => setValue(`detalles.${index}.es_exento`, checked === true)}
                />
                <Label htmlFor={`detalles.${index}.es_exento`} className="text-xs cursor-pointer">
                  Exento
                </Label>
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

        {/* Totales */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              {totales.exento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exento:</span>
                  <span>{formatMoney(totales.exento)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (19%):</span>
                <span>{formatMoney(totales.iva)}</span>
              </div>
              <div className="flex justify-between font-semibold text-xl border-t pt-2">
                <span>Total:</span>
                <span>{formatMoney(totales.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {montoBruto ? "Precios con IVA incluido" : "IVA agregado a precios netos"}
              </p>
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
