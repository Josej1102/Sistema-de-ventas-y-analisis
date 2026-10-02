import { AlertCircle, Inbox, LoaderCircle, RefreshCcw } from 'lucide-react';

export function LoadingState({ text = 'Cargando información...' }) {
  return (
    <div className="page-state">
      <LoaderCircle className="spin" size={28} />
      <strong>{text}</strong>
      <span>Estamos consultando el servidor.</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="page-state error-state">
      <AlertCircle size={30} />
      <strong>No se pudo cargar esta sección</strong>
      <span>{message}</span>
      {onRetry && (
        <button className="secondary-btn" onClick={onRetry}>
          <RefreshCcw size={16} /> Intentar nuevamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="page-state">
      <Inbox size={32} />
      <strong>{title}</strong>
      <span>{description}</span>
      {action}
    </div>
  );
}
