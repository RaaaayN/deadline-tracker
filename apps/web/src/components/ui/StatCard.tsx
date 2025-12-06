import React from 'react';

type StatCardProps = {
  label: string;
  value: string | number;
  trend?: string;
};

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="muted">{label}</p>
      <div className="stat-value">{value}</div>
      {trend ? <p className="stat-trend">{trend}</p> : null}
    </div>
  );
}

