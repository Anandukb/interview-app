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
import '../admin.css';
import './AdminQuestionTypes.css';

const EMPTY_FORM = { name: '' };

const AdminQuestionTypes = () => {
  const dispatch = useAppDispatch();
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);
  const loading = useAppSelector((s) => s.adminQuestionTypes.loading);
  const error = useAppSelector((s) => s.adminQuestionTypes.error);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuestionType | null>(null);
  const [form, setForm] = useState<{ name: string }>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (qt: QuestionType) => {
    setEditTarget(qt);
    setForm({ name: qt.name });
    setSaveError(null);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditTarget(null);
    setSaveError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (editTarget) {
        await dispatch(updateAdminQuestionType({ id: editTarget.id, patch: form })).unwrap();
      } else {
        await dispatch(addAdminQuestionType(form)).unwrap();
      }
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
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Question Types</h1>
          <p className="admin-page-subtitle">Categorize questions — synced with Supabase</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => dispatch(fetchAdminQuestionTypes())}
            disabled={loading}
            title="Refresh from Supabase"
          >
            <RefreshCw
              size={15}
              style={loading ? { animation: 'spin-slow 1s linear infinite' } : {}}
            />
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAdd} id="add-question-type-btn">
            <Plus size={16} />
            New Type
          </button>
        </div>
      </div>

      {error && (
        <div className="platforms-error-banner">
          <AlertCircle size={15} />
          <span>Supabase error: {error}</span>
        </div>
      )}

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-empty">
            <span className="platforms-spinner" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading question types…</p>
          </div>
        ) : questionTypes.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><ListChecks size={40} /></div>
            <p>No question types yet. Click "New Type" to create one.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questionTypes.map((qt, idx) => (
                <tr key={qt.id}>
                  <td style={{ color: 'var(--text-muted)', width: '40px' }}>{idx + 1}</td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{qt.id}</td>
                  <td style={{ fontWeight: 600 }}>{qt.name}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-btn admin-btn-icon admin-btn-secondary"
                        onClick={() => openEdit(qt)}
                        title="Edit"
                        id={`edit-qtype-${qt.id}`}
                      >
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === qt.id ? (
                        <>
                          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(qt.id)}>
                            Confirm
                          </button>
                          <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="admin-btn admin-btn-icon admin-btn-danger"
                          onClick={() => setDeleteConfirm(qt.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={handleClose}
        title={editTarget ? `Edit: ${editTarget.name}` : 'New Question Type'}
      >
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">
              Name <span className="required">*</span>
            </label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder="e.g. Theory, MCQ, Output Prediction, Practical"
              required
              autoFocus
            />
          </div>

          {saveError && (
            <div className="platforms-error-banner" style={{ marginTop: '8px' }}>
              <AlertCircle size={14} />
              <span>{saveError}</span>
            </div>
          )}

          <div className="admin-form-actions">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? (
                <span className="admin-login-spinner" style={{ width: '16px', height: '16px' }} />
              ) : editTarget ? (
                'Save Changes'
              ) : (
                'Create Type'
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminQuestionTypes;
