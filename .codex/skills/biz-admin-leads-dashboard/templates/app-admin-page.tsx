// app/admin/page.tsx
//
// Single-file admin dashboard. Mount → popup "Nhập mã quản trị" → đúng pass thì show bảng.
// Password lưu trong React state (refresh page = popup hiện lại — intended).

'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';

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
  payment?: { referenceCode?: string; gateway?: string };
};

type LeadResponse = {
  leads: Lead[];
  stats: { totalAll: number; totalPaid: number; totalPending: number; revenue: number };
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<LeadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLeads = useCallback(
    async (pass: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (search.trim()) params.set('search', search.trim());
        if (fromDate) params.set('fromDate', new Date(fromDate).toISOString());
        if (toDate) {
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          params.set('toDate', end.toISOString());
        }
        const res = await fetch(`/api/admin/leads?${params.toString()}`, {
          headers: { 'x-admin-pass': pass },
          cache: 'no-store',
        });
        if (res.status === 401) {
          setUnlocked(false);
          setError('Sai mã, thử lại');
          return;
        }
        if (!res.ok) throw new Error('Lỗi tải dữ liệu');
        const json = (await res.json()) as LeadResponse;
        setData(json);
        setUnlocked(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    },
    [search, status, fromDate, toDate],
  );

  // Re-fetch khi filter đổi (chỉ sau khi đã unlock)
  useEffect(() => {
    if (unlocked && password) {
      fetchLeads(password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, fromDate, toDate]);

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password) return;
    fetchLeads(password);
  }

  function handleExportCSV() {
    if (!data || data.leads.length === 0) return;
    const headers = [
      'Mã đơn', 'Họ tên', 'SĐT', 'Email', 'Sản phẩm', 'Số tiền (VND)',
      'Trạng thái', 'Ngày đăng ký', 'Ngày thanh toán', 'Mã GD Sepay', 'Ngân hàng',
    ];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = data.leads.map(l => [
      l.orderId, l.name, l.phone, l.email, l.productName, l.amount,
      l.status === 'paid' ? 'Đã thanh toán' : l.status === 'pending' ? 'Chưa thanh toán' : 'Hết hạn',
      formatDateTime(l.createdAt),
      l.paidAt ? formatDateTime(l.paidAt) : '',
      l.payment?.referenceCode ?? '',
      l.payment?.gateway ?? '',
    ].map(escape).join(','));
    // BOM for Excel UTF-8
    const csv = '﻿' + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ============================== Render ==============================

  if (!unlocked) {
    return (
      <div style={S.overlay}>
        <form onSubmit={handlePasswordSubmit} style={S.card}>
          <h2 style={S.cardTitle}>Nhập mã quản trị</h2>
          <input
            type="password"
            placeholder="Mã quản trị"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            required
            style={S.input}
            disabled={loading}
          />
          {error && <div style={S.error}>{error}</div>}
          <button type="submit" style={S.btnPrimary} disabled={loading || !password}>
            {loading ? 'Đang kiểm tra...' : 'Vào trang'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={S.wrapper}>
      <h1 style={S.h1}>Quản trị đơn hàng</h1>

      {data && (
        <div style={S.statsRow}>
          <Stat label="Tổng đơn" value={data.stats.totalAll.toLocaleString('vi-VN')} />
          <Stat label="Đã thanh toán" value={data.stats.totalPaid.toLocaleString('vi-VN')} color="#16a34a" />
          <Stat label="Chưa thanh toán" value={data.stats.totalPending.toLocaleString('vi-VN')} color="#ca8a04" />
          <Stat label="Doanh thu" value={formatVND(data.stats.revenue)} />
        </div>
      )}

      <div style={S.filterBar}>
        <input
          type="text"
          placeholder="Tìm theo tên, SĐT, email, mã đơn..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={S.searchInput}
        />
        <select value={status} onChange={e => setStatus(e.target.value as typeof status)} style={S.select}>
          <option value="all">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán</option>
          <option value="pending">Chưa thanh toán</option>
        </select>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={S.dateInput} />
        <span style={S.dateSep}>—</span>
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={S.dateInput} />
        <button onClick={handleExportCSV} disabled={!data || data.leads.length === 0} style={S.btnPrimary}>
          Xuất CSV
        </button>
      </div>

      {error && <div style={S.errorBanner}>{error}</div>}

      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.empty}>Đang tải...</div>
        ) : data && data.leads.length > 0 ? (
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Mã đơn</th>
                <th style={S.th}>Họ tên</th>
                <th style={S.th}>SĐT</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Sản phẩm</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Số tiền</th>
                <th style={S.th}>Trạng thái</th>
                <th style={S.th}>Ngày đăng ký</th>
                <th style={S.th}>Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {data.leads.map(l => (
                <tr key={l.orderId} style={S.tr}>
                  <td style={S.tdMono}>{l.orderId}</td>
                  <td style={S.td}>{l.name}</td>
                  <td style={S.tdMono}>{l.phone}</td>
                  <td style={S.td}>{l.email}</td>
                  <td style={S.td}>{l.productName}</td>
                  <td style={{ ...S.td, textAlign: 'right' }}>{formatVND(l.amount)}</td>
                  <td style={S.td}>
                    <span style={{ ...S.badge, ...(l.status === 'paid' ? S.badgePaid : S.badgePending) }}>
                      {l.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </td>
                  <td style={S.td}>{formatDateTime(l.createdAt)}</td>
                  <td style={S.td}>{l.paidAt ? formatDateTime(l.paidAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={S.empty}>Chưa có đơn nào phù hợp</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color = '#111' }: { label: string; value: string; color?: string }) {
  return (
    <div style={S.statCard}>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statValue, color }}>{value}</div>
    </div>
  );
}

function formatVND(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '0 đ';
  return n.toLocaleString('vi-VN') + ' đ';
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

// ============================== Styles ==============================

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#f5f5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    background: '#fff',
    borderRadius: 12,
    padding: '28px 24px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: '0 0 4px 0' },
  input: {
    padding: '12px 14px',
    fontSize: 15,
    borderRadius: 8,
    border: '1px solid #d1d1d6',
    outline: 'none',
  },
  error: { background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, fontSize: 13 },
  errorBanner: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 16,
    maxWidth: 1400,
    margin: '0 auto 16px',
  },
  btnPrimary: {
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    background: '#111',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  wrapper: {
    minHeight: '100vh',
    background: '#f5f5f7',
    padding: '24px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#111',
  },
  h1: { fontSize: 22, fontWeight: 700, margin: '0 auto 16px', maxWidth: 1400 },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 12,
    maxWidth: 1400,
    margin: '0 auto 16px',
  },
  statCard: { background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  statLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 700 },
  filterBar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
    background: '#fff',
    padding: 10,
    borderRadius: 10,
    maxWidth: 1400,
    margin: '0 auto 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  searchInput: {
    flex: '1 1 220px',
    padding: '8px 12px',
    fontSize: 13,
    border: '1px solid #d1d1d6',
    borderRadius: 6,
    outline: 'none',
  },
  select: { padding: '8px 12px', fontSize: 13, border: '1px solid #d1d1d6', borderRadius: 6, background: '#fff', cursor: 'pointer' },
  dateInput: { padding: '6px 10px', fontSize: 13, border: '1px solid #d1d1d6', borderRadius: 6 },
  dateSep: { color: '#666', fontSize: 13 },
  tableWrap: { background: '#fff', borderRadius: 10, overflow: 'auto', maxWidth: 1400, margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  tr: { borderBottom: '1px solid #f0f0f0' },
  th: { textAlign: 'left', padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#666', background: '#fafafa', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', color: '#111', whiteSpace: 'nowrap' },
  tdMono: { padding: '12px 14px', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 },
  badge: { display: 'inline-block', padding: '3px 8px', fontSize: 11, fontWeight: 600, borderRadius: 12 },
  badgePaid: { background: '#dcfce7', color: '#15803d' },
  badgePending: { background: '#fef3c7', color: '#a16207' },
  empty: { padding: 40, textAlign: 'center', color: '#666' },
};
