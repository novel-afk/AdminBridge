import { FC } from 'react';

export interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hideBranch?: boolean;
  initialData?: Partial<Student>;
}

declare const AddStudentModal: FC<AddStudentModalProps>;
export default AddStudentModal;
