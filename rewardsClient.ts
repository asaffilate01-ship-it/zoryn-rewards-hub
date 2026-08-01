import { createFileRoute } from '@tanstack/react-router';
import { CheckCircle2, PlugZap, ShieldCheck } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/merchant/integrations')({ component: IntegrationsPage });

const integrations = [
  { name: 'Zoryn Platform', detail: 'Receive Swan card and Adyen payment events.', status: 'Ready' },
  { name: 'POS / e-commerce API', detail: 'Issue and redeem rewards from external checkout systems.', status: 'Ready' },
  { name: 'Affiliate networks', detail: 'Track commission-funded pending and approved rewards.', status: 'Configure' },
];

function IntegrationsPage() {
  return <main className="mx-auto max-w-6xl p-6"><div className="mb-8"><p className="text-sm font-medium text-violet-600">Zoryn Rewards</p><h1 className="text-3xl font-semibold">Integrations</h1><p className="mt-2 text-slate-600">Run Rewards standalone or connect banking, payments, POS and LoungeTech applications.</p></div><div className="grid gap-4 md:grid-cols-3">{integrations.map((item)=><article key={item.name} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><PlugZap className="text-violet-600"/><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">{item.status}</span></div><h2 className="mt-5 font-semibold">{item.name}</h2><p className="mt-2 text-sm text-slate-600">{item.detail}</p><div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15}/><span>Signed events and idempotency</span></div></article>)}</div><div className="mt-8 rounded-2xl border bg-slate-950 p-6 text-white"><div className="flex items-center gap-2"><CheckCircle2 className="text-emerald-400"/><h2 className="font-semibold">Provider-independent by design</h2></div><p className="mt-2 max-w-3xl text-sm text-slate-300">Rewards owns programme rules and the ledger. Zoryn Money and ZorynPay send normalised events, so Swan or Adyen can be replaced without rewriting loyalty logic.</p></div></main>;
}
