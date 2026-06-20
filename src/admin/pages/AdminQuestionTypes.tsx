import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, ListChecks } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addQuestionType,
  updateQuestionType,
  deleteQuestionType,
} from '../../store/slices/adminQuestionTypesSlice';
import type { QuestionType, QuestionField } from '../types';
import AdminModal from '../components/AdminModal';
import FieldConfigurator from '../components/FieldConfigurator';
import '../admin.css';
import './AdminQuestionTypes.css';

type FormState = {
  name: string;
  description: string;
  fields: QuestionField[];
};

const EMPTY_FORM: FormState = { name: '', description: '', fields: [] };

const AdminQuestionTypes = () => {
  const dispatch = useAppDispatch();
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuestionType | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (qt: QuestionType) => {
    setEditTarget(qt);
    setForm({ name: qt.name, description: qt.description ?? '', fields: [...qt.fields] });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      dispatch(updateQuestionType({ id: editTarget.id, patch: form }));
    } else {
      dispatch(addQuestionType(form));
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    dispatch(deleteQuestionType(id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Question Types</h1>
          <p className="admin-page-subtitle">
            Create and configure question formats with custom field layouts
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd} id="add-question-type-btn">
          <Plus size={16} />
          New Type
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        {questionTypes.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><ListChecks size={40} /></div>
            <p>No question types yet. Click "New Type" to create one.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Fields</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questionTypes.map((qt, idx) => (
                <tr key={qt.id}>
                  <td style={{ color: 'var(--text-muted)', width: '40px' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{qt.name}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '220px' }}>
                    {qt.description || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <div className="qt-field-chips">
                      {qt.fields.slice(0, 3).map((f) => (
                        <span key={f.id} className="admin-badge admin-badge-purple">
                          {f.label}
                        </span>
                      ))}
                      {qt.fields.length > 3 && (
                        <span className="admin-badge admin-badge-green">
                          +{qt.fields.length - 3} more
                        </span>
                      )}
                      {qt.fields.length === 0 && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No fields</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(qt.createdAt).toLocaleDateString()}
                  </td>
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

      {/* Add/Edit Modal */}
      <AdminModal
        open={modalOpen}
        onClose={handleClose}
        title={editTarget ? `Edit: ${editTarget.name}` : 'New Question Type'}
        width="680px"
      >
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">
              Type Name <span className="required">*</span>
            </label>
            <input
              className="admin-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Theory Question, Output Prediction…"
              required
              autoFocus
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <input
              className="admin-input"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of when to use this type…"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label" style={{ marginBottom: '8px', display: 'block' }}>
              Form Fields
            </label>
            <FieldConfigurator
              fields={form.fields}
              onChange={(fields) => setForm((f) => ({ ...f, fields }))}
            />
          </div>

          <div className="admin-form-actions">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {editTarget ? 'Save Changes' : 'Create Type'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminQuestionTypes;
