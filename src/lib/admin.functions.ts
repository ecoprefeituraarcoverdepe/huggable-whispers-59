import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, toStoragePath } from "./app.server";

const idSchema = z.object({ id: z.string().uuid() });

export const adminDeleteRegistration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { data: existing } = await supabaseAdmin
      .from("registrations")
      .select("document_url")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("id", data.id);

    if (error) {
      console.error("adminDeleteRegistration error:", error);
      throw new Response("Falha ao excluir cadastro.", { status: 500 });
    }

    if (existing?.document_url) {
      const path = toStoragePath(existing.document_url);
      if (path) {
        await supabaseAdmin.storage
          .from("registration-documents")
          .remove([path]);
      }
    }

    return { ok: true };
  });

export const adminUpdateRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["Pendente", "Aprovado", "Reprovado"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { error } = await supabaseAdmin
      .from("registrations")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) {
      console.error("adminUpdateRegistrationStatus error:", error);
      throw new Response("Falha ao atualizar status.", { status: 500 });
    }

    return { ok: true };
  });

export const adminDeleteEventDay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { error } = await supabaseAdmin
      .from("event_days")
      .delete()
      .eq("id", data.id);

    if (error) {
      console.error("adminDeleteEventDay error:", error);
      throw new Response("Falha ao excluir dia.", { status: 500 });
    }

    return { ok: true };
  });

export const adminResetAll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const wildcard = "00000000-0000-0000-0000-000000000000";
    const { error: regsError } = await supabaseAdmin
      .from("registrations")
      .delete()
      .neq("id", wildcard);
    const { error: daysError } = await supabaseAdmin
      .from("event_days")
      .delete()
      .neq("id", wildcard);

    if (regsError || daysError) {
      console.error("adminResetAll error:", regsError, daysError);
      throw new Response("Falha ao limpar dados.", { status: 500 });
    }

    return { ok: true };
  });

const eventDaySchema = z.object({
  id: z.string().uuid().optional(),
  date: z.string().min(1).max(64),
  description: z.string().min(1).max(8000),
});

export const adminUpsertEventDay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => eventDaySchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("event_days")
        .update({ date: data.date, description: data.description })
        .eq("id", data.id);

      if (error) {
        console.error("adminUpsertEventDay update error:", error);
        throw new Response("Falha ao atualizar dia.", { status: 500 });
      }
    } else {
      const { error } = await supabaseAdmin
        .from("event_days")
        .insert({ date: data.date, description: data.description });

      if (error) {
        console.error("adminUpsertEventDay insert error:", error);
        throw new Response("Falha ao cadastrar dia.", { status: 500 });
      }
    }

    return { ok: true };
  });

export const adminGetDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ documentUrl: z.string().min(1).max(2048) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const path = toStoragePath(data.documentUrl);
    if (!path) {
      throw new Response("Documento inválido.", { status: 400 });
    }

    const { data: signed, error } = await supabaseAdmin.storage
      .from("registration-documents")
      .createSignedUrl(path, 60 * 5);

    if (error || !signed) {
      console.error("adminGetDocumentUrl error:", error);
      throw new Response("Não foi possível gerar o link do documento.", {
        status: 500,
      });
    }

    return { url: signed.signedUrl };
  });