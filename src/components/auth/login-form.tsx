/**
 * Formulario de Login
 * Usa React Hook Form + Zod para validacion
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, LogIn, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schema de validacion
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingrese un email valido"),
  password: z
    .string()
    .min(1, "La contrasena es requerida")
    .min(6, "La contrasena debe tener al menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  returnUrl?: string;
  initialError?: string;
}

export function LoginForm({ returnUrl, initialError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error?.message || "Error al iniciar sesion. Verifique sus credenciales."
        );
        setIsLoading(false);
        return;
      }

      // Login exitoso, redirigir
      const redirectUrl = returnUrl || "/admin";
      window.location.href = redirectUrl;
    } catch {
      setError("Error de conexion. Por favor intente nuevamente.");
      setIsLoading(false);
    }
  }

  // Mapear errores de URL a mensajes amigables
  const getErrorMessage = (errorCode: string | null): string | null => {
    if (!errorCode) return null;
    const errorMessages: Record<string, string> = {
      session_expired: "Su sesion ha expirado. Por favor inicie sesion nuevamente.",
      invalid_session: "Sesion invalida. Por favor inicie sesion nuevamente.",
      server_error: "Error del servidor. Por favor intente nuevamente.",
      access_denied: "No tiene permisos para acceder a esa pagina.",
    };
    return errorMessages[errorCode] || null;
  };

  const displayError = error || getErrorMessage(initialError || null);

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Iniciar Sesion</h1>
        <p className="text-muted-foreground">
          Ingrese sus credenciales para acceder al sistema
        </p>
      </div>

      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="usuario@empresa.cl"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contrasena</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="********"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesion...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesion
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
