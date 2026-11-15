import { es } from '../i18n/es';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  giftName?: string;
  busy: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, giftName, busy, error, onConfirm, onCancel }: Props) {
  const t = es.confirmDelete;
  return (
    <Modal open={open} title={t.title} onClose={onCancel} busy={busy}>
      <p className="confirm__message">{t.message}</p>
      {giftName && <p className="confirm__gift">«{giftName}»</p>}
      {error && (
        <p className="alert alert--error" role="alert">
          {error}
        </p>
      )}
      <div className="confirm__actions">
        <button type="button" className="button button--ghost" onClick={onCancel} disabled={busy} autoFocus>
          {es.common.cancel}
        </button>
        <button type="button" className="button button--danger" onClick={onConfirm} disabled={busy}>
          {busy ? t.deleting : t.confirm}
        </button>
      </div>
    </Modal>
  );
}
