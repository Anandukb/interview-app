import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Layers, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAdminPlatforms,
  addAdminPlatform,
  updateAdminPlatform,
  deleteAdminPlatform,
} from '../../store/slices/adminPlatformsSlice';
import { submitChange } from '../../store/slices/pendingChangesSlice';
import { platformToInsertRow } from '../../lib/platforms';
import type { AdminPlatform } from '../types';
import AdminModal from '../components/AdminModal';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PageHeader, ErrorBanner, EmptyState } from '../../components/ui/PageHeader';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';
import { cn } from '../../lib/cn';

const PRESET_COLORS = [
  '#f7df1e', '#3178c6', '#61dafb', '#e34f26', '#264de4',
  '#339933', '#a78bfa', '#f59e0b', '#10b981', '#ef4444',
];

type FormState = { name: string; key: string; description: string; color: string };
const EMPTY_FORM: FormState = { name: '', key: '', description: '', color: '#8b5cf6' };

const AdminPlatforms = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.adminAuth.role);
  const isContributor = role === 'contributor';
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const platformsLoading = useAppSelector((s) => s.adminPlatforms.loading);
  const platformsError = useAppSelector((s) => s.adminPlatforms.error);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminPlatform | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setSaveError(null); setModalOpen(true); };
  const openEdit = (p: AdminPlatform) => {
    setEditTarget(p);
    setForm({ name: p.name, key: p.key, description: p.description ?? '', color: p.color ?? '#8b5cf6' });
    setSaveError(null);
    setModalOpen(true);
  };
  const handleClose = () => { setModalOpen(false); setEditTarget(null); setSaveError(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (isContributor) {
        await dispatch(submitChange({
          targetTable: 'Platforms',
          targetId: editTarget ? editTarget.id : null,
          action: editTarget ? 'update' : 'create',
          payload: platformToInsertRow(form),
          previous: editTarget ? platformToInsertRow(editTarget) : null,
        })).unwrap();
      } else if (editTarget) {
        await dispatch(updateAdminPlatform({ id: editTarget.id, patch: form })).unwrap();
      } else {
        await dispatch(addAdminPlatform(form)).unwrap();
      }
      handleClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isContributor) {
      const target = platforms.find((p) => p.id === id);
      await dispatch(submitChange({
        targetTable: 'Platforms',
        targetId: id,
        action: 'delete',
        payload: null,
        previous: target ? platformToInsertRow(target) : null,
      }));
    } else {
      await dispatch(deleteAdminPlatform(id));
    }
    setDeleteConfirm(null);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      key: editTarget ? f.key : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  };

  return (
    <div>
      <PageHeader
        title="Platforms"
        description={isContributor
          ? 'Propose platforms — changes are reviewed by a superadmin before going live'
          : 'Manage interview topics — synced with Supabase'}
        actions={
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => dispatch(fetchAdminPlatforms())}
              disabled={platformsLoading}
              title="Refresh from Supabase"
            >
              <RefreshCw size={15} className={platformsLoading ? 'animate-[spin-slow_1s_linear_infinite]' : ''} />
            </Button>
            <Button onClick={openAdd} leftIcon={<Plus size={16} />}>Add Platform</Button>
          </>
        }
      />

      {platformsError && (
        <ErrorBanner>
          <AlertCircle size={15} />
          <span>Supabase error: {platformsError}</span>
        </ErrorBanner>
      )}

      <TableWrap>
        {platformsLoading ? (
          <div className="py-16 text-center text-fg-muted">
            <span className="inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-[spin-slow_0.8s_linear_infinite]" />
            <p className="mt-3 text-sm">Loading platforms…</p>
          </div>
        ) : platforms.length === 0 ? (
          <EmptyState
            icon={<Layers size={28} />}
            title="No platforms yet"
            description="Click 'Add Platform' to create one."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-12">#</Th>
                <Th className="w-16">Color</Th>
                <Th>Name</Th>
                <Th>Key</Th>
                <Th>Description</Th>
                <Th className="hidden md:table-cell">Created</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p, idx) => (
                <TableRow key={p.id}>
                  <Td className="text-fg-subtle">{idx + 1}</Td>
                  <Td>
                    <div
                      className="h-6 w-6 rounded-md border border-border ring-2 ring-inset ring-white/5"
                      style={{ background: p.color ?? '#8b5cf6' }}
                    />
                  </Td>
                  <Td className="font-semibold">{p.name}</Td>
                  <Td><Badge tone="brand"><code className="font-mono">{p.key}</code></Badge></Td>
                  <Td className="text-fg-muted max-w-[260px] truncate">{p.description || '—'}</Td>
                  <Td className="hidden md:table-cell text-fg-subtle text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)} title="Edit">
                        <Pencil size={14} />
                      </Button>
                      {deleteConfirm === p.id ? (
                        <>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>Confirm</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteConfirm(p.id)} title="Delete" className="text-danger hover:bg-danger/10">
                          <Trash2 size={14} />
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

      <AdminModal open={modalOpen} onClose={handleClose} title={editTarget ? 'Edit Platform' : 'Add Platform'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {isContributor && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand/10 border border-brand/25 text-brand text-xs">
              <Info size={14} />
              <span>Your changes will be submitted for a superadmin to review before going live.</span>
            </div>
          )}
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. React Native"
              required
              autoFocus
            />
          </Field>

          <Field label="Key (slug)" required hint="Used in URLs — auto-generated from name">
            <Input
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              placeholder="e.g. react-native"
              required
            />
          </Field>

          <Field label="Description">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description…"
            />
          </Field>

          <Field label="Color">
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={cn(
                    'h-8 w-8 rounded-lg border transition-all',
                    form.color === c
                      ? 'border-fg ring-2 ring-brand/40 scale-110'
                      : 'border-border hover:scale-105'
                  )}
                  style={{ background: c }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Color ${c}`}
                />
              ))}
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-8 w-10 rounded-lg cursor-pointer border border-border bg-transparent"
                title="Custom color"
              />
            </div>
          </Field>

          {saveError && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm">
              <AlertCircle size={14} />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {isContributor ? 'Submit for Review' : editTarget ? 'Update Platform' : 'Add Platform'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminPlatforms;
