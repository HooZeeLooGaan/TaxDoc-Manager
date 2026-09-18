import { useState, useCallback, useRef, useEffect } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export const useConfirm = () => {
  // Store the resolver in a Ref to avoid closure stale-state bugs
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });

  const handleClose = useCallback((result: boolean) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null; // Clean up reference immediately
    }
    setIsOpen(false);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    // If a previous dialog was pending, resolve it as false before opening a new one
    if (resolverRef.current) {
      resolverRef.current(false);
    }

    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  // Cleanup: Resolve dangling promise if component unmounts mid-dialog
  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
      }
    };
  }, []);

  const handleConfirm = useCallback(() => handleClose(true), [handleClose]);
  const handleCancel = useCallback(() => handleClose(false), [handleClose]);

  const ConfirmationDialog = (
    <ConfirmDialog
      isOpen={isOpen}
      title={options.title}
      message={options.message}
      confirmLabel={options.confirmLabel}
      cancelLabel={options.cancelLabel}
      isDanger={options.isDanger ?? false}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmationDialog };
};
