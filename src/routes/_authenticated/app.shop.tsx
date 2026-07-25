import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { merchantsQueryOptions } from "@/lib/wallet.queries";

export const Route = createFileRoute("/_authenticated/app/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Zoryn" },
      { name: "description", content: "Zoryn-Partner: Punkte sammeln bei deinen Lieblingsmarken." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(merchantsQueryOptions());
  },
  component: ShopPage,
});

function ShopPage() {
  const { data: merchants } = useSuspenseQuery(merchantsQueryOptions());

  return (
    <>
      <h1 className="text-2xl font-semibold">Shop</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sammle Punkte bei allen teilnehmenden Zoryn-Partnern.
      </p>

      <div className="mt-6 grid gap-3">
        {merchants.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-start gap-4">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-semibold"
                style={{
                  background: `${m.brand_color ?? "#6366F1"}22`,
                  color: m.brand_color ?? "#6366F1",
                }}
              >
                {m.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-semibold">{m.name}</div>
                  {m.category && (
                    <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {m.category}
                    </span>
                  )}
                </div>
                {m.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                )}
                <div className="mt-2 text-xs text-brand-soft">
                  {m.points_per_euro} Punkte je 1 €
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
