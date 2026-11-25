import { json, check } from './_util.js';
export async function onRequestGet({ request, env }) {
  const d = await check(env, new URL(request.url).searchParams.get('token'));
  return json(d ? { pro: true, exp: d.exp } : { pro: false });
}
