import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const eventSchema = z.object({
  event_id: z.string().min(1).max(200),
  event_type: z.string().min(1).max(120),
  tenant_slug: z.string().min(1).max(120),
  provider: z.string().min(1).max(60),
  provider_reference: z.string().min(1).max(200),
  platform_user_id: z.string().uuid().optional(),
  amount_cents: z.number().int().min(-100_000_000).max(100_000_000).optional(),
  currency: z.string().length(3).optional(),
  occurred_at: z.string().max(60).optional(),
  merchant_name: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const json = (payload: unknown, status: number) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/public/rewards/events")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secrets = [
          process.env["REWARDS_INGEST_SECRET"],
          process.env["ZORYN_WEBHOOK_SECRET"],
        ].filter((s): s is string => Boolean(s));
        if (secrets.length === 0) return json({ error: "webhook_not_configured" }, 503);

        const raw = await request.text();
        const provided = (request.headers.get("x-zoryn-signature") ?? "")
          .replace(/^sha256=/, "")
          .toLowerCase();
        let valid = false;
        for (const secret of secrets) {
          const expected = await hmacHex(secret, raw);
          if (provided && timingSafeEqualHex(provided, expected)) valid = true;
        }
        if (!valid) return json({ error: "invalid_signature" }, 401);

        let parsed: z.infer<typeof eventSchema>;
        try {
          parsed = eventSchema.parse(JSON.parse(raw));
        } catch {
          return json({ error: "invalid_payload" }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: tenant, error: tenantError } = await supabaseAdmin
          .from("reward_tenants")
          .select("id")
          .eq("slug", parsed.tenant_slug)
          .maybeSingle();
        if (tenantError) return json({ error: "tenant_lookup_failed" }, 500);
        if (!tenant) return json({ error: "unknown_tenant" }, 404);

        const { data: event, error: eventError } = await supabaseAdmin
          .from("reward_external_events")
          .upsert(
            {
              tenant_id: tenant.id,
              provider: parsed.provider,
              event_type: parsed.event_type,
              provider_event_id: parsed.event_id,
              platform_user_id: parsed.platform_user_id ?? null,
              amount_cents: parsed.amount_cents ?? null,
              currency: parsed.currency ?? "EUR",
              payload: JSON.parse(raw),
              status: "received" as const,
            },
            { onConflict: "provider,provider_event_id" },
          )
          .select("id")
          .single();
        if (eventError || !event) return json({ error: "event_store_failed" }, 500);

        const { error: outboxError } = await supabaseAdmin.from("reward_outbox").insert({
          tenant_id: tenant.id,
          topic: "rewards.event.received",
          aggregate_id: event.id,
          payload: { event_id: event.id, provider_reference: parsed.provider_reference },
        });
        if (outboxError) return json({ error: "outbox_failed" }, 500);

        const { data: result } = await supabaseAdmin.rpc("reward_process_event", {
          _event_id: event.id,
        });

        return json({ accepted: true, event_id: event.id, processing: result ?? null }, 202);
      },
    },
  },
});
