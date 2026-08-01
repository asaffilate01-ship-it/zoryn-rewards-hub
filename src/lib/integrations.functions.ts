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

export type TenantOverview = {
  tenants: Array<{
    id: string;
    slug: string;
    name: string;
    mode: string;
    status: string;
    programmes: number;
    merchants: number;
    memberships: number;
    wallets: number;
    available: number;
  }>;
  events: Array<{
    id: string;
    tenant_id: string;
    provider: string;
    event_type: string;
    provider_event_id: string;
    amount_cents: number | null;
    status: string;
    attempts: number;
    error: string | null;
    received_at: string;
  }>;
};

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: admin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!admin) throw new Error("Forbidden");
}

export const tenantOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TenantOverview> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [tenants, programmes, merchants, memberships, wallets, events] = await Promise.all([
      supabaseAdmin.from("reward_tenants").select("id,slug,name,mode,status").order("name"),
      supabaseAdmin.from("reward_programmes").select("id,tenant_id"),
      supabaseAdmin.from("reward_merchants").select("id,tenant_id"),
      supabaseAdmin.from("reward_memberships").select("id,tenant_id"),
      supabaseAdmin.from("reward_wallets").select("id,available,membership_id"),
      supabaseAdmin
        .from("reward_external_events")
        .select(
          "id,tenant_id,provider,event_type,provider_event_id,amount_cents,status,attempts,error,received_at",
        )
        .order("received_at", { ascending: false })
        .limit(50),
    ]);

    const memberRows = memberships.data ?? [];
    const memberTenant = new Map(memberRows.map((m: any) => [m.id, m.tenant_id]));

    return {
      tenants: (tenants.data ?? []).map((t: any) => {
        const tenantWallets = (wallets.data ?? []).filter(
          (w: any) => memberTenant.get(w.membership_id) === t.id,
        );
        return {
          ...t,
          programmes: (programmes.data ?? []).filter((p: any) => p.tenant_id === t.id).length,
          merchants: (merchants.data ?? []).filter((m: any) => m.tenant_id === t.id).length,
          memberships: memberRows.filter((m: any) => m.tenant_id === t.id).length,
          wallets: tenantWallets.length,
          available: tenantWallets.reduce((s: number, w: any) => s + Number(w.available ?? 0), 0),
        };
      }) as TenantOverview["tenants"],
      events: (events.data ?? []) as TenantOverview["events"],
    };
  });

export const retryRewardEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ eventId: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("reward_process_event", {
      _event_id: data.eventId,
    });
    if (error) throw new Error(error.message);
    return result as { ok: boolean; reason?: string; amount?: number };
  });
