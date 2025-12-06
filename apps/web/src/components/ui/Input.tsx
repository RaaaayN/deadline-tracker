import React, { type InputHTMLAttributes, type ReactNode } from 'react';

type InputProps = {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, hint, error, icon, id, className = '', ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="field">
      {label ? (
        <label htmlFor={inputId} className="field-label">
          {label}
        </label>
      ) : null}
      <div className={`field-input ${icon ? 'with-icon' : ''}`}>
        {icon ? <span className="field-icon">{icon}</span> : null}
        <input id={inputId} className={className} {...props} />
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

