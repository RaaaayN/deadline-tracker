"use client";

import { motion } from 'framer-motion';
import React, { type InputHTMLAttributes, type ReactNode } from 'react';

type InputProps = {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

/**
 * Input component with optional label, icon, hint, and error states.
 * @param label - Label displayed above the input
 * @param hint - Helper text below the input
 * @param error - Error message (replaces hint when present)
 * @param icon - Icon displayed inside the input on the left
 * 
 * @example
 * <Input 
 *   label="Email" 
 *   type="email"
 *   icon={<Mail size={18} />}
 *   error={errors.email}
 * />
 */
export function Input({
  label,
  hint,
  error,
  icon,
  className = '',
  id,
  name,
  ...props
}: InputProps) {
  const inputId = id || name;
  const hasIcon = Boolean(icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="field"
    >
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      )}
      <div className={`field-input ${hasIcon ? 'with-icon' : ''}`}>
        {icon && <span className="field-icon">{icon}</span>}
        <input
          id={inputId}
          name={name}
          className={className}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${inputId}-error`}
          className="field-error"
          role="alert"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="field-hint">
          {hint}
        </p>
      )}
    </motion.div>
  );
}
