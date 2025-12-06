import React, { type ReactNode, type SelectHTMLAttributes } from 'react';

type Option = { value: string; label: string };

type SelectProps = {
  label?: string;
  hint?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
  icon?: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  icon,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || props.name;
  return (
    <div className="field">
      {label ? (
        <label htmlFor={selectId} className="field-label">
          {label}
        </label>
      ) : null}
      <div className={`field-input ${icon ? 'with-icon' : ''}`}>
        {icon ? <span className="field-icon">{icon}</span> : null}
        <select id={selectId} className={className} {...props}>
          {placeholder ? (
            <option value="" disabled={props.required} hidden={props.required}>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {hint ? <p className="field-hint">{hint}</p> : null}
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

