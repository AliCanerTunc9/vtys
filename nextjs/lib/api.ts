import { revalidatePath } from "next/cache";
import { DataError } from "./data";
import { isObject } from "./validation";

// Helpers shared by the route handlers in app/api.
//
// Responses are JSON. Errors always have the shape { "error": "message" }:
//   400 invalid input, 404 not found, 409 blocked by a database rule,
//   500 unexpected server error.
//
// TODO: The API has no authentication yet; anyone who can reach the server
// can change data. Add a check here before deploying beyond local use.

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export function apiError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

/** Thrown inside a handler to return an error response. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Runs a handler and turns thrown errors into JSON error responses. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ApiError) return apiError(e.message, e.status);
    if (e instanceof DataError) return apiError(e.message, e.status);
    console.error("[api]", e);
    return apiError("Sunucu hatası.", 500);
  }
}

/** Reads a JSON object body, or throws a 400 error. */
export async function readBody(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError("İstek gövdesi geçerli bir JSON olmalı.", 400);
  }
  if (!isObject(body)) throw new ApiError("İstek gövdesi bir JSON nesnesi olmalı.", 400);
  return body;
}

/** Parses a numeric id from the URL, or throws a 404 error. */
export function parseId(value: string, what: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new ApiError(`${what} bulunamadı.`, 404);
  return id;
}

/** Unwraps a validation result, or throws a 400 error. */
export function valid<T>(result: { ok: true; value: T } | { ok: false; error: string }): T {
  if (!result.ok) throw new ApiError(result.error, 400);
  return result.value;
}

/** Refreshes the site's pages after a change made through the API. */
export function refreshSite() {
  revalidatePath("/", "layout");
}
