import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProductionIntegrationsOverview = {
  connections: Array<{
    id: string;
    integration_type: string;
    provider: string;
    environment: string;
    status: string;
    last_success_at: string | null;
    last_failure_at: string | null;
    last_error: string | null;
  }>;
  subscriptions: Array<{
    id: string;
    tenant_id: string;
    provider: string;
    plan_code: string;
    status: string;
    trial_ends_at: string | null;
    current_period_ends_at: string | null;
  }>;
  affiliate: Array<{
    id: string;
    tenant_id: string;
    provider: string;
    provider_transaction_id: string;
    commission_minor: number;
    reward_minor: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
  alerts: Array<{
    id: string;
    rule_key: string;
    severity: string;
    status: string;
    title: string;
    created_at: string;
  }>;
  backups: Array<{
    id: string;
    environment: string;
    backup_reference: string;
    restore_target: string;
    status: string;
    recovery_time_seconds: number | null;
    ledger_verified: boolean;
    tenant_isolation_verified: boolean;
    scheduler_verified: boolean;
    started_at: string;
  }>;
  mode: string;
};

export const productionIntegrationsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProductionIntegrationsOverview> => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!admin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [connections, subscriptions, affiliate, alerts, backups] = await Promise.all([
      supabaseAdmin
        .from("zr_integration_connections")
        .select(
          "id,integration_type,provider,environment,status,last_success_at,last_failure_at,last_error",
        )
        .order("integration_type"),
      supabaseAdmin
        .from("zr_billing_subscriptions")
        .select("id,tenant_id,provider,plan_code,status,trial_ends_at,current_period_ends_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("zr_affiliate_transactions")
        .select(
          "id,tenant_id,provider,provider_transaction_id,commission_minor,reward_minor,currency,status,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("zr_monitoring_alert_events")
        .select("id,rule_key,severity,status,title,created_at")
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("zr_backup_restore_runs")
        .select(
          "id,environment,backup_reference,restore_target,status,recovery_time_seconds,ledger_verified,tenant_isolation_verified,scheduler_verified,started_at",
        )
        .order("started_at", { ascending: false })
        .limit(10),
    ]);

    return {
      connections: (connections.data ?? []) as ProductionIntegrationsOverview["connections"],
      subscriptions: (subscriptions.data ?? []) as ProductionIntegrationsOverview["subscriptions"],
      affiliate: (affiliate.data ?? []) as ProductionIntegrationsOverview["affiliate"],
      alerts: (alerts.data ?? []) as ProductionIntegrationsOverview["alerts"],
      backups: (backups.data ?? []) as ProductionIntegrationsOverview["backups"],
      mode: process.env["INTEGRATION_MODE"] ?? "mock",
    };
  });
