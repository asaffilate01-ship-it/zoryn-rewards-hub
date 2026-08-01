import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


export type IntegrationHealth = {
  tenants: Array<{ id: string; slug: string; name: string; mode: string; status: string }>;
  integrations: Array<{
    id: string;
    tenant_id: string;
    provider: string;
    integration_type: string;
    status: string;
    last_event_at: string | null;
  }>;
  events: {
    total: number;
    received: number;
    processed: number;
    failed: number;
    last_received_at: string | null;
  };
  outbox_pending: number;
};

export const integrationHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<IntegrationHealth> => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!admin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [tenants, integrations, events, outbox] = await Promise.all([
      supabaseAdmin.from("reward_tenants").select("id,slug,name,mode,status").order("name"),
      supabaseAdmin
        .from("reward_integrations")
        .select("id,tenant_id,provider,integration_type,status,last_event_at")
        .order("provider"),
      supabaseAdmin
        .from("reward_external_events")
        .select("status,received_at")
        .order("received_at", { ascending: false })
        .limit(500),
      supabaseAdmin
        .from("reward_outbox")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    const rows = events.data ?? [];
    const count = (s: string) => rows.filter((r) => r.status === s).length;

    return {
      tenants: (tenants.data ?? []) as IntegrationHealth["tenants"],
      integrations: (integrations.data ?? []) as IntegrationHealth["integrations"],
      events: {
        total: rows.length,
        received: count("received"),
        processed: count("processed"),
        failed: count("failed"),
        last_received_at: rows[0]?.received_at ?? null,
      },
      outbox_pending: outbox.count ?? 0,
    };
  });
