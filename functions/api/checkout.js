import { PLANS, json, base, auth } from './_util.js';

export async function onRequestPost({ request, env }) {

  if (!env.MIDTRANS_SERVER_KEY || !env.MIDTRANS_CLIENT_KEY || !env.LICENSE_SECRET) {
    return json({ error: 'config' }, 500);
  }

  let b = {};
  try {
    b = await request.json();
  } catch (e) {}

  const k = b.plan === 'tahunan' ? 'y' : 'm';
  const pl = PLANS[k];

  const order =
    'TRD-' + k + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);

  const r = await fetch(base(env).api + '/snap/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': auth(env)
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: order,
        gross_amount: pl.amount
      },
      item_details: [
        {
          id: 'pro-' + k,
          price: pl.amount,
          quantity: 1,
          name: pl.name
        }
      ]
    })
  });

  const text = await r.text();

  try {
    const j = JSON.parse(text);

    if (!j.token) {
      return json({
        status: r.status,
        midtrans: j,
        order
      }, 502);
    }

    return json({
      token: j.token,
      order,
      clientKey: env.MIDTRANS_CLIENT_KEY,
      env: env.MIDTRANS_ENV === 'production' ? 'production' : 'sandbox'
    });

  } catch (e) {
    return json({
      status: r.status,
      rawResponse: text,
      parseError: String(e)
    }, 502);
  }
}
