import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline';
}

export function Badge({ className = "", variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = variant === 'outline' ? "border border-neutral-200 bg-transparent text-neutral-900" : "bg-neutral-900 text-white";
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}