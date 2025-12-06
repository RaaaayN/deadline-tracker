import React, { type ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="muted">{title}</p>
      {description ? <p className="subtle">{description}</p> : null}
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

