import { useState } from 'react';
import { DocumentType } from '../services/document';
import {
  createClientRequirement,
  rederiveClientRequirements,
  type RequirementRequest,
} from '../services/requirement';

interface RequirementFormProps {
  clientId: string;
  clientName: string;
  isOpen: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

export type DocumentTypeValue =
  (typeof DocumentType)[keyof typeof DocumentType];

export default function RequirementFormOverlay({
  clientId,
  clientName,
  isOpen,
  onSuccess,
  onClose,
}: RequirementFormProps) {
  const [documentType, setDocumentType] = useState<DocumentTypeValue>(
    Object.values(DocumentType)[0] as DocumentTypeValue
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState<string>('');
  const [isMandatory, setIsMandatory] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: RequirementRequest = {
      document_type: documentType,
      description: description,
      is_mandatory: isMandatory,
    };

    try {
      const requirement = await createClientRequirement(clientId, payload);
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      setError(err || 'Error creating client requirements');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="w-full max-h-[90%] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-w-sm">
        {/* Dialog Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-slate-900 text-sm tracking-tight">
            Add Requirement
          </h4>
          <button
            onClick={onClose}
            type="button"
            className="ml-auto p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer text-xs leading-none flex items-center justify-center w-6 h-6"
            title="Close Dialog"
          >
            ✕
          </button>
        </div>

        {/* Dialog Form Body (Single scrollable container) */}
        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto flex-1 space-y-4"
        >
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Document Type Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Client: {clientName}
            </label>
          </div>

          {/* Document Type Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) =>
                setDocumentType(e.target.value as DocumentTypeValue)
              }
              disabled={loading}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              {Object.values(DocumentType).map((docType) => (
                <option key={docType} value={docType}>
                  {docType}
                </option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description"
              disabled={loading}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Mandatory Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="isMandatory"
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="isMandatory"
              className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
            >
              Mandatory?
            </label>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 text-slate-600 text-xs font-medium hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              {loading ? 'Adding...' : 'Add Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
