/**
 * Sanitize Supabase error messages.
 * When the project is paused/down, Supabase returns Cloudflare HTML
 * instead of JSON. This helper detects that and returns a friendly message.
 */
export function friendlyError(e: unknown): string {
  const raw =
    e instanceof Error
      ? e.message
      : typeof e === "object" && e !== null && "message" in e
        ? String((e as { message: unknown }).message)
        : String(e);

  if (
    raw.includes("<!DOCTYPE") ||
    raw.includes("522") ||
    raw.includes("Connection timed out")
  ) {
    return "Supabase fora do ar. Verifique se o projeto esta ativo em supabase.com/dashboard.";
  }

  if (
    raw.includes("schema cache") ||
    raw.includes("relation") ||
    raw.includes("does not exist")
  ) {
    return "Tabelas do Supabase nao configuradas. Execute o migration.sql no SQL Editor do Supabase.";
  }

  if (raw.includes("NEXT_PUBLIC_SUPABASE")) {
    return "Variaveis de ambiente do Supabase nao configuradas.";
  }

  return raw;
}
