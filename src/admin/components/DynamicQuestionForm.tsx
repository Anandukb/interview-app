import { useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import type { QuestionType, MCOption } from '../types';
import RichTextEditor from './RichTextEditor';
import '../admin.css';
import './DynamicQuestionForm.css';

const uid = () => `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

interface DynamicQuestionFormProps {
  questionType: QuestionType;
  values: Record<string, string | MCOption[]>;
  onChange: (values: Record<string, string | MCOption[]>) => void;
}

const DynamicQuestionForm = ({ questionType, values, onChange }: DynamicQuestionFormProps) => {
  const updateValue = useCallback(
    (fieldId: string, val: string | MCOption[]) => {
      onChange({ ...values, [fieldId]: val });
    },
    [values, onChange]
  );

  const updateOption = useCallback(
    (fieldId: string, optId: string, patch: Partial<MCOption>) => {
      const opts = (values[fieldId] as MCOption[]) ?? [];
      onChange({
        ...values,
        [fieldId]: opts.map((o) => (o.id === optId ? { ...o, ...patch } : o)),
      });
    },
    [values, onChange]
  );

  const addOption = useCallback(
    (fieldId: string) => {
      const opts = (values[fieldId] as MCOption[]) ?? [];
      onChange({
        ...values,
        [fieldId]: [
          ...opts,
          { id: uid(), label: '', isCorrect: false },
        ],
      });
    },
    [values, onChange]
  );

  const removeOption = useCallback(
    (fieldId: string, optId: string) => {
      const opts = (values[fieldId] as MCOption[]) ?? [];
      onChange({ ...values, [fieldId]: opts.filter((o) => o.id !== optId) });
    },
    [values, onChange]
  );

  return (
    <div className="dqf-container">
      {questionType.fields.map((field) => {
        const fieldVal = values[field.id];
        const strVal = typeof fieldVal === 'string' ? fieldVal : '';
        const optsVal = Array.isArray(fieldVal) ? (fieldVal as MCOption[]) : [];

        return (
          <div key={field.id} className="admin-form-group">
            <label className="admin-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>

            {/* text */}
            {field.fieldType === 'text' && (
              <input
                className="admin-input"
                value={strVal}
                onChange={(e) => updateValue(field.id, e.target.value)}
                placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
              />
            )}

            {/* richtext */}
            {field.fieldType === 'richtext' && (
              <RichTextEditor
                value={strVal}
                onChange={(val) => updateValue(field.id, val)}
                placeholder={field.placeholder}
              />
            )}

            {/* code-editor */}
            {field.fieldType === 'code-editor' && (
              <div className="dqf-code-editor">
                <div className="dqf-code-header">
                  <span className="dqf-code-lang">{field.language ?? 'javascript'}</span>
                </div>
                <Editor
                  height="240px"
                  language={field.language ?? 'javascript'}
                  value={strVal}
                  onChange={(val) => updateValue(field.id, val ?? '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace',
                  }}
                />
              </div>
            )}

            {/* hint / sample */}
            {(field.fieldType === 'hint' || field.fieldType === 'sample') && (
              <textarea
                className="admin-textarea"
                value={strVal}
                onChange={(e) => updateValue(field.id, e.target.value)}
                placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}…`}
                rows={4}
              />
            )}

            {/* options */}
            {field.fieldType === 'options' && (
              <div className="dqf-options">
                {optsVal.map((opt, idx) => (
                  <div key={opt.id} className="dqf-option-row">
                    <span className="dqf-option-idx">{String.fromCharCode(65 + idx)}</span>
                    <input
                      className="admin-input"
                      value={opt.label}
                      onChange={(e) =>
                        updateOption(field.id, opt.id, { label: e.target.value })
                      }
                      placeholder={`Option ${String.fromCharCode(65 + idx)}…`}
                    />
                    <label className="dqf-correct-toggle" title="Mark as correct">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={(e) =>
                          updateOption(field.id, opt.id, { isCorrect: e.target.checked })
                        }
                      />
                      <span className={`dqf-correct-pill ${opt.isCorrect ? 'correct' : ''}`}>
                        {opt.isCorrect ? '✓ Correct' : 'Correct?'}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="admin-btn admin-btn-icon admin-btn-danger"
                      onClick={() => removeOption(field.id, opt.id)}
                      title="Remove option"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="admin-btn admin-btn-sm admin-btn-secondary dqf-add-option"
                  onClick={() => addOption(field.id)}
                >
                  <Plus size={13} />
                  Add Option
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DynamicQuestionForm;
