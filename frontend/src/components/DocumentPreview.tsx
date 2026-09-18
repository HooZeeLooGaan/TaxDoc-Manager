import { useEffect, useState } from 'react';
import { getDocumentMetadata } from '../services/document';

interface DocumentDetailProps {
  fileId: string;
  onClose?: () => void;
}

export default function DocumentPreview({
  fileId,
  onClose,
}: DocumentDetailProps) {
  const [documentContent, setDocumentContent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    async function getDocumentPreview() {
      try {
        const docBytes = await getDocumentMetadata(fileId);
        if (mounted) {
          setDocumentContent(docBytes);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load preview');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getDocumentPreview();
    return () => {
      mounted = false;
    };
  }, [fileId]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading document preview...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!documentContent) {
    return (
      <div className="p-4 text-gray-500">
        <p>The file cannot be previewed</p>
      </div>
    );
  }
  // Inside your return block for text/OCR JSON responses:
  if (typeof documentContent === 'string') {
    return (
      <div className="p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg max-h-[500px] overflow-y-auto whitespace-pre-wrap">
        {documentContent}
      </div>
    );
  }

  // If returning parsed OCR fields (JSON Object)
  if (typeof documentContent === 'object' && documentContent !== null) {
    return (
      <div className="p-4 bg-white rounded-lg space-y-3">
        <h3 className="font-semibold text-gray-700 border-b pb-2">
          Extracted Document Data
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Render the webViewLink directly in an iframe */}
          <iframe
            src={documentContent.file_path}
            title="Document Preview"
            className="w-full flex-1 border-0"
            allow="autoplay"
          />
        </div>
      </div>
    );
  }
}
