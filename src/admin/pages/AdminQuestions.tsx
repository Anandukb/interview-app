import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
} from '../../store/slices/adminQuestionsSlice';
import type { AdminQuestion, MCOption } from '../types';
import AdminModal from '../components/AdminModal';
import DynamicQuestionForm from '../components/DynamicQuestionForm';
import '../admin.css';
import './AdminQuestions.css';

const AdminQuestions = () => {
  const dispatch = useAppDispatch();
  const questions = useAppSelector((s) => s.adminQuestions.data);
  const questionTypes = useAppSelector((s) => s.adminQuestionTypes.data);
  const platforms = useAppSelector((s) => s.adminPlatforms.data);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminQuestion | null>(null);
  const [selectedPlatformId, setSelectedPlatformId] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string | MCOption[]>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const selectedType = questionTypes.find((qt) => qt.id === selectedTypeId);

  const openAdd = () => {
    setEditTarget(null);
    setSelectedPlatformId(platforms[0]?.id ?? '');
    setSelectedTypeId(questionTypes[0]?.id ?? '');
    setFieldValues({});
    setModalOpen(true);
  };

  const openEdit = (q: AdminQuestion) => {
    setEditTarget(q);
    setSelectedPlatformId(q.platformId);
    setSelectedTypeId(q.questionTypeId);
    setFieldValues({ ...q.fieldValues });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditTarget(null);
    setFieldValues({});
  };

  const handleTypeChange = (typeId: string) => {
    setSelectedTypeId(typeId);
    setFieldValues({}); // reset values when type changes
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      platformId: selectedPlatformId,
      questionTypeId: selectedTypeId,
      fieldValues,
    };

    if (editTarget) {
      dispatch(updateAdminQuestion({ id: editTarget.id, patch: payload }));
    } else {
      dispatch(addAdminQuestion(payload));
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    dispatch(deleteAdminQuestion(id));
    setDeleteConfirm(null);
  };

  // Lookup helpers
  const getPlatformName = (id: string) => platforms.find((p) => p.id === id)?.name ?? id;
  const getTypeName = (id: string) => questionTypes.find((qt) => qt.id === id)?.name ?? id;
  const getQuestionTitle = (q: AdminQuestion) => {
    // Try to find the first "text" field value
    const type = questionTypes.find((qt) => qt.id === q.questionTypeId);
    if (!type) return 'Untitled';
    const textField = type.fields.find((f) => f.fieldType === 'text');
    if (!textField) return 'Untitled';
    const val = q.fieldValues[textField.id];
    return typeof val === 'string' && val ? val : 'Untitled';
  };

  return (
    <div>
      {/* Page header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Questions</h1>
          <p className="admin-page-subtitle">
            Add interview questions with dynamic fields based on question type
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          onClick={openAdd}
          id="add-question-btn"
          disabled={platforms.length === 0 || questionTypes.length === 0}
          title={platforms.length === 0 ? 'Add a platform first' : questionTypes.length === 0 ? 'Add a question type first' : ''}
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      {/* Prerequisites warning */}
      {(platforms.length === 0 || questionTypes.length === 0) && (
        <div className="questions-prereq-warning">
          <HelpCircle size={16} />
          <span>
            {platforms.length === 0
              ? 'Please add at least one platform before adding questions.'
              : 'Please add at least one question type before adding questions.'}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="admin-table-wrapper">
        {questions.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><HelpCircle size={40} /></div>
            <p>No questions yet. Click "Add Question" to start building your question bank.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Platform</th>
                <th>Type</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td style={{ color: 'var(--text-muted)', width: '40px' }}>{idx + 1}</td>
                  <td style={{ maxWidth: '280px' }}>
                    <span className="question-title-cell" title={getQuestionTitle(q)}>
                      {getQuestionTitle(q)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-purple">
                      {getPlatformName(q.platformId)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-green">
                      {getTypeName(q.questionTypeId)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(q.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        className="admin-btn admin-btn-icon admin-btn-secondary"
                        onClick={() => openEdit(q)}
                        title="Edit"
                        id={`edit-question-${q.id}`}
                      >
                        <Pencil size={14} />
                      </button>
                      {deleteConfirm === q.id ? (
                        <>
                          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(q.id)}>
                            Confirm
                          </button>
                          <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="admin-btn admin-btn-icon admin-btn-danger"
                          onClick={() => setDeleteConfirm(q.id)}
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
        title={editTarget ? 'Edit Question' : 'Add Question'}
        width="720px"
      >
        <form onSubmit={handleSubmit}>
          {/* Platform + Type selectors */}
          <div className="questions-selectors">
            <div className="admin-form-group" style={{ flex: 1 }}>
              <label className="admin-label">
                Platform <span className="required">*</span>
              </label>
              <select
                className="admin-select"
                value={selectedPlatformId}
                onChange={(e) => setSelectedPlatformId(e.target.value)}
                required
              >
                <option value="" disabled>Select platform…</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group" style={{ flex: 1 }}>
              <label className="admin-label">
                Question Type <span className="required">*</span>
              </label>
              <select
                className="admin-select"
                value={selectedTypeId}
                onChange={(e) => handleTypeChange(e.target.value)}
                required
              >
                <option value="" disabled>Select type…</option>
                {questionTypes.map((qt) => (
                  <option key={qt.id} value={qt.id}>{qt.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic form fields */}
          {selectedType ? (
            <div className="questions-dynamic-section">
              <div className="questions-type-banner">
                <span className="questions-type-label">
                  Fields for: <strong>{selectedType.name}</strong>
                </span>
                {selectedType.description && (
                  <span className="questions-type-desc">{selectedType.description}</span>
                )}
              </div>
              <DynamicQuestionForm
                questionType={selectedType}
                values={fieldValues}
                onChange={setFieldValues}
              />
            </div>
          ) : (
            <div className="questions-no-type">
              Select a question type above to see the form fields.
            </div>
          )}

          <div className="admin-form-actions">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={!selectedType}>
              {editTarget ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminQuestions;
