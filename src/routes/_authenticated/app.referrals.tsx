import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { applyReferral, getMyReferral } from "@/lib/referrals.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Users } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/app/referrals")({
  head: () => ({ meta: [{ title: "Freunde einladen — Zoryn" }] }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const t = useT();
  const qc = useQueryClient();
  const getFn = useServerFn(getMyReferral);
  const applyFn = useServerFn(applyReferral);
  const { data } = useQuery({ queryKey: ["myReferral"], queryFn: () => getFn() });
  const [code, setCode] = useState("");

  const apply = useMutation({
    mutationFn: async () => applyFn({ data: { code } }),
    onSuccess: (r) => {
      toast.success(`+${r.points} ${t("Punkte gutgeschrieben.")}`);
      setCode("");
      qc.invalidateQueries({ queryKey: ["myReferral"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : t("Ungültiger Code")),
  });

  const copyCode = async () => {
    if (!data?.code) return;
    await navigator.clipboard.writeText(data.code);
    toast.success(t("Code kopiert."));
  };

  return (
    <>
      <Link
        to="/app/profile"
        className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> {t("Profil")}
      </Link>
      <h1 className="text-2xl font-semibold">{t("Freunde einladen")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("Teile deinen Code — ihr bekommt beide 500 Punkte, sobald jemand ihn einlöst.")}
      </p>

      <Card className="mt-6 border-brand/40 bg-brand/5">
        <CardHeader>
          <CardTitle className="text-base">{t("Dein Empfehlungscode")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="font-display text-3xl font-semibold tracking-widest">
            {data?.code ?? "…"}
          </div>
          <Button variant="secondary" size="sm" onClick={copyCode}>
            <Copy className="mr-1 size-4" /> {t("Kopieren")}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="size-4 text-muted-foreground" />
            {t("Eingeladen:")} <span className="font-semibold">{data?.invited_count ?? 0}</span>
          </div>
        </CardContent>
      </Card>

      {!data?.referred_by && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">{t("Einen Code einlösen")}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC12345"
              maxLength={16}
              className="tracking-widest"
            />
            <Button disabled={apply.isPending || code.length < 4} onClick={() => apply.mutate()}>
              {apply.isPending ? "…" : t("Einlösen")}
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
