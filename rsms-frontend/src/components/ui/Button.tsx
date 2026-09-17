import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'rsms-gradient-primary text-white hover:brightness-105 focus-visible:ring-[#8c7ce2] shadow-sm shadow-[#6655c5]/20',
  secondary: 'rsms-gradient-secondary text-[#14745e] hover:brightness-105 focus-visible:ring-[#7cc9b2]',
  danger: 'rsms-gradient-danger text-white hover:brightness-105 focus-visible:ring-[#dc5d6a]',
  ghost: 'rsms-control text-slate-700 hover:brightness-105 focus-visible:ring-[#8c7ce2]',
  outline: 'rsms-control border border-slate-300 text-slate-700 hover:border-[#8c7ce2] focus-visible:ring-[#8c7ce2]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'btn inline-flex items-center justify-center gap-2 rounded-xl border-0 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
