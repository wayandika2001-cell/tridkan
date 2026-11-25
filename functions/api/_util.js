export const PLANS = {
  m: { amount: 10000, days: 31, name: 'Tridkan Pro 1 bulan' },
  y: { amount: 99000, days: 366, name: 'Tridkan Pro 1 tahun' }
};
export const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
});
export const base = (env) => env.MIDTRANS_ENV === 'production'
  ? { app: 'https://app.midtrans.com', api: 'https://api.midtrans.com' }
  : { app: 'https://app.sandbox.midtrans.com', api: 'https://api.sandbox.midtrans.com' };
export const auth = (env) => 'Basic ' + btoa(env.MIDTRANS_SERVER_KEY + ':');
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const hkey = (env) => crypto.subtle.importKey('raw', enc.encode(env.LICENSE_SECRET),
  { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
const same = (a, b) => { if (a.length !== b.length) return false; let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };
export async function sign(env, payload) {
  const p = b64(enc.encode(JSON.stringify(payload)));
  return p + '.' + b64(await crypto.subtle.sign('HMAC', await hkey(env), enc.encode(p)));
}
export async function check(env, token) {
  const [p, s] = String(token || '').split('.');
  if (!p || !s) return null;
  const good = b64(await crypto.subtle.sign('HMAC', await hkey(env), enc.encode(p)));
  if (!same(good, s)) return null;
  try {
    const d = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
    return d.exp > Date.now() ? d : null;
  } catch (e) { return null; }
}
