import { FC } from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'danger';
  confirmText?: string;
}

declare const ConfirmationModal: FC<ConfirmationModalProps>;
export default ConfirmationModal;
