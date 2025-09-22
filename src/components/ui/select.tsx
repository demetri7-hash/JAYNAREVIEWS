import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value || '');

  // Update internal value when prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child as React.ReactElement<{ 
              value?: string; 
              isOpen?: boolean; 
              setIsOpen?: (open: boolean) => void; 
            }>, {
              value: internalValue,
              isOpen,
              setIsOpen,
            });
          }
          if (child.type === SelectContent) {
            return React.cloneElement(child as React.ReactElement<{ 
              isOpen?: boolean; 
              onValueChange?: (value: string) => void; 
            }>, {
              isOpen,
              onValueChange: handleValueChange,
            });
          }
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value?: string;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
  }
>(({ className, children, isOpen, setIsOpen, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    onClick={() => setIsOpen?.(!isOpen)}
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    value?: string;
    placeholder?: string;
  }
>(({ className, value, placeholder, ...props }, ref) => (
  <span ref={ref} className={cn(className)} {...props}>
    {value || placeholder || 'Select...'}
  </span>
));
SelectValue.displayName = 'SelectValue';

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    isOpen?: boolean;
    onValueChange?: (value: string) => void;
  }
>(({ className, children, isOpen, onValueChange, ...props }, ref) => {
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute top-full left-0 z-[9999] w-full rounded-md border bg-white text-gray-900 shadow-2xl ring-1 ring-black ring-opacity-5 fixed',
        className
      )}
      {...props}
    >
      <div className="p-1 bg-white rounded-md">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child as React.ReactElement<{ onValueChange?: (value: string) => void }>, { onValueChange });
          }
          return child;
        })}
      </div>
    </div>
  );
});
SelectContent.displayName = 'SelectContent';

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, children, value, onValueChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none bg-white hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 transition-colors',
      className
    )}
    onClick={() => onValueChange?.(value)}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = 'SelectItem';