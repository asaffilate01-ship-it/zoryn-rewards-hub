import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { MockAffiliateAdapter } from "@/features/integrations/mockAdapters";

const payloadSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected", "reversed"]).optional(),
  commissionMinor: z.number().int().min(0).max(100_000_000).optional(),
  customerReference: z.string().max(200).optional(),
  occurredAt: z.string().max(64).optional(),
});

const json = (payload: unknown, status: number) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function verifySignature(secret: string, rawBody: string, provided: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(provided.replace(/^sha256=/, ""));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/rewards/affiliate-callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["AFFILIATE_WEBHOOK_SECRET"];
        if (!secret) return json({ error: "affiliate_not_configured" }, 503);

        const raw = await request.text();
        const signature = request.headers.get("x-affiliate-signature") ?? "";
        if (!verifySignature(secret, raw, signature)) {
          return json({ error: "invalid_signature" }, 401);
        }

        let body: unknown;
        try {
          body = JSON.parse(raw);
        } catch {
          return json({ error: "invalid_payload" }, 400);
        }

        const parsed = payloadSchema.safeParse(body);
        if (!parsed.success) return json({ error: "invalid_payload" }, 400);

        const normalized = await new MockAffiliateAdapter().normalizeCallback(parsed.data);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { error } = await supabaseAdmin.from("reward_external_events").insert({
          tenant_id: parsed.data.tenantId,
          provider: "affiliate",
          provider_event_id: normalized.externalId,
          event_type: `affiliate.${normalized.status}`,
          amount_cents: normalized.commissionMinor,
          currency: "EUR",
          payload: parsed.data,
          status: "received",
        });

        if (error?.code === "23505") return json({ accepted: true, duplicate: true }, 200);
        if (error) {
          console.error("[affiliate-callback]", error.message);
          return json({ error: "ingest_failed" }, 500);
        }

        return json({ accepted: true }, 202);
      },
    },
  },
});
