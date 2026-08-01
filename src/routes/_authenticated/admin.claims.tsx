import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { adminListClaims, adminResolveClaim } from "@/lib/claims.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/claims")({
  component: AdminClaims,
});

function AdminClaims() {
  const t = useT();
  const qc = useQueryClient();
  const listFn = useServerFn(adminListClaims);
  const resolveFn = useServerFn(adminResolveClaim);
  const { data, isLoading } = useQuery({ queryKey: ["adminClaims"], queryFn: () => listFn() });
  const [pts, setPts] = useState<Record<string, string>>({});

  const resolve = useMutation({
    mutationFn: async (v: { claimId: string; approve: boolean; points?: number }) =>
      resolveFn({ data: v }),
    onSuccess: () => {
      toast.success(t("Antrag bearbeitet."));
      qc.invalidateQueries({ queryKey: ["adminClaims"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : t("Fehler")),
  });

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">{t("Reklamationen")}</h1>
      {isLoading && <p className="text-sm text-muted-foreground">{t("Laden…")}</p>}
      <div className="grid gap-3">
        {(data ?? []).map((c) => {
          const suggested = Math.max(Math.round(c.amount_cents / 100) * 10, 10);
          return (
            <Card key={c.id}>
              <CardContent className="grid gap-3 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="font-medium">{c.merchant_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.purchase_date).toLocaleDateString("de-DE")} · €
                    {(c.amount_cents / 100).toFixed(2)}
                    {c.reference && ` · ${c.reference}`}
                  </div>
                  {c.notes && <div className="mt-1 text-sm">{c.notes}</div>}
                  <div className="mt-1 text-xs">
                    {t("Status:")}{" "}
                    <span
                      className={
                        c.status === "open"
                          ? "text-amber-500"
                          : c.status === "approved"
                            ? "text-emerald-500"
                            : "text-muted-foreground"
                      }
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
                {c.status === "open" && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      placeholder={String(suggested)}
                      value={pts[c.id] ?? ""}
                      onChange={(e) => setPts({ ...pts, [c.id]: e.target.value })}
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        resolve.mutate({
                          claimId: c.id,
                          approve: true,
                          points: pts[c.id] ? Number(pts[c.id]) : suggested,
                        })
                      }
                    >
                      <Check className="mr-1 size-4" /> {t("Genehmigen")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolve.mutate({ claimId: c.id, approve: false })}
                    >
                      <X className="mr-1 size-4" /> {t("Ablehnen")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {data && data.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("Keine Reklamationen.")}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
