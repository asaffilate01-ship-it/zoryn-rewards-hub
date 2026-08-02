import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRewardsV4Overview } from "@/lib/rewards-v4.functions";
import { RewardsWalletV4 } from "./RewardsWalletV4";
import { CampaignStudioV4 } from "./CampaignStudioV4";
import { SecurityCentreV4 } from "./SecurityCentreV4";
import { useT } from "@/lib/i18n";

const TABS = [
  { id: "wallet", label: "Wallet" },
  { id: "campaigns", label: "Kampagnen" },
  { id: "security", label: "Sicherheit" },
] as const;

export function RewardsV4Centre() {
  const t = useT();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("wallet");
  const overviewFn = useServerFn(getRewardsV4Overview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["rewards-v4"],
    queryFn: () => overviewFn(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">{t("Lädt …")}</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === x.id
                ? "gradient-brand text-primary-foreground"
                : "border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(x.label)}
          </button>
        ))}
      </div>

      {tab === "wallet" && <RewardsWalletV4 data={data} />}
      {tab === "campaigns" && <CampaignStudioV4 data={data} />}
      {tab === "security" && <SecurityCentreV4 data={data} />}
    </div>
  );
}
