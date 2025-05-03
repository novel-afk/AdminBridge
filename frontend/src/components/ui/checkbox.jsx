import React from 'react';

const Checkbox = React.forwardRef(({ 
  className = '',
  checked,
  onCheckedChange,
  ...props 
}, ref) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        ref={ref}
        className={`h-4 w-4 rounded border-gray-300 text-[#1e1b4b] focus:ring-[#1e1b4b] ${className}`}
        checked={checked}
        onChange={e => onCheckedChange && onCheckedChange(e.target.checked)}
        {...props}
      />
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox }; 