import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LaunchAcceptance = {
  id: string;
  releaseName: string;
  environment: string;
  engineeringPassed: boolean;
  securityPassed: boolean;
  operationsPassed: boolean;
  legalPassed: boolean;
  pilotPassed: boolean;
  approved: boolean;
  approvedAt: string | null;
  createdAt: string;
};

export type MonitoringCheck = {
  id: string;
  checkName: string;
  status: string;
  latencyMs: number | null;
  checkedAt: string;
};

export type MobileDevice = {
  id: string;
  platform: string;
  deviceName: string | null;
  pushEnabled: boolean;
  biometricEnabled: boolean;
  revokedAt: string | null;
  lastSeenAt: string;
};

export type ScheduledJobConfig = {
  id: string;
  jobName: string;
  enabled: boolean;
  scheduleExpression: string;
  lastRunAt: string | null;
};

export type FinalLaunchOverview = {
  acceptance: LaunchAcceptance | null;
  checks: MonitoringCheck[];
  devices: MobileDevice[];
  jobs: ScheduledJobConfig[];
};

export const getFinalLaunchOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FinalLaunchOverview> => {
    const { supabase } = context;

    const [acceptance, checks, devices, jobs] = await Promise.all([
      supabase
        .from("zr_launch_acceptance")
        .select(
          "id, release_name, environment, engineering_passed, security_passed, operations_passed, legal_passed, pilot_passed, approved, approved_at, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("zr_monitoring_checks")
        .select("id, check_name, status, latency_ms, checked_at")
        .order("checked_at", { ascending: false })
        .limit(12),
      supabase
        .from("zr_mobile_devices")
        .select("id, platform, device_name, push_enabled, biometric_enabled, revoked_at, last_seen_at")
        .order("last_seen_at", { ascending: false })
        .limit(20),
      supabase
        .from("zr_scheduled_job_configs")
        .select("id, job_name, enabled, schedule_expression, last_run_at")
        .order("job_name", { ascending: true }),
    ]);

    const a = acceptance.data;

    return {
      acceptance: a
        ? {
            id: a.id,
            releaseName: a.release_name,
            environment: a.environment,
            engineeringPassed: Boolean(a.engineering_passed),
            securityPassed: Boolean(a.security_passed),
            operationsPassed: Boolean(a.operations_passed),
            legalPassed: Boolean(a.legal_passed),
            pilotPassed: Boolean(a.pilot_passed),
            approved: Boolean(a.approved),
            approvedAt: a.approved_at,
            createdAt: a.created_at,
          }
        : null,
      checks: (checks.data ?? []).map((c) => ({
        id: c.id,
        checkName: c.check_name,
        status: c.status,
        latencyMs: c.latency_ms,
        checkedAt: c.checked_at,
      })),
      devices: (devices.data ?? []).map((d) => ({
        id: d.id,
        platform: d.platform,
        deviceName: d.device_name,
        pushEnabled: Boolean(d.push_enabled),
        biometricEnabled: Boolean(d.biometric_enabled),
        revokedAt: d.revoked_at,
        lastSeenAt: d.last_seen_at,
      })),
      jobs: (jobs.data ?? []).map((j) => ({
        id: j.id,
        jobName: j.job_name,
        enabled: Boolean(j.enabled),
        scheduleExpression: j.schedule_expression,
        lastRunAt: j.last_run_at,
      })),
    };
  });

export const revokeMobileDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { deviceId: string }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("zr_mobile_devices")
      .update({ revoked_at: new Date().toISOString(), push_enabled: false })
      .eq("id", data.deviceId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
