/**
 * Utilidades para manejo de cookies de autenticacion
 * Cookies httpOnly para maxima seguridad
 */

export const AUTH_COOKIE_NAME = "sii_session";
export const REFRESH_COOKIE_NAME = "sii_refresh";

// Duracion de cookies
const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1 hora en segundos
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias en segundos

interface CookieOptions {
  maxAge?: number;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Genera el string de una cookie con sus opciones
 */
function buildCookieString(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const {
    maxAge,
    path = "/",
    secure = true,
    httpOnly = true,
    sameSite = "Lax",
  } = options;

  let cookie = `${name}=${encodeURIComponent(value)}`;
  cookie += `; Path=${path}`;
  cookie += `; SameSite=${sameSite}`;

  if (maxAge !== undefined) {
    cookie += `; Max-Age=${maxAge}`;
  }

  if (secure) {
    cookie += "; Secure";
  }

  if (httpOnly) {
    cookie += "; HttpOnly";
  }

  return cookie;
}

/**
 * Crea las cookies de sesion con los tokens
 * Retorna un array de strings de cookies para Set-Cookie headers
 */
export function createSessionCookies(
  accessToken: string,
  refreshToken: string,
  isLocalhost = false
): string[] {
  const secure = !isLocalhost;

  const accessCookie = buildCookieString(AUTH_COOKIE_NAME, accessToken, {
    maxAge: ACCESS_TOKEN_MAX_AGE,
    secure,
    httpOnly: true,
    sameSite: "Lax",
  });

  const refreshCookie = buildCookieString(REFRESH_COOKIE_NAME, refreshToken, {
    maxAge: REFRESH_TOKEN_MAX_AGE,
    secure,
    httpOnly: true,
    sameSite: "Lax",
  });

  return [accessCookie, refreshCookie];
}

/**
 * Parsea las cookies del header Cookie
 */
export function parseCookies(
  cookieHeader: string | null
): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce(
    (cookies, cookie) => {
      const [name, ...valueParts] = cookie.trim().split("=");
      if (name) {
        cookies[name] = decodeURIComponent(valueParts.join("="));
      }
      return cookies;
    },
    {} as Record<string, string>
  );
}

/**
 * Extrae los tokens de sesion del header Cookie
 */
export function parseSessionCookies(cookieHeader: string | null): {
  accessToken?: string;
  refreshToken?: string;
} {
  const cookies = parseCookies(cookieHeader);
  return {
    accessToken: cookies[AUTH_COOKIE_NAME],
    refreshToken: cookies[REFRESH_COOKIE_NAME],
  };
}

/**
 * Genera cookies para limpiar la sesion (logout)
 * Retorna cookies con Max-Age=0 para eliminarlas
 */
export function clearSessionCookies(isLocalhost = false): string[] {
  const secure = !isLocalhost;

  const accessCookie = buildCookieString(AUTH_COOKIE_NAME, "", {
    maxAge: 0,
    secure,
    httpOnly: true,
    sameSite: "Lax",
  });

  const refreshCookie = buildCookieString(REFRESH_COOKIE_NAME, "", {
    maxAge: 0,
    secure,
    httpOnly: true,
    sameSite: "Lax",
  });

  return [accessCookie, refreshCookie];
}

/**
 * Verifica si el request viene de localhost
 */
export function isLocalhostRequest(request: Request): boolean {
  const url = new URL(request.url);
  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "::1"
  );
}
