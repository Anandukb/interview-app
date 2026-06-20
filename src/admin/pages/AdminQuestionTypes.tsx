import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, ListChecks, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAdminQuestionTypes,
  addAdminQuestionType,
  updateAdminQuestionType,
  deleteAdminQuestionType,
} from '../../store/slices/adminQuestionTypesSlice';
import type { QuestionType } from '../types';
import AdminModal from '../components/AdminModal';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { PageHeader, ErrorBanner, EmptyState } from '../../components/ui/PageHeader';
import { TableWrap, Table, Th, Td, TableRow } from '../../components/ui/Table';

const AdminQuestionTypes = () => {
  const dispatch = useAppDispatch();
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);
  const loading = useAppSelector((s) => s.adminQuestionTypes.loading);
  const error = useAppSelector((s) => s.adminQuestionTypes.error);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuestionType | null>(null);
  const [form, setForm] = useState({ name: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openAdd = () => { setEditTarget(null); setForm({ name: '' }); setSaveError(null); setModalOpen(true); };
  const openEdit = (qt: QuestionType) => { setEditTarget(qt); setForm({ name: qt.name }); setSaveError(null); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditTarget(null); setSaveError(null); };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (editTarget) await dispatch(updateAdminQuestionType({ id: editTarget.id, patch: form })).unwrap();
      else            await dispatch(addAdminQuestionType(form)).unwrap();
      handleClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteAdminQuestionType(id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      <PageHeader
        title="Question Types"
        description="Categorize questions — synced with Supabase"
        actions={
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => dispatch(fetchAdminQuestionTypes())}
              disabled={loading}
              title="Refresh from Supabase"
            >
              <RefreshCw size={15} className={loading ? 'animate-[spin-slow_1s_linear_infinite]' : ''} />
            </Button>
            <Button onClick={openAdd} leftIcon={<Plus size={16} />}>New Type</Button>
          </>
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
            <p className="mt-3 text-sm">Loading question types…</p>
          </div>
        ) : questionTypes.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={28} />}
            title="No question types yet"
            description="Click 'New Type' to add one."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-12">#</Th>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {questionTypes.map((qt, idx) => (
                <TableRow key={qt.id}>
                  <Td className="text-fg-subtle">{idx + 1}</Td>
                  <Td className="text-fg-subtle font-mono text-xs">{qt.id}</Td>
                  <Td className="font-semibold">{qt.name}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(qt)} title="Edit">
                        <Pencil size={14} />
                      </Button>
                      {deleteConfirm === qt.id ? (
                        <>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(qt.id)}>Confirm</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteConfirm(qt.id)} title="Delete" className="text-danger hover:bg-danger/10">
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

      <AdminModal open={modalOpen} onClose={handleClose} title={editTarget ? `Edit: ${editTarget.name}` : 'New Question Type'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder="e.g. Theory, MCQ, Output Prediction, Practical"
              required
              autoFocus
            />
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
              {editTarget ? 'Save Changes' : 'Create Type'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminQuestionTypes;
