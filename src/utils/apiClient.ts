/**
 * Resilient API Client with Request Deduplication, Timeout Guards,
 * Offline Detection, and Automatic Exponential Backoff Retries.
 */

export interface ApiClientOptions {
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  deduplicate?: boolean;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status?: number;
  isRateLimit?: boolean;
  isTimeout?: boolean;
  isOffline?: boolean;
  data?: any;

  constructor(message: string, options?: { status?: number; isRateLimit?: boolean; isTimeout?: boolean; isOffline?: boolean; data?: any }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.isRateLimit = options?.isRateLimit;
    this.isTimeout = options?.isTimeout;
    this.isOffline = options?.isOffline;
    this.data = options?.data;
  }
}

// In-flight request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

export function isOnline(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.onLine === "boolean" ? navigator.onLine : true;
}

export function subscribeNetworkStatus(callback: (online: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

export async function safeFetch<T = any>(
  url: string,
  init?: RequestInit,
  options?: ApiClientOptions
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? 25000;
  const maxRetries = options?.maxRetries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 800;
  const deduplicate = options?.deduplicate ?? (init?.method === "POST");

  // Immediate Offline Guard
  if (!isOnline()) {
    throw new ApiError(
      "Internet connection appears to be offline. Please verify your connection.",
      { isOffline: true }
    );
  }

  // Request Deduplication Key
  const dedupKey = deduplicate
    ? `${init?.method || "GET"}:${url}:${typeof init?.body === "string" ? init.body : ""}`
    : null;

  if (dedupKey && pendingRequests.has(dedupKey)) {
    return pendingRequests.get(dedupKey)!;
  }

  const executionPromise = (async () => {
    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      const controller = new AbortController();
      let timeoutId: any = null;

      // Setup timeout guard
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new ApiError(`Request timed out after ${timeoutMs / 1000}s. Server may be busy.`, { isTimeout: true }));
        }, timeoutMs);
      });

      // Chain user-provided abort signal if present
      if (options?.signal) {
        options.signal.addEventListener("abort", () => {
          controller.abort();
          clearTimeout(timeoutId);
        });
      }

      try {
        const fetchPromise = fetch(url, {
          ...init,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...init?.headers,
          },
        });

        const res = await Promise.race([fetchPromise, timeoutPromise]);
        clearTimeout(timeoutId);

        // Check for Rate Limit (HTTP 429) or Server Unavailable (HTTP 502/503/504)
        if (res.status === 429 || res.status === 502 || res.status === 503 || res.status === 504) {
          const isRateLimit = res.status === 429;
          const retryAfterHeader = res.headers.get("Retry-After");
          const retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 0;
          
          let errorData: any = {};
          try {
            errorData = await res.json();
          } catch {
            errorData = { error: res.statusText };
          }

          if (attempt < maxRetries) {
            attempt++;
            const backoff = (retryAfterSec ? retryAfterSec * 1000 : baseDelayMs * Math.pow(2, attempt - 1)) + Math.random() * 300;
            console.warn(`[API Backoff] Status ${res.status} on ${url}. Retrying in ${Math.round(backoff)}ms (Attempt ${attempt}/${maxRetries})...`);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }

          throw new ApiError(
            errorData.error || (isRateLimit ? "Rate limit reached. Please wait a moment." : "Service is temporarily unavailable."),
            { status: res.status, isRateLimit, data: errorData }
          );
        }

        // Parse response safely
        let data: any = null;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = await res.text();
        }

        if (!res.ok) {
          const errorMessage = (typeof data === "object" && data?.error) ? data.error : `HTTP Error ${res.status}: ${res.statusText}`;
          throw new ApiError(errorMessage, { status: res.status, data });
        }

        return data as T;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;

        // If client aborted deliberately, don't retry
        if (options?.signal?.aborted) {
          throw new ApiError("Request was cancelled.", { isTimeout: false });
        }

        // Retry on network errors or timeouts if attempts remain
        const isNetworkFailure = err.name === "TypeError" || err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError");
        const isTimeout = err.isTimeout || err?.name === "AbortError";

        if ((isNetworkFailure || isTimeout) && attempt < maxRetries) {
          attempt++;
          const backoff = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 300;
          console.warn(`[Network Retry] Transient issue on ${url}. Retrying in ${Math.round(backoff)}ms (Attempt ${attempt}/${maxRetries})...`);
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        break;
      }
    }

    throw lastError || new ApiError("Failed to complete network request.");
  })();

  if (dedupKey) {
    pendingRequests.set(dedupKey, executionPromise);
    executionPromise.finally(() => {
      pendingRequests.delete(dedupKey);
    });
  }

  return executionPromise;
}

export async function apiPost<T = any>(url: string, body: any, options?: ApiClientOptions): Promise<T> {
  return safeFetch<T>(
    url,
    {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    },
    options
  );
}

export async function apiGet<T = any>(url: string, options?: ApiClientOptions): Promise<T> {
  return safeFetch<T>(
    url,
    {
      method: "GET",
    },
    options
  );
}
