/**
 * Context de autenticacion para React
 * Provee informacion del usuario y funciones de auth
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { SupabaseUser, Perfil } from "@/lib/sii-api/types";
import type { Role } from "./permissions";

interface AuthContextType {
  user: SupabaseUser | null;
  perfil: Perfil | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  empresaId: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: SupabaseUser | null;
  initialPerfil?: Perfil | null;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialPerfil = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(initialUser);
  const [perfil, setPerfil] = useState<Perfil | null>(initialPerfil);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user && !!perfil;
  const role = perfil?.rol || null;
  const empresaId = perfil?.empresa_id || null;

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      setUser(null);
      setPerfil(null);
      // Redirigir a login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Aun en caso de error, redirigir a login
      window.location.href = "/login";
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (data.success && data.data) {
        setUser(data.data.user);
        setPerfil(data.data.perfil);
      } else {
        setUser(null);
        setPerfil(null);
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      setUser(null);
      setPerfil(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        isAuthenticated,
        isLoading,
        role,
        empresaId,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Hook para verificar si el usuario tiene un rol especifico
 */
export function useRole(): Role | null {
  const { role } = useAuth();
  return role;
}

/**
 * Hook para verificar si el usuario es admin
 */
export function useIsAdmin(): boolean {
  const { role } = useAuth();
  return role === "admin";
}

/**
 * Hook para obtener el empresa_id del usuario
 */
export function useEmpresaId(): string | null {
  const { empresaId } = useAuth();
  return empresaId;
}
