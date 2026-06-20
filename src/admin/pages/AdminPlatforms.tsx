import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAdminPlatforms,
  addAdminPlatform,
  updateAdminPlatform,
  deleteAdminPlatform,
} from '../../store/slices/adminPlatformsSlice';
import type { AdminPlatform } from '../types';
import AdminModal from '../components/AdminModal';
import '../admin.css';
import './AdminPlatforms.css';

const PRESET_COLORS = [
  '#f7df1e', '#3178c6', '#61dafb', '#e34f26', '#264de4',
  '#339933', '#a78bfa', '#f59e0b', '#10b981', '#ef4444',
];

type FormState = {
  name: string;
  key: string;
  description: string;
  color: string;
};

const EMPTY_FORM: FormState = { name: '', key: '', description: '', color: '#8b5cf6' };

const AdminPlatforms = () => {
  const dispatch = useAppDispatch();
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const platformsLoading = useAppSelector((s) => s.adminPlatforms.loading);
  const platformsError = useAppSelector((s) => s.adminPlatforms.error);

  const fetchPlatforms = () => { dispatch(fetchAdminPlatforms()); };
  const addPlatform = (p: Omit<AdminPlatform, 'id' | 'createdAt'>) =>
    dispatch(addAdminPlatform(p)).unwrap();
  const updatePlatform = (id: string, patch: Partial<AdminPlatform>) =>
    dispatch(updateAdminPlatform({ id, patch })).unwrap();
  const deletePlatform = (id: string) => dispatch(deleteAdminPlatform(id)).unwrap();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminPlatform | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (p: AdminPlatform) => {
    setEditTarget(p);
    setForm({ name: p.name, key: p.key, description: p.description ?? '', color: p.color ?? '#8b5cf6' });
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
        await updatePlatform(editTarget.id, form);
      } else {
        await addPlatform(form);
      }
      handleClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePlatform(id);
    setDeleteConfirm(null);
  };

  // Auto-generate key from name
  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      key: editTarget ? f.key : name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  };

  return (
    <div>
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Platforms</h1>
          <p className="admin-page-subtitle">Manage interview topics — synced with Supabase</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={fetchPlatforms}
            disabled={platformsLoading}
            title="Refresh from Supabase"
          >
            <RefreshCw size={15} style={platformsLoading ? { animation: 'spin-slow 1s linear infinite' } : {}} />
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAdd} id="add-platform-btn">
            <Plus size={16} />
            Add Platform
          </button>
        </div>
      </div>

      {/* API error banner */}
      {platformsError && (
        <div className="platforms-error-banner">
          <AlertCircle size={15} />
          <span>Supabase error: {platformsError}</span>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrapper">
        {platformsLoading ? (
          <div className="admin-empty">
            <span className="platforms-spinner" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading platforms…</p>
          </div>
        ) : platforms.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><Layers size={40} /></div>
            <p>No platforms yet. Click "Add Platform" to create one.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Color</th>
                <th>Name</th>
                <th>Key (slug)</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-muted)', width: '40px' }}>{idx + 1}</td>
                  <td style={{ width: '50px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: p.color ?? '#8b5cf6',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>
                    <span className="admin-badge admin-badge-purple">{p.key}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '220px' }}>
                    {p.description || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-btn admin-btn-icon admin-btn-secondary"
                        onClick={() => openEdit(p)}
                        title="Edit"
                        id={`edit-platform-${p.id}`}
                      >
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === p.id ? (
                        <>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            onClick={() => handleDelete(p.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="admin-btn admin-btn-icon admin-btn-danger"
                          onClick={() => setDeleteConfirm(p.id)}
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

      {/* Add/Edit Modal */}
      <AdminModal
        open={modalOpen}
        onClose={handleClose}
        title={editTarget ? 'Edit Platform' : 'Add Platform'}
      >
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">
              Name <span className="required">*</span>
            </label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. React Native"
              required
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">
              Key (slug) <span className="required">*</span>
            </label>
            <input
              className="admin-input"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              placeholder="e.g. react-native"
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Used in URLs — auto-generated from name
            </span>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <input
              className="admin-input"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description…"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Color</label>
            <div className="platform-color-picker">
              <div className="platform-color-swatches">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    title={c}
                  />
                ))}
              </div>
              <input
                type="color"
                className="platform-color-input"
                value={form.color}
                onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                title="Custom color"
              />
            </div>
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
              {saving ? <span className="admin-login-spinner" style={{ width: '16px', height: '16px' }} /> : (editTarget ? 'Update Platform' : 'Add Platform')}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminPlatforms;
