import React, { useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ChangePasswordModal from './ChangePasswordModal';
import { useAuth } from '../lib/AuthContext';

const DefaultPasswordAlert: React.FC = () => {
  const { isUsingDefaultPassword } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isUsingDefaultPassword || isDismissed) {
    return null;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePasswordChanged = () => {
    setIsModalOpen(false);
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You are using the default password (Nepal@123). For security reasons, please change your password.
              <button
                onClick={handleOpenModal}
                className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
              >
                Change Password
              </button>
              <button
                onClick={handleDismiss}
                className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
              >
                Dismiss
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <ChangePasswordModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handlePasswordChanged} 
      />
    </>
  );
};

export default DefaultPasswordAlert; 