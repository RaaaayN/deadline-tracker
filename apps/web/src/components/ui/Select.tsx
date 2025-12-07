"use client";

import { motion } from 'framer-motion';
import React, { type SelectHTMLAttributes, type ReactNode } from 'react';

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  options: SelectOption[];
} & SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Select dropdown component with consistent styling.
 * @param label - Label displayed above the select
 * @param hint - Helper text below the select
 * @param error - Error message (replaces hint when present)
 * @param icon - Icon displayed inside the select on the left
 * @param options - Array of options with value and label
 * 
 * @example
 * <Select
 *   label="Status"
 *   options={[
 *     { value: 'todo', label: 'To Do' },
 *     { value: 'done', label: 'Done' },
 *   ]}
 * />
 */
export function Select({
  label,
  hint,
  error,
  icon,
  options,
  className = '',
  id,
  name,
  ...props
}: SelectProps) {
  const selectId = id || name;
  const hasIcon = Boolean(icon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="field"
    >
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
        </label>
      )}
      <div className={`field-input ${hasIcon ? 'with-icon' : ''}`}>
        {icon && <span className="field-icon">{icon}</span>}
        <select
          id={selectId}
          name={name}
          className={className}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          id={`${selectId}-error`}
          className="field-error"
          role="alert"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p id={`${selectId}-hint`} className="field-hint">
          {hint}
        </p>
      )}
    </motion.div>
  );
}
