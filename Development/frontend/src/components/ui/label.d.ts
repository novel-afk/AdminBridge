declare module '../../components/ui/label' {
  import * as React from 'react';
  
  export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
  
  export const Label: React.ForwardRefExoticComponent<
    LabelProps & React.RefAttributes<HTMLLabelElement>
  >;
} 