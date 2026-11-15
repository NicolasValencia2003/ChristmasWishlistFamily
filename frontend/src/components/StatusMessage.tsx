import { es } from '../i18n/es';

export function Loading() {
  return (
    <p className="status" role="status">
      <span className="spinner" aria-hidden="true" /> {es.common.loading}
    </p>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="status status--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="button button--ghost" onClick={onRetry}>
          {es.common.retry}
        </button>
      )}
    </div>
  );
}

export function ReconnectingBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="banner" role="status">
      {es.common.reconnecting}
    </p>
  );
}
