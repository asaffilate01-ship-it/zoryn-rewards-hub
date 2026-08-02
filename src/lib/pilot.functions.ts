import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PilotJobRun = {
  id: string;
  jobName: string;
  status: string;
  processedCount: number;
  errorCount: number;
  startedAt: string;
  completedAt: string | null;
};

export type PilotSupportCase = {
  id: string;
  subject: string;
  caseType: string;
  priority: string;
  status: string;
  createdAt: string;
};

export type PilotAlert = {
  id: string;
  severity: string;
  alertType: string;
  title: string;
  status: string;
  createdAt: string;
};

export type PilotBackupEvidence = {
  id: string;
  environment: string;
  backupReference: string;
  restoredAt: string;
  ledgerVerified: boolean;
  tenantIsolationVerified: boolean;
};

export type PilotOperationsOverview = {
  jobs: PilotJobRun[];
  cases: PilotSupportCase[];
  alerts: PilotAlert[];
  backups: PilotBackupEvidence[];
};

export const getPilotOperations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PilotOperationsOverview> => {
    const { supabase } = context;

    const [jobs, cases, alerts, backups] = await Promise.all([
      supabase
        .from("zr_job_runs")
        .select("id, job_name, status, processed_count, error_count, started_at, completed_at")
        .order("started_at", { ascending: false })
        .limit(12),
      supabase
        .from("zr_support_cases_v2")
        .select("id, subject, case_type, priority, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("zr_operational_alerts")
        .select("id, severity, alert_type, title, status, created_at")
        .neq("status", "resolved")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("zr_backup_restore_evidence")
        .select(
          "id, environment, backup_reference, restored_at, ledger_verified, tenant_isolation_verified",
        )
        .order("restored_at", { ascending: false })
        .limit(5),
    ]);

    return {
      jobs: (jobs.data ?? []).map((j) => ({
        id: j.id,
        jobName: j.job_name,
        status: j.status,
        processedCount: Number(j.processed_count ?? 0),
        errorCount: Number(j.error_count ?? 0),
        startedAt: j.started_at,
        completedAt: j.completed_at,
      })),
      cases: (cases.data ?? []).map((c) => ({
        id: c.id,
        subject: c.subject,
        caseType: c.case_type,
        priority: c.priority,
        status: c.status,
        createdAt: c.created_at,
      })),
      alerts: (alerts.data ?? []).map((a) => ({
        id: a.id,
        severity: a.severity,
        alertType: a.alert_type,
        title: a.title,
        status: a.status,
        createdAt: a.created_at,
      })),
      backups: (backups.data ?? []).map((b) => ({
        id: b.id,
        environment: b.environment,
        backupReference: b.backup_reference,
        restoredAt: b.restored_at,
        ledgerVerified: Boolean(b.ledger_verified),
        tenantIsolationVerified: Boolean(b.tenant_isolation_verified),
      })),
    };
  });
