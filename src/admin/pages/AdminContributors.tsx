import { useEffect, useState } from 'react';
import {
  Users, RefreshCw, AlertCircle, Check, X as XIcon, ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProfiles, updateProfileRole, type Profile } from '../../store/slices/profilesSlice';
import type { AdminRole } from '../../store/slices/adminAuthSlice';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader, ErrorBanner, EmptyState } from '../../components/ui/PageHeader';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';

const ROLE_TONE: Record<AdminRole, 'warning' | 'success' | 'brand' | 'danger'> = {
  pending: 'warning',
  contributor: 'success',
  superadmin: 'brand',
  rejected: 'danger',
};

const AdminContributors = () => {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector((s) => s.profiles.data);
  const loading = useAppSelector((s) => s.profiles.loading);
  const error = useAppSelector((s) => s.profiles.error);
  const [myId, setMyId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProfiles());
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null));
  }, [dispatch]);

  const changeRole = async (p: Profile, role: AdminRole) => {
    setBusyId(p.id);
    await dispatch(updateProfileRole({ id: p.id, role }));
    setBusyId(null);
  };

  const sorted = [...profiles].sort((a, b) => {
    const order: Record<AdminRole, number> = { pending: 0, contributor: 1, superadmin: 2, rejected: 3 };
    return order[a.role ?? 'pending'] - order[b.role ?? 'pending'];
  });

  return (
    <div>
      <PageHeader
        title="Contributors"
        description="Manage who can access the admin panel and at what level"
        actions={
          <Button
            variant="secondary"
            size="icon"
            onClick={() => dispatch(fetchProfiles())}
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

      <TableWrap>
        {loading ? (
          <div className="py-16 text-center text-fg-muted">
            <span className="inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-[spin-slow_0.8s_linear_infinite]" />
            <p className="mt-3 text-sm">Loading…</p>
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="No accounts yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th className="hidden md:table-cell">Joined</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const isSelf = p.id === myId;
                const isBusy = busyId === p.id;
                const role = p.role ?? 'pending';
                return (
                  <TableRow key={p.id}>
                    <Td className="font-medium">
                      {p.email}
                      {isSelf && <span className="ml-2 text-[10px] text-fg-subtle uppercase">(you)</span>}
                    </Td>
                    <Td><Badge tone={ROLE_TONE[role]} className="capitalize">{role}</Badge></Td>
                    <Td className="hidden md:table-cell text-fg-subtle text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-2">
                        {role === 'pending' && (
                          <>
                            <Button
                              variant="ghost" size="icon-sm" title="Approve as contributor"
                              className="text-success hover:bg-success/10" disabled={isBusy}
                              onClick={() => changeRole(p, 'contributor')}
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              variant="ghost" size="icon-sm" title="Reject"
                              className="text-danger hover:bg-danger/10" disabled={isBusy}
                              onClick={() => changeRole(p, 'rejected')}
                            >
                              <XIcon size={14} />
                            </Button>
                          </>
                        )}
                        {role === 'contributor' && (
                          <>
                            <Button
                              variant="ghost" size="icon-sm" title="Promote to superadmin"
                              className="text-brand hover:bg-brand/10" disabled={isBusy}
                              onClick={() => changeRole(p, 'superadmin')}
                            >
                              <ArrowUpCircle size={14} />
                            </Button>
                            <Button
                              variant="ghost" size="icon-sm" title="Revoke access"
                              className="text-danger hover:bg-danger/10" disabled={isBusy}
                              onClick={() => changeRole(p, 'rejected')}
                            >
                              <XIcon size={14} />
                            </Button>
                          </>
                        )}
                        {role === 'superadmin' && (
                          <Button
                            variant="ghost" size="icon-sm" title={isSelf ? "Can't demote your own account" : 'Demote to contributor'}
                            className="text-fg-muted hover:bg-surface-3" disabled={isBusy || isSelf}
                            onClick={() => changeRole(p, 'contributor')}
                          >
                            <ArrowDownCircle size={14} />
                          </Button>
                        )}
                        {role === 'rejected' && (
                          <Button
                            variant="ghost" size="sm" title="Reinstate as contributor" disabled={isBusy}
                            onClick={() => changeRole(p, 'contributor')}
                          >
                            Reinstate
                          </Button>
                        )}
                      </div>
                    </Td>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        )}
      </TableWrap>
    </div>
  );
};

export default AdminContributors;
