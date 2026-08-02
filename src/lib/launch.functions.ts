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

export type ReleaseEvidence = {
  id: string;
  releaseName: string;
  environment: string;
  evidenceType: string;
  status: string;
  evidenceReference: string | null;
  executedAt: string;
};

export type ReleaseBlocker = {
  id: string;
  area: string;
  severity: string;
  title: string;
  status: string;
  owner: string | null;
  dueAt: string | null;
};

export type FinalLaunchOverview = {
  acceptance: LaunchAcceptance | null;
  checks: MonitoringCheck[];
  devices: MobileDevice[];
  jobs: ScheduledJobConfig[];
  evidence: ReleaseEvidence[];
  blockers: ReleaseBlocker[];
};

export const getFinalLaunchOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FinalLaunchOverview> => {
    const { supabase } = context;

    const [acceptance, checks, devices, jobs, evidence, blockers] = await Promise.all([
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
        .select(
          "id, platform, device_name, push_enabled, biometric_enabled, revoked_at, last_seen_at",
        )
        .order("last_seen_at", { ascending: false })
        .limit(20),
      supabase
        .from("zr_scheduled_job_configs")
        .select("id, job_name, enabled, schedule_expression, last_run_at")
        .order("job_name", { ascending: true }),
      supabase
        .from("zr_release_security_evidence")
        .select("id, release_name, environment, evidence_type, status, evidence_reference, executed_at")
        .order("executed_at", { ascending: false })
        .limit(20),
      supabase
        .from("zr_release_blockers")
        .select("id, area, severity, title, status, owner, due_at")
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(20),
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
      evidence: (evidence.data ?? []).map((e) => ({
        id: e.id,
        releaseName: e.release_name,
        environment: e.environment,
        evidenceType: e.evidence_type,
        status: e.status,
        evidenceReference: e.evidence_reference,
        executedAt: e.executed_at,
      })),
      blockers: (blockers.data ?? []).map((b) => ({
        id: b.id,
        area: b.area,
        severity: b.severity,
        title: b.title,
        status: b.status,
        owner: b.owner,
        dueAt: b.due_at,
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
