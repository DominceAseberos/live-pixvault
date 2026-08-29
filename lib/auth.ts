import type { ApiRequest } from "./api.js";

export type AuthCheck =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

export function requireServerSecret(req: ApiRequest, names: string[]): AuthCheck {
  const secret = names
    .map((name) => process.env[name]?.trim())
    .find((value): value is string => Boolean(value));

  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: "This server write endpoint is disabled until its secret is configured.",
    };
  }

  if (req.headers.authorization !== `Bearer ${secret}`) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true };
}
