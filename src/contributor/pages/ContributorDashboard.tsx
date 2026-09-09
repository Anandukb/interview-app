import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Inbox, Clock3, CheckCircle2, XCircle, ArrowRight, HelpCircle, Layers, ListChecks } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';
import { cn } from '../../lib/cn';

const STATUS_TONE = { pending: 'warning', approved: 'success', rejected: 'danger' } as const;
const TABLE_LABEL = { Quesitons: 'Question', Platforms: 'Platform', 'Questions Types': 'Question Type' } as const;

const summarize = (row: Record<string, unknown> | null): string => {
  if (!row) return '(untitled)';
  return (row.title as string) || (row.Name as string) || (row.name as string) || (row.questions as string) || '(untitled)';
};

const ContributorDashboard = () => {
  const navigate = useNavigate();
  const mine = useAppSelector((s) => s.pendingChanges.data);

  const pendingCount = mine.filter((c) => c.status === 'pending').length;
  const approvedCount = mine.filter((c) => c.status === 'approved').length;
  const rejectedCount = mine.filter((c) => c.status === 'rejected').length;

  const stats = [
    { label: 'Total Submissions', value: mine.length, icon: Inbox, gradient: 'from-violet-500 to-fuchsia-500' },
    { label: 'Pending Review',    value: pendingCount,  icon: Clock3,       gradient: 'from-amber-500 to-orange-500' },
    { label: 'Approved',          value: approvedCount, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Rejected',          value: rejectedCount, icon: XCircle,      gradient: 'from-rose-500 to-red-600' },
  ];

  const quickActions = [
    { label: 'Propose a Question',     to: '/contributor/questions',       icon: HelpCircle },
    { label: 'Propose a Platform',     to: '/contributor/platforms',       icon: Layers },
    { label: 'Propose a Question Type', to: '/contributor/question-types', icon: ListChecks },
  ];

  const recent = [...mine]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 8);

  return (
    <div>
      <PageHeader
        title={<>Welcome, <span className="gradient-text">Contributor</span> 👋</>}
        description="Everything you submit here is reviewed by a superadmin before it goes live."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="relative bg-surface border border-border rounded-xl p-5 overflow-hidden shadow-sm"
            >
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80', stat.gradient)} />
              <div className={cn('h-11 w-11 grid place-items-center rounded-xl text-white shadow-md bg-gradient-to-br mb-4', stat.gradient)}>
                <Icon size={20} />
              </div>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <div className="mt-1 text-sm font-semibold text-fg">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-bold text-fg uppercase tracking-wider mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.to}
                onClick={() => navigate(a.to)}
                className="group flex items-center gap-3 bg-surface border border-border rounded-xl p-4 hover:border-border-strong hover:shadow-md transition-all text-left"
              >
                <span className="h-10 w-10 grid place-items-center rounded-lg bg-brand/12 text-brand shrink-0">
                  <Icon size={18} />
                </span>
                <span className="flex-1 text-sm font-semibold">{a.label}</span>
                <ArrowRight size={14} className="text-fg-subtle group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-fg uppercase tracking-wider">Recent submissions</h2>
          <button
            onClick={() => navigate('/contributor/pending-changes')}
            className="text-xs font-semibold text-brand hover:underline"
          >
            View all →
          </button>
        </div>
        <TableWrap>
          <Table>
            <thead>
              <tr><Th>Type</Th><Th>Summary</Th><Th>Submitted</Th><Th>Status</Th></tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <TableRow key={c.id}>
                  <Td><Badge tone="brand">{TABLE_LABEL[c.targetTable]}</Badge></Td>
                  <Td className="max-w-[280px]">
                    <div className="line-clamp-1 text-sm">{summarize(c.payload ?? c.previous)}</div>
                  </Td>
                  <Td className="text-fg-subtle text-xs">{new Date(c.submittedAt).toLocaleDateString()}</Td>
                  <Td><Badge tone={STATUS_TONE[c.status]} className="capitalize">{c.status}</Badge></Td>
                </TableRow>
              ))}
              {recent.length === 0 && (
                <TableRow>
                  <Td colSpan={4} className="text-center py-10 text-fg-subtle">
                    Nothing submitted yet — try one of the quick actions above.
                  </Td>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableWrap>
      </section>
    </div>
  );
};

export default ContributorDashboard;
