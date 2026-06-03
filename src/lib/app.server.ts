import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    console.error("Admin role check failed:", error);
    throw new Response("Não foi possível validar suas permissões.", { status: 500 });
  }

  if (!data) {
    throw new Response("Acesso negado.", { status: 403 });
  }
}

export function toStoragePath(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("documents/")) {
    return trimmed;
  }

  const markers = [
    "/object/public/registration-documents/",
    "/object/sign/registration-documents/",
    "/registration-documents/",
  ];

  for (const marker of markers) {
    const index = trimmed.indexOf(marker);
    if (index >= 0) {
      return decodeURIComponent(trimmed.slice(index + marker.length).split("?")[0]);
    }
  }

  return trimmed;
}