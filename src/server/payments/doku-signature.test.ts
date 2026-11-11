import { describe, expect, it } from "vitest";
import { buildDigest, buildSignature, dokuTimestamp, verifySignature } from "./doku-signature";

const CLIENT_ID = "MCH-0001-10791114622547";
const REQUEST_ID = "cc682442-6c22-493e-8121-b9ef6b3fa728";
const TIMESTAMP = "2020-08-11T08:45:42Z";
const TARGET = "/checkout/v1/payment";
const SECRET = "SK-test";
const BODY = '{"a":1}';

// Literals computed independently with python3 hashlib/hmac/base64.
const DIGEST = "AVq9f1zFei3ZS3WQ8ErYCEJzkF7jPsXOvq5iJ2qX+GI=";
const POST_SIGNATURE = "HMACSHA256=d5lyBBhute82ky3AxcIFAxY6mFOWDSf5mRwTTPJuibQ=";
const GET_SIGNATURE = "HMACSHA256=O8K2HW/wjITZAZpogAacGa2h3v6aFdadH5fOaRGCJb0=";

function signedHeaders(body = BODY, overrides: Record<string, string> = {}) {
  const signature = buildSignature(
    {
      clientId: CLIENT_ID,
      requestId: REQUEST_ID,
      timestamp: TIMESTAMP,
      target: TARGET,
      digest: buildDigest(body),
    },
    SECRET,
  );
  return new Headers({
    "Client-Id": CLIENT_ID,
    "Request-Id": REQUEST_ID,
    "Request-Timestamp": TIMESTAMP,
    Signature: signature,
    ...overrides,
  });
}

describe("buildDigest", () => {
  it("is base64(sha256(body))", () => {
    expect(buildDigest(BODY)).toBe(DIGEST);
  });
});

describe("buildSignature", () => {
  it("signs a POST with the Digest line", () => {
    expect(
      buildSignature(
        {
          clientId: CLIENT_ID,
          requestId: REQUEST_ID,
          timestamp: TIMESTAMP,
          target: TARGET,
          digest: buildDigest(BODY),
        },
        SECRET,
      ),
    ).toBe(POST_SIGNATURE);
  });

  it("signs a GET without the Digest line", () => {
    expect(
      buildSignature(
        {
          clientId: CLIENT_ID,
          requestId: REQUEST_ID,
          timestamp: TIMESTAMP,
          target: TARGET,
        },
        SECRET,
      ),
    ).toBe(GET_SIGNATURE);
  });
});

describe("verifySignature", () => {
  it("accepts a correctly signed request", () => {
    expect(verifySignature(signedHeaders(), BODY, TARGET, SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    expect(verifySignature(signedHeaders(), '{"a":2}', TARGET, SECRET)).toBe(false);
  });

  it("rejects the wrong secret", () => {
    expect(verifySignature(signedHeaders(), BODY, TARGET, "SK-other")).toBe(false);
  });

  it("rejects a different target", () => {
    expect(verifySignature(signedHeaders(), BODY, "/api/other", SECRET)).toBe(false);
  });

  it.each(["Client-Id", "Request-Id", "Request-Timestamp", "Signature"])(
    "rejects when %s is missing",
    (name) => {
      const headers = signedHeaders();
      headers.delete(name);
      expect(verifySignature(headers, BODY, TARGET, SECRET)).toBe(false);
    },
  );

  it("rejects a signature of different length", () => {
    const headers = signedHeaders(BODY, { Signature: "HMACSHA256=short" });
    expect(verifySignature(headers, BODY, TARGET, SECRET)).toBe(false);
  });

  it("digest uses raw body", () => {
    const headers = signedHeaders('{ "a": 1 }');
    expect(verifySignature(headers, '{"a":1}', TARGET, SECRET)).toBe(false);
  });
});

describe("dokuTimestamp", () => {
  it("formats UTC without milliseconds", () => {
    expect(dokuTimestamp(new Date("2026-11-10T01:02:03.456Z"))).toBe("2026-11-10T01:02:03Z");
  });
});
