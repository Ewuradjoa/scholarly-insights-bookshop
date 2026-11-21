'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Order = { id: string; edition: string; status: string; amount_total: number | null; currency: string | null; customer_email: string | null; customer_name: string | null; shipping_address: Record<string, string> | null; shipping_method?: string | null; created_at: string; ebook_delivered_at: string | null; confirmation_email_status: string; fulfilment_status: string; fulfilment_error: string | null; lulu_job_id: string | null; tracking_url: string | null };
type Review = { id: string; rating: number; title: string | null; body: string; status: string; created_at: string; report_count: number };
type Report = { id: string; review_id: string; reason: string; details: string | null; created_at: string };
type StaffMember = { id: string; email: string; active: boolean; granted_at: string; revoked_at: string | null };

export function AdminDashboard({ isOwner }: { isOwner: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState('');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [ownerAccess, setOwnerAccess] = useState(isOwner);
  const [staffEmail, setStaffEmail] = useState('');
  const [staffMessage, setStaffMessage] = useState('');

  async function load() {
    const session = await supabaseBrowser().auth.getSession();
    const headers = { Authorization: 'Bearer ' + (session.data.session?.access_token ?? '') };
    const [ordersResponse, reviewsResponse, staffResponse] = await Promise.all([
      fetch('/api/admin/orders', { headers }),
      fetch('/api/admin/reviews', { headers }),
      fetch('/api/admin/staff', { headers }),
    ]);
    if (!ordersResponse.ok || !reviewsResponse.ok) {
      setMessage('Could not load the admin data. Check your sign-in and configuration.');
      return;
    }
    const orderData = await ordersResponse.json() as { orders?: Order[] };
    const moderation = await reviewsResponse.json() as { reviews?: Review[]; reports?: Report[] };
    setOrders(Array.isArray(orderData.orders) ? orderData.orders : []);
    setReviews(Array.isArray(moderation.reviews) ? moderation.reviews : []);
    setReports(Array.isArray(moderation.reports) ? moderation.reports : []);
    if (staffResponse.ok) {
      const staffData = await staffResponse.json() as { staff?: StaffMember[] };
      setStaff(Array.isArray(staffData.staff) ? staffData.staff : []);
      setOwnerAccess(true);
    } else if (staffResponse.status === 403) {
      setOwnerAccess(false);
      setStaff([]);
    } else if (isOwner) {
      const staffData = await staffResponse.json().catch(() => ({})) as { error?: string };
      setStaffMessage(staffData.error ?? 'Staff access could not be loaded.');
    }
  }

  useEffect(() => { void load(); }, []);

  async function update(path: string, body: unknown) {
    setMessage('');
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session.data.session?.access_token ?? '') },
      body: JSON.stringify(body),
    });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? 'Saved.' : result.error ?? 'Could not save.');
    if (response.ok) await load();
  }

  async function refreshLulu(id: string) {
    setMessage('');
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch('/api/admin/orders/lulu-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session.data.session?.access_token ?? '') },
      body: JSON.stringify({ id }),
    });
    const result = await response.json() as { luluStatus?: string; error?: string };
    setMessage(response.ok ? 'Lulu status: ' + result.luluStatus : result.error ?? 'Could not refresh Lulu status.');
    if (response.ok) await load();
  }

  async function checkLuluConnection() {
    setMessage('Checking Lulu authentication…');
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch('/api/admin/lulu/connection', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + (session.data.session?.access_token ?? '') },
    });
    const result = await response.json() as { error?: string; environment?: 'sandbox' | 'production' };
    setMessage(response.ok ? `Lulu ${result.environment} connection verified. No print job was created.` : result.error ?? 'Could not verify the Lulu connection.');
  }

  async function approveLuluSubmission(id: string) {
    setMessage('');
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch('/api/admin/orders/lulu-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session.data.session?.access_token ?? '') },
      body: JSON.stringify({ id }),
    });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? 'Owner approved: the paperback print job was sent to Lulu.' : result.error ?? 'The print job could not be submitted.');
    if (response.ok) await load();
  }

  async function retryOrderEmail(id: string) {
    setMessage('');
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch('/api/admin/orders/confirmation-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session.data.session?.access_token ?? '') },
      body: JSON.stringify({ id }),
    });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? 'Order confirmation email sent.' : result.error ?? 'Could not resend order email.');
    if (response.ok) await load();
  }

  async function grantStaffAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStaffMessage('');
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session.data.session?.access_token ?? '') },
      body: JSON.stringify({ email: staffEmail }),
    });
    const result = await response.json() as { error?: string };
    setStaffMessage(response.ok ? `Access granted to ${staffEmail.trim().toLowerCase()}. They can use their own confirmed account and authenticator.` : result.error ?? 'Staff access could not be granted.');
    if (response.ok) { setStaffEmail(''); await load(); }
  }

  async function revokeStaffAccess(id: string) {
    setStaffMessage('');
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch('/api/admin/staff', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (session.data.session?.access_token ?? '') },
      body: JSON.stringify({ id, active: false }),
    });
    const result = await response.json() as { error?: string };
    setStaffMessage(response.ok ? 'Staff access revoked.' : result.error ?? 'Staff access could not be revoked.');
    if (response.ok) await load();
  }

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    window.location.assign('/admin/sign-in');
  }

  return <>
    <div className="admin-top"><a href="/">← Bookshop</a><button className="text-button" onClick={signOut}>Sign out</button></div>
    <p className="section-kicker">SCHOLARLY INSIGHTS · BOOKSHOP</p>
    <h1>Order desk</h1>
    <p className="admin-lede">Orders, fulfilment and reader notes in one place.</p>
    <button className="admin-refresh" onClick={() => void checkLuluConnection()}>Check Lulu connection</button>
    <div className="admin-cards">
      <article><small>ALL ORDERS</small><b>{orders.length}</b><span>Most recent 250 purchases</span></article>
      <article><small>REVIEWS TO CHECK</small><b>{reviews.filter((review) => review.status === 'pending').length}</b><span>Awaiting approval</span></article>
      <article><small>OPEN REPORTS</small><b>{reports.length}</b><span>Reader reports to review</span></article>
    </div>
    {message && <p role="status" className="admin-message">{message}</p>}

    {ownerAccess && <section className="admin-section">
        <h2>Staff access</h2>
        <p>Only you can grant access. Staff use their own confirmed bookshop account, password and authenticator app; never share your sign-in.</p>
        <p>Ask staff to create and confirm an account at <a href="/account">My account</a>, then add that same email here.</p>
        <form className="admin-staff-form" onSubmit={grantStaffAccess}>
          <label htmlFor="staff-email">Staff email address</label>
          <input id="staff-email" type="email" required maxLength={254} value={staffEmail} onChange={(event) => setStaffEmail(event.target.value)} placeholder="colleague@example.com" />
          <button className="admin-refresh" type="submit">Grant staff access</button>
        </form>
        {staffMessage && <p role="status" className="admin-message">{staffMessage}</p>}
        {staff.length === 0 ? <p>No additional staff access has been granted.</p> : <div className="admin-staff-list">{staff.map((member) => <article key={member.id}>
          <div><b>{member.email}</b><small>{member.active ? 'Active' : 'Revoked'} · Granted {new Date(member.granted_at).toLocaleDateString('en-GB')}{member.revoked_at ? ` · Revoked ${new Date(member.revoked_at).toLocaleDateString('en-GB')}` : ''}</small></div>
          {member.active && <button type="button" className="admin-refresh" onClick={() => void revokeStaffAccess(member.id)}>Revoke access</button>}
        </article>)}</div>}
    </section>}

    <section className="admin-section">
      <h2>Orders</h2>
      {orders.length === 0 ? <p>No orders yet.</p> : <div className="admin-table">
        {orders.map((order) => <article key={order.id} className="admin-order">
          <div className="order-main">
            <b>{(order.customer_name || order.customer_email || 'Customer') + ' · ' + order.edition}</b>
            <small>{new Date(order.created_at).toLocaleString('en-GB')} · {order.status} · {order.amount_total != null ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: (order.currency || 'gbp').toUpperCase() }).format(order.amount_total / 100) : '—'}</small>
            <small>Confirmation email: {order.confirmation_email_status}</small>
            {order.shipping_method && <small>Delivery option: {order.shipping_method}</small>}
            {order.edition === 'paperback' && order.status === 'paid' && order.fulfilment_status === 'not_started' && <small>Awaiting owner approval before print.</small>}
            {order.confirmation_email_status === 'failed' && order.status === 'paid' && <button className="admin-refresh" onClick={() => void retryOrderEmail(order.id)}>Retry confirmation email</button>}
            {order.shipping_address && <small>{Object.values(order.shipping_address).filter(Boolean).join(', ')}</small>}
            {order.lulu_job_id && <small>Lulu print job {order.lulu_job_id}</small>}
            {order.status === 'refunded' && order.lulu_job_id && <small className="fulfilment-error">Refund recorded. Check Lulu and cancel the print job manually if it has not shipped.</small>}
            {order.fulfilment_error && <small className="fulfilment-error">{order.fulfilment_error}</small>}
          </div>
          <label>Fulfilment: {order.fulfilment_status.replaceAll('_', ' ')}
            {order.status === 'paid' && order.edition === 'paperback' && <input key={order.id + '-' + (order.tracking_url ?? '')} defaultValue={order.tracking_url ?? ''} placeholder="Tracking link (https://…)" onBlur={(event) => { if (event.target.value !== (order.tracking_url ?? '')) void update('/api/admin/orders', { id: order.id, trackingUrl: event.target.value || null }); }} />}
          </label>
          {order.lulu_job_id && <button className="admin-refresh" onClick={() => void refreshLulu(order.id)}>Refresh Lulu status</button>}
          {ownerAccess && order.edition === 'paperback' && order.status === 'paid' && order.fulfilment_status === 'not_started' && !order.lulu_job_id && <button className="admin-refresh" onClick={() => void approveLuluSubmission(order.id)}>Approve and send to Lulu</button>}
          {order.ebook_delivered_at && <small>Ebook link used {new Date(order.ebook_delivered_at).toLocaleDateString('en-GB')}</small>}
        </article>)}
      </div>}
    </section>

    <section className="admin-section">
      <h2>Reviews</h2>
      {reviews.length === 0 ? <p>No reader notes yet.</p> : reviews.map((review) => <article className="admin-review" key={review.id}>
        <div><span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span><small>{review.status} · {new Date(review.created_at).toLocaleDateString('en-GB')} · {review.report_count} reports</small><h3>{review.title || 'Reader review'}</h3><p>{review.body}</p></div>
        <div className="admin-actions"><button onClick={() => void update('/api/admin/reviews', { id: review.id, status: 'approved' })}>Approve</button><button onClick={() => void update('/api/admin/reviews', { id: review.id, status: 'rejected' })}>Reject</button></div>
      </article>)}
    </section>

    <section className="admin-section">
      <h2>Review reports</h2>
      {reports.length === 0 ? <p>No open reports.</p> : reports.map((report) => <article className="admin-report" key={report.id}>
        <div><b>{report.reason.replaceAll('_', ' ')}</b><small>{new Date(report.created_at).toLocaleString('en-GB')} · Review {report.review_id}</small>{report.details && <p>{report.details}</p>}</div>
        <button onClick={() => void update('/api/admin/reports', { id: report.id, status: 'reviewed' })}>Mark reviewed</button>
      </article>)}
    </section>
  </>;
}
