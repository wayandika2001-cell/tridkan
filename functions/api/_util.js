export const PLANS = {
 m: { amount: 10000, days: 31, name: 'Tridkan Pro 1 bulan' },
 y: { amount: 99000, days: 366, name: 'Tridkan Pro 1 tahun' }
};

export const json = (o, s = 200) => new Response(JSON.stringify(o), {
 status: s,
 headers: {
  'content-type': 'application/json',
  'cache-control': 'no-store'
 }
});

export const base = (env) => env.MIDTRANS_ENV === 'production'
 ? { app: 'https://app.midtrans.com', api: 'https://api.midtrans.com' }
 : { app: 'https://app.sandbox.midtrans.com', api: 'https://api.sandbox.midtrans.com' };

export const auth = (env) =>
 'Basic ' + btoa(`${String(env.MIDTRANS_SERVER_KEY).trim()}:`);
