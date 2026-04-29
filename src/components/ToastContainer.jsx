import { X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useT } from '../contexts/LanguageContext';
import './ToastContainer.css';

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();
  const t = useT();

  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      role="region"
      aria-label={t('toast.region')}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="toast" role="status">
          <span className="toast__message">{toast.message}</span>
          <button
            type="button"
            className="toast__dismiss"
            onClick={() => dismissToast(toast.id)}
            aria-label={t('toast.dismiss')}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
