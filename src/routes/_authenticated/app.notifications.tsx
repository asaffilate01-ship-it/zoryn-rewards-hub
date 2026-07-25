import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listNotifications, markAllNotificationsRead } from "@/lib/notifications.functions";

export const Route = createFileRoute("/_authenticated/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listNotifications);
  const markFn = useServerFn(markAllNotificationsRead);
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: () => listFn() });

  const mark = useMutation({
    mutationFn: async () => markFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const hasUnread = (data ?? []).some((n) => !n.read_at);
  useEffect(() => {
    if (hasUnread) mark.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUnread]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Benachrichtigungen</h1>
          <p className="text-sm text-muted-foreground">Punkte, Angebote und Aktivitäten.</p>
        </div>
        {hasUnread && (
          <Button variant="ghost" size="sm" onClick={() => mark.mutate()}>Alle gelesen</Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Lade…</p>
      ) : !data || data.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <Bell className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground">Noch keine Benachrichtigungen.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {data.map((n) => (
            <Card key={n.id} className={n.read_at ? "" : "border-primary/40"}>
              <CardContent className="flex items-start gap-3 py-4">
                <div className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bell className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString("de-DE")}
                    </div>
                  </div>
                  {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
