import { CheckoutError } from "./checkout";
import { DokuError } from "./doku-client";

/**
 * Maps a checkout failure to the Error the server function throws to the client.
 * Unknown errors are logged server-side and replaced with a generic message so
 * internal details (DB errors, stack traces) never reach the browser.
 */
export function toClientError(err: unknown): Error {
  if (err instanceof CheckoutError) return new Error(`${err.code}: ${err.message}`);
  if (err instanceof DokuError) return new Error(`Payment provider error: ${err.message}`);
  console.error("checkout: unexpected error", {
    error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
  });
  return new Error("Unexpected error");
}
