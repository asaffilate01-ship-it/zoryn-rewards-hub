import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { nearbyMerchants } from "@/lib/nearby.functions";

export const Route = createFileRoute("/_authenticated/app/nearby")({
  head: () => ({ meta: [{ title: "In der Nähe — Zoryn" }] }),
  component: NearbyPage,
});

// Berlin fallback (Alexanderplatz)
const FALLBACK = { lat: 52.5219, lng: 13.4132 };

type Row = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  brand_color: string | null;
  points_per_euro: number;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  distance_m: number;
};

function NearbyPage() {
  const fn = useServerFn(nearbyMerchants);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const query = useMutation({
    mutationFn: (c: { lat: number; lng: number }) =>
      fn({ data: { lat: c.lat, lng: c.lng, radiusM: 8000 } }) as Promise<Row[]>,
  });

  useEffect(() => {
    if (!coords) return;
    query.mutate(coords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setUsedFallback(true);
      setCoords(FALLBACK);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setUsedFallback(false);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setUsedFallback(true);
        setCoords(FALLBACK);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">In der Nähe</h1>
          <p className="text-sm text-muted-foreground">
            {usedFallback
              ? "Standort nicht verfügbar — zeige Berlin Mitte."
              : "Zoryn-Partner in deiner Umgebung."}
          </p>
        </div>
        <Button variant="secondary" size="sm" disabled={locating} onClick={requestLocation}>
          {locating ? (
            <Loader2 className="mr-1 size-4 animate-spin" />
          ) : (
            <Navigation className="mr-1 size-4" />
          )}
          Standort
        </Button>
      </div>

      {query.isPending && <div className="text-sm text-muted-foreground">Suche…</div>}

      {query.data && query.data.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Noch keine Zoryn-Partner in deiner Nähe.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {(query.data ?? []).map((m) => (
          <Card key={m.id} className="overflow-hidden">
            <CardContent className="flex items-center gap-4 py-4">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: m.brand_color ?? "hsl(var(--brand))" }}
              >
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-medium">{m.name}</div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {formatDistance(m.distance_m)}
                  </div>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {m.category ?? "Merchant"} · {m.address ?? m.city ?? "—"}
                </div>
                <div className="mt-1 text-xs text-brand-soft">{m.points_per_euro} Punkte pro €</div>
              </div>
              <MapPin className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatDistance(m: number) {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}
