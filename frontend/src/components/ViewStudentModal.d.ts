import { FC } from 'react';
import { Student } from './types';

export interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

declare const ViewStudentModal: FC<ViewStudentModalProps>;
export default ViewStudentModal;
