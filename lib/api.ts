import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "node:http";

export type QueryValue = string | string[] | undefined;

export interface ApiRequest extends IncomingMessage {
  method?: string;
  headers: IncomingHttpHeaders;
  query?: Record<string, QueryValue>;
  body?: unknown;
}

export interface ApiResponse extends ServerResponse {
  status(code: number): ApiResponse;
  json(payload: unknown): ApiResponse;
}

export function queryString(req: ApiRequest, key: string, fallback = ""): string {
  const value = req.query?.[key];
  if (Array.isArray(value)) return value[0]?.trim() ?? fallback;
  return typeof value === "string" ? value.trim() : fallback;
}

export function queryInteger(
  req: ApiRequest,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = queryString(req, key);
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function errorMessage(error: unknown, fallback = "Internal server error"): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function clientIp(req: ApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (first) return first.split(",")[0]?.trim() || "unknown";
  const realIp = req.headers["x-real-ip"];
  return (Array.isArray(realIp) ? realIp[0] : realIp) || req.socket?.remoteAddress || "unknown";
}

export function setReadOnlyHeaders(res: ApiResponse, maxAgeSeconds = 0): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (maxAgeSeconds > 0) {
    res.setHeader("Cache-Control", `public, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds}`);
  } else {
    res.setHeader("Cache-Control", "no-store");
  }
}
