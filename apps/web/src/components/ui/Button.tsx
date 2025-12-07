"use client";

import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'>;

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

/**
 * Animated button component with multiple variants and loading state.
 * @param variant - Visual style: primary, secondary, ghost, or danger
 * @param size - Button size: sm, md, or lg
 * @param loading - Shows spinner and disables the button
 * @param iconLeft - Icon to show before the label
 * @param iconRight - Icon to show after the label
 * 
 * @example
 * <Button variant="primary" loading={isSubmitting}>
 *   Submit Form
 * </Button>
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      className={`btn ${variantClass[variant]} ${sizeClass[size]} ${className}`.trim()}
      disabled={isDisabled}
      {...(props as HTMLMotionProps<'button'>)}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        </motion.div>
      ) : (
        iconLeft
      )}
      <span>{loading ? 'Chargement...' : children}</span>
      {!loading && iconRight}
    </motion.button>
  );
}
