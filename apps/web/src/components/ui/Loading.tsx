import React from 'react';

type LoadingProps = {
  label?: string;
};

export function Loading({ label = 'Chargement...' }: LoadingProps) {
  return (
    <div className="loading">
      <span className="spinner" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

