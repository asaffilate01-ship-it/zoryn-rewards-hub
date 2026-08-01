import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListMerchants, adminSetMerchantActive } from "@/lib/admin.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/merchants")({
  component: AdminMerchants,
});

function AdminMerchants() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListMerchants);
  const toggleFn = useServerFn(adminSetMerchantActive);
  const { data, isLoading } = useQuery({ queryKey: ["adminMerchants"], queryFn: () => listFn() });

  const toggle = useMutation({
    mutationFn: async (v: { merchantId: string; active: boolean }) => toggleFn({ data: v }),
    onSuccess: () => {
      toast.success("Status aktualisiert.");
      qc.invalidateQueries({ queryKey: ["adminMerchants"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Fehler"),
  });

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">Merchants</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Laden…</p>}
      <div className="grid gap-3">
        {(data ?? []).map((m) => (
          <Card key={m.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="size-9 rounded-md"
                  style={{ background: m.brand_color ?? "hsl(var(--muted))" }}
                />
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[m.category, m.city].filter(Boolean).join(" · ") || "—"} · {m.points_per_euro}{" "}
                    Pkt/€
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs ${m.is_active ? "text-emerald-500" : "text-muted-foreground"}`}
                >
                  {m.is_active ? "Aktiv" : "Inaktiv"}
                </span>
                <Switch
                  checked={m.is_active}
                  onCheckedChange={(v) => toggle.mutate({ merchantId: m.id, active: v })}
                />
              </div>
            </CardContent>
          </Card>
        ))}
        {data && data.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Keine Merchants.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
