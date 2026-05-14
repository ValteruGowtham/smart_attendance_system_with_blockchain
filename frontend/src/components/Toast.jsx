import { useState, useEffect } from 'react';
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle } from 'react-icons/hi';

function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };

  const icons = {
    success: <HiCheckCircle className="w-6 h-6 text-green-500" />,
    error: <HiExclamationCircle className="w-6 h-6 text-red-500" />,
    warning: <HiExclamationCircle className="w-6 h-6 text-yellow-500" />,
    info: <HiInformationCircle className="w-6 h-6 text-blue-500" />,
  };

  return (
    <div className={`fixed top-20 right-6 z-50 p-4 rounded-lg shadow-lg flex items-start gap-3 min-w-80 max-w-md border-l-4 animate-slide-in ${colors[type]}`}>
      {icons[type]}
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={() => { setVisible(false); onClose && onClose(); }}>
        <HiX className="w-5 h-5 text-gray-400 hover:text-gray-600" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts = [], onClose, position = 'top-right' }) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 pointer-events-none space-y-2`}>
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast
            message={t.message || t.title}
            type={t.variant || t.type || 'info'}
            onClose={() => onClose(t.id)}
          />
        </div>
      ))}
    </div>
  );
}

export default Toast;
