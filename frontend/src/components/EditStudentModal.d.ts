import { FC } from 'react';
import { Student } from './types';

export interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student: Student | null;
  hideBranch?: boolean;
}

declare const EditStudentModal: FC<EditStudentModalProps>;
export default EditStudentModal;
