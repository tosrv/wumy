import { AwsClient } from "aws4fetch";
import type { R2Config } from "./config";

/** Thin S3-API client for one R2 bucket. Server-only: holds the R2 secret. */
export function createR2(cfg: R2Config) {
  const client = new AwsClient({
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    service: "s3",
    region: "auto",
  });
  const base = `https://${cfg.accountId}.r2.cloudflarestorage.com/${cfg.bucket}`;
  const urlFor = (key: string) => `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;

  return {
    /** Presigned PUT URL; the browser must send exactly these headers. */
    async presignPut(key: string, contentType: string, contentLength: number): Promise<string> {
      const url = new URL(urlFor(key));
      url.searchParams.set("X-Amz-Expires", "300");
      const signed = await client.sign(url.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(contentLength),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        aws: { signQuery: true, allHeaders: true },
      });
      return signed.url;
    },

    async remove(key: string): Promise<void> {
      const res = await client.fetch(urlFor(key), { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error(`R2 delete failed (${res.status})`);
    },

    /** Keys under a prefix (first 1000). */
    async list(prefix: string): Promise<string[]> {
      const url = new URL(base);
      url.searchParams.set("list-type", "2");
      url.searchParams.set("prefix", prefix);
      const res = await client.fetch(url.toString());
      if (!res.ok) throw new Error(`R2 list failed (${res.status})`);
      const xml = await res.text();
      return [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => decodeXml(m[1] ?? ""));
    },
  };
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
