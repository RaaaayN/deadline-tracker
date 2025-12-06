import React from 'react';

type StatusPillProps = {
  status: string;
};

export function StatusPill({ status }: StatusPillProps) {
  return <span className={`pill ${status}`}>{status}</span>;
}

