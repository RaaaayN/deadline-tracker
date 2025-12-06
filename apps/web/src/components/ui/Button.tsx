import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

export function Button({
  children,
  variant = 'primary',
  loading = false,
  iconLeft,
  iconRight,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn ${variantClass[variant] ?? ''} ${className}`.trim()}
      disabled={loading || props.disabled}
      {...props}
    >
      {iconLeft}
      {loading ? 'Patiente...' : children}
      {iconRight}
    </button>
  );
}

