import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  type = 'success', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel' 
}) => {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircleIcon className="h-10 w-10 text-green-500" />,
    warning: <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500" />,
    danger: <ExclamationCircleIcon className="h-10 w-10 text-red-500" />,
  };

  const buttonClasses = {
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-5 border-b">
          <div className="text-xl font-bold text-gray-800">{title}</div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 flex gap-4 items-start">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="text-gray-700">{message}</div>
        </div>
        <div className="px-5 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-md text-white ${buttonClasses[type]} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'danger' ? 'red' : type === 'warning' ? 'yellow' : 'green'}-500`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 