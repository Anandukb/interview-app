import { useEffect, useMemo, useState } from 'react';
import {
  Inbox, RefreshCw, AlertCircle, Check, X as XIcon, ArrowRight, Clock3,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchPendingChanges, approveChange, rejectChange,
  type PendingChange, type ChangeStatus,
} from '../../store/slices/pendingChangesSlice';
import { fetchProfiles } from '../../store/slices/profilesSlice';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { PageHeader, ErrorBanner, EmptyState } from '../../components/ui/PageHeader';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';
import { cn } from '../../lib/cn';

const TABLE_LABEL: Record<PendingChange['targetTable'], string> = {
  Quesitons: 'Question',
  Platforms: 'Platform',
  'Questions Types': 'Question Type',
};

const ACTION_TONE: Record<PendingChange['action'], 'success' | 'brand' | 'danger'> = {
  create: 'success',
  update: 'brand',
  delete: 'danger',
};

const STATUS_TONE: Record<ChangeStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const summarize = (change: PendingChange): string => {
  const row = change.payload ?? change.previous ?? {};
  return (
    (row.title as string) ||
    (row.Name as string) ||
    (row.name as string) ||
    (row.questions as string) ||
    '(untitled)'
  );
};

const fieldValue = (v: unknown): string => {
  if (v == null) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const AdminPendingChanges = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.adminAuth.role);
  const isSuperadmin = role === 'superadmin';
  const changes = useAppSelector((s) => s.pendingChanges.data);
  const loading = useAppSelector((s) => s.pendingChanges.loading);
  const error = useAppSelector((s) => s.pendingChanges.error);
  const profiles = useAppSelector((s) => s.profiles.data);

  const [statusFilter, setStatusFilter] = useState<ChangeStatus | 'all'>('pending');
  const [reviewTarget, setReviewTarget] = useState<PendingChange | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (isSuperadmin) dispatch(fetchProfiles());
  }, [isSuperadmin, dispatch]);

  const emailFor = (userId: string | null) =>
    profiles.find((p) => p.id === userId)?.email ?? (userId ? userId.slice(0, 8) : '—');

  const visible = useMemo(() => {
    if (statusFilter === 'all') return changes;
    return changes.filter((c) => c.status === statusFilter);
  }, [changes, statusFilter]);

  const pendingCount = changes.filter((c) => c.status === 'pending').length;

  const openReview = (change: PendingChange, action: 'approve' | 'reject') => {
    setReviewTarget(change);
    setReviewAction(action);
    setNote('');
    setReviewError(null);
  };
  const closeReview = () => { setReviewTarget(null); setReviewAction(null); setReviewError(null); };

  const submitReview = async () => {
    if (!reviewTarget || !reviewAction) return;
    setSubmitting(true);
    setReviewError(null);
    try {
      if (reviewAction === 'approve') {
        await dispatch(approveChange({ id: reviewTarget.id, note: note || undefined })).unwrap();
      } else {
        await dispatch(rejectChange({ id: reviewTarget.id, note: note || undefined })).unwrap();
      }
      closeReview();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const diffRows = (change: PendingChange) => {
    const prev = change.previous ?? {};
    const next = change.payload ?? {};
    const keys = [...new Set([...Object.keys(prev), ...Object.keys(next)])];
    return keys
      .filter((k) => fieldValue(prev[k]) !== fieldValue(next[k]))
      .map((k) => ({ key: k, before: fieldValue(prev[k]), after: fieldValue(next[k]) }));
  };

  return (
    <div>
      <PageHeader
        title="Pending Changes"
        description={
          isSuperadmin
            ? 'Review contributor submissions before they go live'
            : 'Your submitted changes and their review status'
        }
        actions={
          <Button
            variant="secondary"
            size="icon"
            onClick={() => dispatch(fetchPendingChanges())}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-[spin-slow_1s_linear_infinite]' : ''} />
          </Button>
        }
      />

      {error && (
        <ErrorBanner>
          <AlertCircle size={15} />
          <span>Supabase error: {error}</span>
        </ErrorBanner>
      )}

      <div className="mb-4 flex items-center gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize',
              statusFilter === s
                ? 'bg-brand/15 border-brand/40 text-brand'
                : 'bg-surface-3 border-border text-fg-muted hover:bg-surface-2'
            )}
          >
            {s}
            {s === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-brand text-white text-[10px]">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <TableWrap>
        {loading ? (
          <div className="py-16 text-center text-fg-muted">
            <span className="inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-[spin-slow_0.8s_linear_infinite]" />
            <p className="mt-3 text-sm">Loading…</p>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Inbox size={28} />}
            title="Nothing here"
            description={
              statusFilter === 'pending'
                ? 'No changes are waiting for review.'
                : `No ${statusFilter === 'all' ? '' : statusFilter} changes.`
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Type</Th>
                <Th>Action</Th>
                <Th>Summary</Th>
                {isSuperadmin && <Th>Submitted by</Th>}
                <Th>Submitted</Th>
                <Th>Status</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <TableRow key={c.id}>
                  <Td><Badge tone="brand">{TABLE_LABEL[c.targetTable]}</Badge></Td>
                  <Td><Badge tone={ACTION_TONE[c.action]} className="capitalize">{c.action}</Badge></Td>
                  <Td className="max-w-[280px]">
                    <div className="line-clamp-2 text-sm" title={summarize(c)}>{summarize(c)}</div>
                  </Td>
                  {isSuperadmin && (
                    <Td className="text-xs text-fg-muted">{emailFor(c.submittedBy)}</Td>
                  )}
                  <Td className="text-fg-subtle text-xs">{new Date(c.submittedAt).toLocaleString()}</Td>
                  <Td><Badge tone={STATUS_TONE[c.status]} className="capitalize">{c.status}</Badge></Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      {isSuperadmin && c.status === 'pending' ? (
                        <>
                          <Button variant="ghost" size="icon-sm" onClick={() => openReview(c, 'approve')} title="Approve" className="text-success hover:bg-success/10">
                            <Check size={14} />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => openReview(c, 'reject')} title="Reject" className="text-danger hover:bg-danger/10">
                            <XIcon size={14} />
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => { setReviewTarget(c); setReviewAction(null); }}>
                          View
                        </Button>
                      )}
                    </div>
                  </Td>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrap>

      <Modal
        open={!!reviewTarget}
        onClose={closeReview}
        title={reviewTarget ? `${TABLE_LABEL[reviewTarget.targetTable]} · ${reviewTarget.action}` : ''}
        maxWidth="max-w-2xl"
      >
        {reviewTarget && (
          <div className="space-y-4">
            {reviewTarget.status !== 'pending' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-3 border border-border text-xs text-fg-muted">
                <Clock3 size={13} />
                <span>
                  {reviewTarget.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                  {reviewTarget.reviewedAt ? new Date(reviewTarget.reviewedAt).toLocaleString() : '—'}
                  {reviewTarget.reviewNote ? ` — “${reviewTarget.reviewNote}”` : ''}
                </span>
              </div>
            )}

            {reviewTarget.action === 'delete' ? (
              <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
                This will permanently delete: <strong>{summarize(reviewTarget)}</strong>
              </div>
            ) : diffRows(reviewTarget).length === 0 ? (
              <p className="text-sm text-fg-muted italic">No field-level changes to show.</p>
            ) : (
              <TableWrap>
                <Table>
                  <thead>
                    <tr><Th>Field</Th><Th>Before</Th><Th></Th><Th>After</Th></tr>
                  </thead>
                  <tbody>
                    {diffRows(reviewTarget).map((r) => (
                      <TableRow key={r.key}>
                        <Td className="font-mono text-xs text-fg-muted">{r.key}</Td>
                        <Td className="text-xs max-w-[160px] truncate" title={r.before}>{r.before}</Td>
                        <Td><ArrowRight size={13} className="text-fg-subtle" /></Td>
                        <Td className="text-xs max-w-[160px] truncate" title={r.after}>{r.after}</Td>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            )}

            {isSuperadmin && reviewTarget.status === 'pending' && reviewAction && (
              <div className="space-y-3 pt-2 border-t border-border">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note for the contributor…"
                  rows={2}
                />
                {reviewError && (
                  <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
                    <AlertCircle size={14} />
                    <span>{reviewError}</span>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={closeReview}>Cancel</Button>
                  <Button
                    variant={reviewAction === 'reject' ? 'danger' : 'primary'}
                    loading={submitting}
                    onClick={submitReview}
                  >
                    {reviewAction === 'approve' ? 'Approve & Apply' : 'Reject'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPendingChanges;
