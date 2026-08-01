import { AlertTriangle, BadgeEuro, Building2, CreditCard, Gift, Megaphone, ShieldCheck, Users } from 'lucide-react';
import { demoCampaigns, demoMerchant, demoScenarios, demoWallet } from '../data/demo';
import { formatEuro, formatNumber } from '../lib/format';

const card = 'rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm';

export function ProductionDashboard() {
  const available = demoWallet.filter((x) => x.state !== 'pending').reduce((sum, x) => sum + x.euroValueCents, 0);
  return (
    <main className="min-h-screen bg-[#080b1a] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-sm font-semibold text-violet-300">Zoryn Rewards Platform</p><h1 className="text-3xl font-bold md:text-5xl">Standalone loyalty, connected everywhere.</h1><p className="mt-3 max-w-3xl text-white/65">A multi-tenant rewards operating system for merchants, consumers, white-label partners and the wider Zoryn ecosystem.</p></div>
          <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm text-emerald-300">Production-ready mock environment</span>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['Members', formatNumber(demoMerchant.members), Users],
            ['Rewarded sales', formatEuro(demoMerchant.monthlyRewardedSalesCents), BadgeEuro],
            ['Reward liability', formatEuro(demoMerchant.liabilityCents), ShieldCheck],
            ['Funding available', formatEuro(demoMerchant.fundingBalanceCents), CreditCard],
          ].map(([label, value, Icon]) => <div className={card} key={String(label)}><Icon className="mb-5 h-5 w-5 text-violet-300"/><p className="text-sm text-white/55">{String(label)}</p><p className="mt-1 text-2xl font-semibold">{String(value)}</p></div>)}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className={card}><div className="mb-5 flex items-center justify-between"><div><p className="text-sm text-white/55">Customer wallet preview</p><h2 className="text-xl font-semibold">One wallet, multiple reward currencies</h2></div><Gift className="text-violet-300"/></div><div className="rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 p-6"><p className="text-white/70">Spendable reward value</p><p className="mt-1 text-4xl font-bold">{formatEuro(available)}</p><p className="mt-4 text-sm text-white/70">Universal, merchant, cashback and gift balances remain clearly separated.</p></div><div className="mt-4 space-y-2">{demoWallet.map((item) => <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3"><div><p className="font-medium">{item.label}</p><p className="text-xs text-white/50">{item.state ?? 'available'}{item.expiresAt ? ` • expires ${item.expiresAt}` : ''}</p></div><div className="text-right"><p className="font-semibold">{item.type === 'cashback' || item.type === 'gift_credit' ? formatEuro(item.euroValueCents) : `${formatNumber(item.amount)} pts`}</p><p className="text-xs text-white/50">{formatEuro(item.euroValueCents)}</p></div></div>)}</div></div>
          <div className={card}><div className="mb-5 flex items-center gap-3"><Building2 className="text-blue-300"/><div><p className="text-sm text-white/55">Merchant tenant</p><h2 className="text-xl font-semibold">{demoMerchant.tenantName}</h2></div></div><dl className="grid grid-cols-2 gap-3 text-sm">{[['Plan', demoMerchant.plan],['Locations', demoMerchant.locations],['Active campaigns', demoMerchant.activeCampaigns],['Points issued', formatNumber(demoMerchant.issuedPoints)],['Points redeemed', formatNumber(demoMerchant.redeemedPoints)],['Funding runway', 'Healthy']].map(([k,v])=><div key={String(k)} className="rounded-xl bg-white/[0.04] p-3"><dt className="text-white/50">{String(k)}</dt><dd className="mt-1 font-semibold capitalize">{String(v)}</dd></div>)}</dl></div>
        </section>

        <section className={card}><div className="mb-5 flex items-center gap-3"><Megaphone className="text-violet-300"/><div><p className="text-sm text-white/55">Campaign engine</p><h2 className="text-xl font-semibold">Live and scheduled campaigns</h2></div></div><div className="grid gap-3 md:grid-cols-3">{demoCampaigns.map((c)=><article key={c.id} className="rounded-xl bg-white/[0.04] p-4"><div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-2 py-1 text-xs capitalize">{c.status}</span><span className="text-xs text-white/45">{c.audience}</span></div><h3 className="mt-4 font-semibold">{c.name}</h3><p className="mt-1 text-sm text-white/55">{c.goal} • {c.reward}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-violet-500" style={{width:`${Math.min(100,(c.spendCents/c.budgetCents)*100)}%`}}/></div><div className="mt-2 flex justify-between text-xs text-white/50"><span>{formatEuro(c.spendCents)} spent</span><span>{formatEuro(c.attributedRevenueCents)} revenue</span></div></article>)}</div></section>

        <section className={card}><div className="mb-5 flex items-center gap-3"><AlertTriangle className="text-amber-300"/><div><p className="text-sm text-white/55">Operational readiness</p><h2 className="text-xl font-semibold">Realistic scenarios</h2></div></div><div className="grid gap-3 md:grid-cols-2">{demoScenarios.map((s)=><div key={s.id} className="rounded-xl bg-white/[0.04] p-4"><div className="flex items-center justify-between"><p className="font-medium">{s.title}</p><span className={`rounded-full px-2 py-1 text-xs ${s.status==='healthy'?'bg-emerald-400/15 text-emerald-300':s.status==='critical'?'bg-red-400/15 text-red-300':'bg-amber-400/15 text-amber-300'}`}>{s.status}</span></div><p className="mt-2 text-sm text-white/55">{s.description}</p></div>)}</div></section>
      </div>
    </main>
  );
}
