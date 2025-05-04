declare module '../../components/ui/badge' {
  import * as React from 'react';
  
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  }
  
  export const Badge: React.FC<BadgeProps>;
  export const badgeVariants: (props: { variant?: BadgeProps['variant'] }) => string;
} 