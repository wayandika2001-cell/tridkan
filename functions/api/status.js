import { PLANS, json, base, auth, sign } from './_util.js';
export async function onRequestGet({ request, env }) {
  const order = new URL(request.url).searchParams.get('order') || '';
  const m = /^TRD-([my])-\d+-[a-z0-9]+$/.exec(order);
  if (!m) return json({ error: 'order' }, 400);
  const pl = PLANS[m[1]];
  const r = await fetch(base(env).api + '/v2/' + order + '/status',
    { headers: { accept: 'application/json', authorization: auth(env) } });
  const j = await r.json();
  const paid = j.transaction_status === 'settlement' ||
    (j.transaction_status === 'capture' && j.fraud_status === 'accept');
  if (!paid || Math.round(parseFloat(j.gross_amount)) !== pl.amount)
    return json({ paid: false, status: j.transaction_status || 'unknown' });
  const t = Date.parse(String(j.transaction_time).replace(' ', 'T') + '+07:00') || Date.now();
  const exp = t + pl.days * 864e5;
  if (exp <= Date.now()) return json({ paid: true, expired: true });
  return json({ paid: true, exp, token: await sign(env, { exp, plan: m[1] }) });
}
