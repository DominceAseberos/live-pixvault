export class HttpError extends Error {
  constructor(message: string, public status?: number) { super(message); this.name = "HttpError"; }
}

export async function fetchJson<T>(url: string, init: RequestInit = {}, timeoutMs = 12_000): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  init.signal?.addEventListener("abort", abort, { once: true });
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new HttpError(`Request failed (${response.status})`, response.status);
    return await response.json() as T;
  } catch (error) {
    if (controller.signal.aborted) throw new HttpError("Request timed out or was cancelled.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
    init.signal?.removeEventListener("abort", abort);
  }
}
