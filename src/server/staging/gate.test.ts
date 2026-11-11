import { describe, expect, it } from "vitest";
import { STAGING_USER, stagingGate, withStagingHeaders } from "./gate";

const PASS = "rahasia-staging";
const basic = (user: string, pass: string) =>
  `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
const req = (path: string, auth?: string, method = "GET") =>
  new Request(`https://dev.wumy.my.id${path}`, {
    method,
    headers: auth ? { authorization: auth } : {},
  });

describe("stagingGate", () => {
  it("is disabled when no password is configured (production)", () => {
    expect(stagingGate(req("/"), undefined)).toBeNull();
    expect(stagingGate(req("/"), "   ")).toBeNull();
  });

  it("asks for credentials when none are sent", () => {
    const res = stagingGate(req("/order"), PASS);
    expect(res?.status).toBe(401);
    expect(res?.headers.get("www-authenticate")).toContain("Basic");
    expect(res?.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("rejects a wrong password or user and malformed headers", () => {
    expect(stagingGate(req("/", basic(STAGING_USER, "salah")), PASS)?.status).toBe(401);
    expect(stagingGate(req("/", basic("admin", PASS)), PASS)?.status).toBe(401);
    expect(stagingGate(req("/", "Basic !!!"), PASS)?.status).toBe(401);
    expect(stagingGate(req("/", "Bearer x"), PASS)?.status).toBe(401);
  });

  it("lets the right credentials through", () => {
    expect(stagingGate(req("/dashboard", basic(STAGING_USER, PASS)), PASS)).toBeNull();
  });

  it("keeps the DOKU webhook reachable without a password", () => {
    expect(stagingGate(req("/api/webhooks/doku", undefined, "POST"), PASS)).toBeNull();
  });

  it("does not exempt look-alike paths", () => {
    expect(stagingGate(req("/api/webhooks/doku/x"), PASS)?.status).toBe(401);
    expect(stagingGate(req("/api/webhooks/dokux"), PASS)?.status).toBe(401);
  });
});

describe("withStagingHeaders", () => {
  it("adds noindex only when staging is enabled", async () => {
    const on = withStagingHeaders(new Response("ok", { status: 200 }), PASS);
    expect(on.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(await on.text()).toBe("ok");
    const off = withStagingHeaders(new Response("ok"), undefined);
    expect(off.headers.get("x-robots-tag")).toBeNull();
  });
});
