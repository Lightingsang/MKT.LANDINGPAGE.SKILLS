// app/api/admin/leads/route.ts
//
// GET /api/admin/leads?status=&search=&fromDate=&toDate=
// Headers: x-admin-pass: <password>
//
// Đơn giản — check header pass với env, SCAN KV, filter, return JSON.

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { timingSafeEqual } from 'crypto';

export const dynamic = 'force-dynamic';

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

function checkPass(input: string | null): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(input, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!checkPass(req.headers.get('x-admin-pass'))) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase().trim() ?? '';
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  try {
    // 1. SCAN tất cả lead keys (cap 5000)
    const keys: string[] = [];
    let cursor: string | number = 0;
    let safety = 0;
    do {
      const [next, batch] = await kv.scan(cursor, { match: 'lead:DH*', count: 200 });
      keys.push(...batch);
      cursor = next;
      if (keys.length >= 5000 || ++safety > 50) break;
    } while (cursor !== 0 && cursor !== '0');

    // 2. MGET batched 100/call
    const allLeads: Lead[] = [];
    for (let i = 0; i < keys.length; i += 100) {
      const chunk = keys.slice(i, i + 100);
      const values = await kv.mget<Lead[]>(...chunk);
      for (const v of values) if (v && typeof v === 'object' && 'orderId' in v) allLeads.push(v as Lead);
    }

    // 3. Stats trên full set
    const stats = {
      totalAll: allLeads.length,
      totalPaid: 0,
      totalPending: 0,
      revenue: 0,
    };
    for (const l of allLeads) {
      if (l.status === 'paid') {
        stats.totalPaid++;
        stats.revenue += l.payment?.amount ?? l.amount ?? 0;
      } else if (l.status === 'pending') {
        stats.totalPending++;
      }
    }

    // 4. Filter
    let filtered = allLeads;
    if (status && status !== 'all') {
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
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      if (Number.isFinite(from)) filtered = filtered.filter(l => new Date(l.createdAt).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate).getTime();
      if (Number.isFinite(to)) filtered = filtered.filter(l => new Date(l.createdAt).getTime() <= to);
    }

    // 5. Sort newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ leads: filtered, stats });
  } catch (err) {
    console.error('[/api/admin/leads]', err);
    return NextResponse.json(
      { error: 'internal_error', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
