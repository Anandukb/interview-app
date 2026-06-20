import { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import type { QuestionField, FieldType } from '../types';
import { FIELD_TYPE_LABELS } from '../types';
import '../admin.css';
import './FieldConfigurator.css';

interface FieldConfiguratorProps {
  fields: QuestionField[];
  onChange: (fields: QuestionField[]) => void;
}

const FIELD_TYPES: FieldType[] = [
  'text',
  'richtext',
  'code-editor',
  'options',
  'hint',
  'sample',
];

const CODE_LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'html', 'css'];

const uid = () => `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const FieldConfigurator = ({ fields, onChange }: FieldConfiguratorProps) => {
  const addField = useCallback(() => {
    onChange([
      ...fields,
      {
        id: uid(),
        label: 'New Field',
        fieldType: 'text',
        required: false,
        placeholder: '',
      },
    ]);
  }, [fields, onChange]);

  const updateField = useCallback(
    (id: string, patch: Partial<QuestionField>) => {
      onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    },
    [fields, onChange]
  );

  const removeField = useCallback(
    (id: string) => onChange(fields.filter((f) => f.id !== id)),
    [fields, onChange]
  );

  const moveField = useCallback(
    (index: number, dir: -1 | 1) => {
      const next = [...fields];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return;
      [next[index], next[swap]] = [next[swap], next[index]];
      onChange(next);
    },
    [fields, onChange]
  );

  return (
    <div className="field-configurator">
      <div className="field-config-header">
        <span className="field-config-title">Form Fields ({fields.length})</span>
        <button type="button" className="admin-btn admin-btn-sm admin-btn-primary" onClick={addField}>
          <Plus size={14} />
          Add Field
        </button>
      </div>

      {fields.length === 0 && (
        <div className="field-config-empty">
          No fields yet. Click "Add Field" to get started.
        </div>
      )}

      <div className="field-config-list">
        {fields.map((field, idx) => (
          <div key={field.id} className="field-config-item">
            {/* Drag handle / order */}
            <div className="field-config-grip">
              <GripVertical size={14} />
              <div className="field-config-order-btns">
                <button
                  type="button"
                  className="admin-btn admin-btn-icon"
                  onClick={() => moveField(idx, -1)}
                  disabled={idx === 0}
                  title="Move up"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-icon"
                  onClick={() => moveField(idx, 1)}
                  disabled={idx === fields.length - 1}
                  title="Move down"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>

            {/* Field config body */}
            <div className="field-config-body">
              <div className="field-config-row">
                {/* Label */}
                <div className="admin-form-group" style={{ flex: 2 }}>
                  <label className="admin-label">Label</label>
                  <input
                    className="admin-input"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="Field label…"
                  />
                </div>

                {/* Field Type */}
                <div className="admin-form-group" style={{ flex: 2 }}>
                  <label className="admin-label">Type</label>
                  <select
                    className="admin-select"
                    value={field.fieldType}
                    onChange={(e) =>
                      updateField(field.id, { fieldType: e.target.value as FieldType })
                    }
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft} value={ft}>
                        {FIELD_TYPE_LABELS[ft]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Required toggle */}
                <div className="admin-form-group field-required-group">
                  <label className="admin-label">Required</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Placeholder (for text/hint/sample) */}
              {['text', 'hint', 'sample'].includes(field.fieldType) && (
                <div className="admin-form-group">
                  <label className="admin-label">Placeholder</label>
                  <input
                    className="admin-input"
                    value={field.placeholder ?? ''}
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                    placeholder="Optional placeholder text…"
                  />
                </div>
              )}

              {/* Language (for code-editor) */}
              {field.fieldType === 'code-editor' && (
                <div className="admin-form-group">
                  <label className="admin-label">Language</label>
                  <select
                    className="admin-select"
                    value={field.language ?? 'javascript'}
                    onChange={(e) => updateField(field.id, { language: e.target.value })}
                  >
                    {CODE_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Remove */}
            <button
              type="button"
              className="admin-btn admin-btn-icon admin-btn-danger field-config-remove"
              onClick={() => removeField(field.id)}
              title="Remove field"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldConfigurator;
