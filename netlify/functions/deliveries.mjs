import { getStore } from '@netlify/blobs';

const STORE_NAME = 'toasted-deliveries';
const HISTORY_KEY = 'history';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function authorized(request) {
  const expected = Netlify.env.get('TOASTED_ADMIN_PASSWORD');
  const supplied = request.headers.get('x-admin-password') || '';
  return Boolean(expected && supplied && supplied === expected);
}

async function readHistory(store) {
  return (await store.get(HISTORY_KEY, { type: 'json' })) || [];
}

export default async (request) => {
  if (!authorized(request)) return json({ error: 'Unauthorized' }, 401);

  if (request.method === 'GET') {
    const store = getStore(STORE_NAME);
    return json({ deliveries: await readHistory(store) });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const store = getStore(STORE_NAME);
  const history = await readHistory(store);

  if (request.method === 'POST') {
    const item = {
      ...payload,
      id: payload.id || crypto.randomUUID(),
      createdAt: payload.createdAt || new Date().toISOString()
    };
    const existingIndex = history.findIndex(entry => entry.id === item.id || entry.url === item.url);
    if (existingIndex >= 0) history[existingIndex] = { ...history[existingIndex], ...item };
    else history.unshift(item);
    await store.setJSON(HISTORY_KEY, history);
    return json({ delivery: item }, 201);
  }

  if (request.method === 'PUT') {
    if (!payload.id) return json({ error: 'Delivery ID is required' }, 400);
    const index = history.findIndex(entry => entry.id === payload.id);
    if (index < 0) return json({ error: 'Delivery not found' }, 404);
    history[index] = {
      ...history[index],
      ...payload,
      id: history[index].id,
      createdAt: history[index].createdAt,
      updatedAt: new Date().toISOString()
    };
    await store.setJSON(HISTORY_KEY, history);
    return json({ delivery: history[index] });
  }

  if (request.method === 'DELETE') {
    if (!payload.id) return json({ error: 'Delivery ID is required' }, 400);
    const nextHistory = history.filter(entry => entry.id !== payload.id);
    if (nextHistory.length === history.length) return json({ error: 'Delivery not found' }, 404);
    await store.setJSON(HISTORY_KEY, nextHistory);
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, 405);
};
