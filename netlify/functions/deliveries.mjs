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

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'gallery';
}

function uniqueSlug(name, deliveries, currentId = null) {
  const base = slugify(name);
  const used = new Set(deliveries.filter(item => item.id !== currentId).map(item => item.slug).filter(Boolean));
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
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

async function addMissingSlugs(store, deliveries) {
  for (const item of deliveries) {
    if (item.slug) continue;
    item.slug = uniqueSlug(item.clientNames, deliveries, item.id);
    if (item.url && item.url.includes('#')) item.legacyUrl = item.url;
    item.url = `/gallery/${item.slug}`;
    await store.setJSON(deliveryKey(item.id), item);
  }
  return deliveries;
}

export default async (request) => {
  const requestUrl = new URL(request.url);
  const requestedSlug = requestUrl.searchParams.get('slug');
  const store = getStore(STORE_NAME);

  if (request.method === 'GET' && requestedSlug) {
    const deliveries = await readHistory(store);
    const delivery = deliveries.find(item => item.slug === requestedSlug);
    if (!delivery) return json({ error: 'Gallery not found' }, 404);
    const { clientNames, eventType, eventDate, dropboxUrl, message } = delivery;
    return json({ delivery: { clientNames, eventType, eventDate, dropboxUrl, message } });
  }

  if (!authorized(request)) return json({ error: 'Unauthorized' }, 401);

  if (request.method === 'GET') {
    return json({ deliveries: await addMissingSlugs(store, await readHistory(store)) });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (request.method === 'POST') {
    const deliveries = await readHistory(store);
    const existing = deliveries.find(entry =>
      (payload.id && entry.id === payload.id) ||
      (payload.url && (entry.legacyUrl === payload.url || entry.url === payload.url))
    );
    const id = existing?.id || payload.id || crypto.randomUUID();
    const slug = existing?.slug || uniqueSlug(payload.clientNames, deliveries, id);
    const item = {
      ...existing,
      ...payload,
      id,
      slug,
      url: `/gallery/${slug}`,
      createdAt: existing?.createdAt || payload.createdAt || new Date().toISOString()
    };
    if (payload.url && payload.url.includes('#')) item.legacyUrl = payload.url;
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
      slug: existing.slug || uniqueSlug(payload.clientNames, await readHistory(store), existing.id),
      url: `/gallery/${existing.slug || uniqueSlug(payload.clientNames, await readHistory(store), existing.id)}`,
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
