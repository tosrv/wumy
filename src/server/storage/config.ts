/** Server-only Cloudflare R2 configuration. Null when any value is missing (R2 disabled). */
export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  supabaseUrl: string;
  serviceRoleKey: string;
};

export function readR2Config(env: Record<string, string | undefined>): R2Config | null {
  const cfg = {
    accountId: env["R2_ACCOUNT_ID"]?.trim() ?? "",
    accessKeyId: env["R2_ACCESS_KEY_ID"]?.trim() ?? "",
    secretAccessKey: env["R2_SECRET_ACCESS_KEY"]?.trim() ?? "",
    bucket: env["R2_BUCKET"]?.trim() ?? "",
    supabaseUrl: env["VITE_SUPABASE_URL"]?.trim() ?? "",
    serviceRoleKey: env["SUPABASE_SERVICE_ROLE_KEY"]?.trim() ?? "",
  };
  return Object.values(cfg).every(Boolean) ? cfg : null;
}
