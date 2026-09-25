/**
 * API Configuration & Native Environment Bridge for Good Life
 * Ensures 100% seamless connectivity between Web, Mobile APK (Capacitor), and Cloud Backend.
 */

// Shared Production Cloud URL for Good Life Applet
export const LIVE_BACKEND_URL = "https://ais-pre-robxl2sbg7riqqssv7s2mt-403027633480.asia-southeast1.run.app";

/**
 * Checks whether the current runtime environment is a native mobile container (Capacitor/Cordova/Android WebView)
 */
export function isNativeMobileEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  const origin = window.location.origin || "";
  const href = window.location.href || "";
  
  if (
    origin.startsWith("capacitor://") ||
    origin.startsWith("ionic://") ||
    origin.startsWith("file://") ||
    href.startsWith("file://") ||
    (window as any).Capacitor?.isNativePlatform?.() === true ||
    (window as any).Capacitor?.getPlatform?.() === "android" ||
    (window as any).Capacitor?.getPlatform?.() === "ios"
  ) {
    return true;
  }

  // Also check if running in localhost without port 3000 (Capacitor Android default WebView origin is http://localhost)
  if (origin === "http://localhost" || origin === "https://localhost") {
    return true;
  }

  return false;
}

/**
 * Converts a relative /api/... path into a fully qualified URL when running in mobile APK.
 * In standard browser web environments, returns the relative path untouched.
 */
export function resolveApiUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (isNativeMobileEnvironment()) {
    return `${LIVE_BACKEND_URL}${cleanPath}`;
  }
  return cleanPath;
}

/**
 * Creates an EventSource instance that automatically resolves to the Cloud Backend in APK environments.
 */
export function createSafeEventSource(path: string): EventSource | null {
  if (typeof window === "undefined" || !("EventSource" in window)) {
    return null;
  }
  try {
    const fullUrl = resolveApiUrl(path);
    return new EventSource(fullUrl);
  } catch (err) {
    console.warn("Could not create EventSource for path:", path, err);
    return null;
  }
}

/**
 * Installs global transparent fetch interceptor so any fetch('/api/...') from any component
 * or service automatically resolves to the shared cloud backend in APK environments.
 */
export function installGlobalFetchInterceptor(): void {
  if (typeof window === "undefined" || (window as any).__goodlife_fetch_installed) {
    return;
  }

  // In standard web browser environments, relative paths (/api/...) are handled directly by the host server.
  // We only intercept fetch in native mobile environments (e.g. Capacitor / Android APK) where relative requests
  // would otherwise hit capacitor://localhost or file:// and fail.
  if (!isNativeMobileEnvironment()) {
    return;
  }

  try {
    const originalFetch = window.fetch ? window.fetch.bind(window) : undefined;
    if (!originalFetch) {
      return;
    }

    const interceptedFetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      try {
        if (typeof input === "string") {
          if (input.startsWith("/api/") || input.startsWith("/api?")) {
            const resolved = resolveApiUrl(input);
            return originalFetch(resolved, init);
          }
        } else if (input instanceof URL) {
          if (input.pathname.startsWith("/api/")) {
            const resolved = resolveApiUrl(input.pathname + input.search);
            return originalFetch(resolved, init);
          }
        }
      } catch (err) {
        console.warn("Fetch interceptor URL resolution warning:", err);
      }
      return originalFetch(input, init);
    };

    // Safely define property to avoid "Cannot set property fetch of #<Window> which has only a getter"
    try {
      Object.defineProperty(window, 'fetch', {
        value: interceptedFetch,
        writable: true,
        configurable: true,
      });
      (window as any).__goodlife_fetch_installed = true;
    } catch {
      try {
        (window as any).fetch = interceptedFetch;
        (window as any).__goodlife_fetch_installed = true;
      } catch (assignErr) {
        console.warn("Unable to intercept window.fetch:", assignErr);
      }
    }
  } catch (err) {
    console.warn("Could not install global fetch interceptor:", err);
  }
}

// Auto-install on module import in browser
if (typeof window !== "undefined") {
  try {
    installGlobalFetchInterceptor();
  } catch (err) {
    console.warn("Global fetch interceptor initialization error:", err);
  }
}
