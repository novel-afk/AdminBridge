import React from 'react';

const Badge = React.forwardRef(({ 
  className = '',
  variant = 'default',
  children,
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export { Badge }; 