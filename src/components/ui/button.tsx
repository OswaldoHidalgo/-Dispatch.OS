import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
    let baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:opacity-50 cursor-pointer";
    let variantStyles = variant === 'ghost' ? "hover:bg-neutral-100" : variant === 'outline' ? "border border-neutral-200 bg-transparent" : "bg-neutral-900 text-white hover:bg-neutral-800";
    let sizeStyles = size === 'icon' ? "h-9 w-9" : size === 'sm' ? "h-8 px-3 text-xs" : "h-10 px-4 py-2 text-sm";
    
    return (
      <button ref={ref} className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";