import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { QrCode, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claimEarnChallenge } from "@/lib/challenges.functions";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/app/scan")({
  head: () => ({ meta: [{ title: "Punkte sammeln — Zoryn" }] }),
  component: ScanPage,
});

function ScanPage() {
  const t = useT();
  const claimFn = useServerFn(claimEarnChallenge);
  const [code, setCode] = useState("");
  const [last, setLast] = useState<{
    points: number;
    merchant: string;
    offer: string | null;
  } | null>(null);

  const claim = useMutation({
    mutationFn: () => claimFn({ data: { code } }),
    onSuccess: (r) => {
      setLast({ points: r.points_awarded, merchant: r.merchant_name, offer: r.offer_title });
      toast.success(`+${r.points_awarded} ${t("Punkte gesammelt")}`);
      setCode("");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : t("Fehler")),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{t("Punkte sammeln")}</h1>
        <p className="text-sm text-muted-foreground">
          {t(
            "Gib den 8-stelligen Code von der Kasse ein. Ein Kamera-Scanner folgt in der nativen App.",
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <QrCode className="size-4" /> {t("Code eingeben")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .slice(0, 12),
              )
            }
            placeholder={t("Z.B. K7HP2XQR")}
            className="text-center font-mono text-lg tracking-widest"
            autoCapitalize="characters"
            autoComplete="off"
          />
          <Button
            className="w-full"
            disabled={code.length < 6 || claim.isPending}
            onClick={() => claim.mutate()}
          >
            {t("Einlösen")}
          </Button>
        </CardContent>
      </Card>

      {last && (
        <Card className="border-brand/40 bg-brand/5">
          <CardContent className="flex items-center gap-3 py-5">
            <Sparkles className="size-6 text-brand-soft" />
            <div>
              <div className="font-semibold">
                +{last.points} {t("Punkte bei")} {last.merchant}
              </div>
              {last.offer && (
                <div className="text-xs text-muted-foreground">
                  {t("Bonus-Aktion:")} {last.offer}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
