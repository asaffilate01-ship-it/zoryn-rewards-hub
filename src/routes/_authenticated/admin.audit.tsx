import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminRecentAudit } from "@/lib/settlements.functions";
import { FileText } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const t = useT();
  const fn = useServerFn(adminRecentAudit);
  const { data } = useQuery({
    queryKey: ["adminAudit"],
    queryFn: () => fn(),
  });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold">{t("Audit-Log")}</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4" /> {t("Letzte Ereignisse")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">{t("Keine Ereignisse.")}</p>
          )}
          {(data ?? []).map((e) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 border-b border-border/50 py-2 last:border-none"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {e.entity_type}
                  </Badge>
                  <span className="font-medium text-sm">{e.action}</span>
                </div>
                {e.details_json && e.details_json !== "{}" && (
                  <pre className="mt-1 text-xs text-muted-foreground truncate">
                    {e.details_json}
                  </pre>
                )}
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {new Date(e.created_at).toLocaleString("de-DE")}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
