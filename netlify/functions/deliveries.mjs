import { getStore } from '@netlify/blobs';

const STORE_NAME = 'toasted-deliveries';
const DELIVERY_PREFIX = 'deliveries/';

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

function deliveryKey(id) {
  return `${DELIVERY_PREFIX}${id}`;
}

async function readHistory(store) {
  const { blobs } = await store.list({ prefix: DELIVERY_PREFIX });
  const deliveries = await Promise.all(
    blobs.map(blob => store.get(blob.key, { type: 'json' }))
  );
  return deliveries
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
  if (request.method === 'POST') {
    const item = {
      ...payload,
      id: payload.id || crypto.randomUUID(),
      createdAt: payload.createdAt || new Date().toISOString()
    };
    await store.setJSON(deliveryKey(item.id), item);
    return json({ delivery: item }, 201);
  }

  if (request.method === 'PUT') {
    if (!payload.id) return json({ error: 'Delivery ID is required' }, 400);
    const existing = await store.get(deliveryKey(payload.id), { type: 'json' });
    if (!existing) return json({ error: 'Delivery not found' }, 404);
    const item = {
      ...existing,
      ...payload,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    await store.setJSON(deliveryKey(item.id), item);
    return json({ delivery: item });
  }

  if (request.method === 'DELETE') {
    if (!payload.id) return json({ error: 'Delivery ID is required' }, 400);
    const existing = await store.get(deliveryKey(payload.id), { type: 'json' });
    if (!existing) return json({ error: 'Delivery not found' }, 404);
    await store.delete(deliveryKey(payload.id));
    return json({ ok: true });
  }

  return json({ error: 'Method not allowed' }, 405);
};
