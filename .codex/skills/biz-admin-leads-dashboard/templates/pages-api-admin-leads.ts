// pages/api/admin/leads.ts
//
// Pages Router variant. Identical logic — verify header pass, SCAN KV, filter, return JSON.

import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { timingSafeEqual } from 'crypto';

type Lead = {
  orderId: string;
  name: string;
  phone: string;
  email: string;
  productName: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
  paidAt?: string;
  payment?: { amount?: number; referenceCode?: string; gateway?: string };
};

function checkPass(input: string | string[] | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  const pass = Array.isArray(input) ? input[0] : input;
  if (!expected || !pass) return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(pass, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!checkPass(req.headers['x-admin-pass'])) {
    return res.status(401).json({ error: 'invalid_password' });
  }

  const { status, fromDate, toDate } = req.query;
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase().trim() : '';

  try {
    const keys: string[] = [];
    let cursor: string | number = 0;
    let safety = 0;
    do {
      const [next, batch] = await kv.scan(cursor, { match: 'lead:DH*', count: 200 });
      keys.push(...batch);
      cursor = next;
      if (keys.length >= 5000 || ++safety > 50) break;
    } while (cursor !== 0 && cursor !== '0');

    const allLeads: Lead[] = [];
    for (let i = 0; i < keys.length; i += 100) {
      const chunk = keys.slice(i, i + 100);
      const values = await kv.mget<Lead[]>(...chunk);
      for (const v of values) if (v && typeof v === 'object' && 'orderId' in v) allLeads.push(v as Lead);
    }

    const stats = { totalAll: allLeads.length, totalPaid: 0, totalPending: 0, revenue: 0 };
    for (const l of allLeads) {
      if (l.status === 'paid') {
        stats.totalPaid++;
        stats.revenue += l.payment?.amount ?? l.amount ?? 0;
      } else if (l.status === 'pending') {
        stats.totalPending++;
      }
    }

    let filtered = allLeads;
    if (status && status !== 'all' && typeof status === 'string') {
      filtered = filtered.filter(l => l.status === status);
    }
    if (search) {
      filtered = filtered.filter(l =>
        (l.name ?? '').toLowerCase().includes(search) ||
        (l.phone ?? '').includes(search) ||
        (l.email ?? '').toLowerCase().includes(search) ||
        (l.orderId ?? '').toLowerCase().includes(search),
      );
    }
    if (typeof fromDate === 'string') {
      const from = new Date(fromDate).getTime();
      if (Number.isFinite(from)) filtered = filtered.filter(l => new Date(l.createdAt).getTime() >= from);
    }
    if (typeof toDate === 'string') {
      const to = new Date(toDate).getTime();
      if (Number.isFinite(to)) filtered = filtered.filter(l => new Date(l.createdAt).getTime() <= to);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({ leads: filtered, stats });
  } catch (err) {
    console.error('[/api/admin/leads]', err);
    return res.status(500).json({
      error: 'internal_error',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}
