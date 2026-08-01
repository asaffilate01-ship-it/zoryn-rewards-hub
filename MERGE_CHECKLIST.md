import { Gift, Sparkles, WalletCards } from 'lucide-react';
import type { RewardWalletSummary } from '../types/contracts';

const formatMoney = (cents: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export function UnifiedRewardsWallet({ wallet }: { wallet: RewardWalletSummary }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Zoryn Rewards wallet</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight">{wallet.available_points.toLocaleString('de-DE')} points</h2>
          <p className="mt-1 text-slate-300">Worth {formatMoney(wallet.euro_value_cents)}</p>
        </div>
        <span className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-200">{wallet.tier}</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric icon={<Sparkles size={18} />} label="Pending" value={`${wallet.pending_points.toLocaleString('de-DE')} pts`} />
        <Metric icon={<WalletCards size={18} />} label="Cashback" value={formatMoney(wallet.cashback_cents)} />
        <Metric icon={<Gift size={18} />} label="Gift credit" value={formatMoney(wallet.gift_credit_cents)} />
      </div>
    </section>
  );
}
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-white/5 p-4"><div className="flex items-center gap-2 text-slate-400">{icon}<span>{label}</span></div><p className="mt-2 text-lg font-medium">{value}</p></div>;
}
