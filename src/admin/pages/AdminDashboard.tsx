import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, ListChecks, HelpCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { Badge } from '../../components/ui/Badge';
import { PageHeader } from '../../components/ui/PageHeader';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';
import { cn } from '../../lib/cn';

const AdminDashboard = () => {
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);
  const questions = useAppSelector((s) => s.adminQuestions.data);
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Platforms', value: platforms.length, icon: Layers,
      to: '/admin/platforms',
      desc: 'Manage interview topics',
      gradient: 'from-violet-500 to-fuchsia-500',
    },
    {
      label: 'Question Types', value: questionTypes.length, icon: ListChecks,
      to: '/admin/question-types',
      desc: 'Categorize questions',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Questions', value: questions.length, icon: HelpCircle,
      to: '/admin/questions',
      desc: 'Interview question bank',
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div>
      <PageHeader
        title={<>Welcome back, <span className="gradient-text">Admin</span> 👋</>}
        description="Here's an overview of your interview app content."
        actions={
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/30">
            <TrendingUp size={12} />
            Synced with Supabase
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.button
              key={stat.label}
              onClick={() => navigate(stat.to)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileHover={{ y: -3 }}
              className="group relative text-left bg-surface border border-border rounded-xl p-5 overflow-hidden shadow-sm hover:shadow-xl hover:border-border-strong transition-all"
            >
              <div className={cn(
                'absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80 group-hover:opacity-100 transition-opacity',
                stat.gradient
              )} />
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={cn(
                  'h-11 w-11 grid place-items-center rounded-xl text-white shadow-md bg-gradient-to-br',
                  stat.gradient
                )}>
                  <Icon size={20} />
                </div>
                <ArrowRight
                  size={18}
                  className="text-fg-subtle group-hover:text-brand group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <div className="mt-1 text-sm font-semibold text-fg">{stat.label}</div>
              <div className="text-xs text-fg-muted mt-0.5">{stat.desc}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-fg uppercase tracking-wider">Platforms</h2>
            <button
              onClick={() => navigate('/admin/platforms')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              View all →
            </button>
          </div>
          <TableWrap>
            <Table>
              <thead>
                <tr><Th>Name</Th><Th>Key</Th></tr>
              </thead>
              <tbody>
                {platforms.slice(0, 5).map((p) => (
                  <TableRow key={p.id}>
                    <Td>
                      <span className="inline-flex items-center gap-2">
                        {p.color && (
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                        )}
                        <span className="font-medium">{p.name}</span>
                      </span>
                    </Td>
                    <Td><Badge tone="brand"><code className="font-mono">{p.key}</code></Badge></Td>
                  </TableRow>
                ))}
                {platforms.length === 0 && (
                  <TableRow>
                    <Td colSpan={2} className="text-center py-8 text-fg-subtle">No platforms yet</Td>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </TableWrap>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-fg uppercase tracking-wider">Question Types</h2>
            <button
              onClick={() => navigate('/admin/question-types')}
              className="text-xs font-semibold text-brand hover:underline"
            >
              View all →
            </button>
          </div>
          <TableWrap>
            <Table>
              <thead>
                <tr><Th>Name</Th><Th>ID</Th></tr>
              </thead>
              <tbody>
                {questionTypes.slice(0, 5).map((qt) => (
                  <TableRow key={qt.id}>
                    <Td className="font-medium">{qt.name}</Td>
                    <Td><Badge tone="success"><code className="font-mono">#{qt.id}</code></Badge></Td>
                  </TableRow>
                ))}
                {questionTypes.length === 0 && (
                  <TableRow>
                    <Td colSpan={2} className="text-center py-8 text-fg-subtle">No types yet</Td>
                  </TableRow>
                )}
              </tbody>
            </Table>
          </TableWrap>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
