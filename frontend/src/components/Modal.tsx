import { ReactNode, useEffect, useRef } from 'react';
import { es } from '../i18n/es';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Blocks closing (e.g. while a request is in flight). */
  busy?: boolean;
}

/** Accessible modal built on the native <dialog> element (focus trap + Escape for free). */
export function Modal({ open, title, onClose, children, busy }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useRef(`modal-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop closes the dialog.
        if (e.target === ref.current && !busy) onClose();
      }}
    >
      <div className="modal__inner">
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={busy}
            aria-label={es.common.close}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}
