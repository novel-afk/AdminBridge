declare module '../../components/ui/checkbox' {
  interface CheckboxProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
    value?: string;
    label?: string;
  }

  const Checkbox: React.FC<CheckboxProps>;
  export default Checkbox;
}
