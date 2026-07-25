import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { listBadges, listMyBadges } from "@/lib/badges.functions";

export const Route = createFileRoute("/_authenticated/app/badges")({
  component: BadgesPage,
});

function BadgesPage() {
  const allFn = useServerFn(listBadges);
  const mineFn = useServerFn(listMyBadges);
  const { data: all } = useQuery({ queryKey: ["badges"], queryFn: () => allFn() });
  const { data: mine } = useQuery({ queryKey: ["myBadges"], queryFn: () => mineFn() });
  const earnedIds = new Set((mine ?? []).map((b) => b.badge_id));
  const earnedMap = new Map((mine ?? []).map((b) => [b.badge_id, b.earned_at as string]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Auszeichnungen</h1>
        <p className="text-sm text-muted-foreground">
          {earnedIds.size} von {all?.length ?? 0} freigeschaltet.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(all ?? []).map((b) => {
          const earned = earnedIds.has(b.id);
          return (
            <Card
              key={b.id}
              className={earned ? "border-primary/30 bg-primary/[0.03]" : "opacity-60"}
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className="text-4xl">{b.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{b.name}</div>
                    {earned && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        Erhalten
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{b.description}</div>
                  {earned ? (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      am {new Date(earnedMap.get(b.id) ?? "").toLocaleDateString("de-DE")}
                    </div>
                  ) : (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Ziel: {b.threshold_points.toLocaleString("de-DE")} Punkte
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
