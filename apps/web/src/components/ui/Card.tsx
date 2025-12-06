import React, { type ReactNode } from 'react';

type CardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  padding?: 'md' | 'lg';
};

export function Card({ title, description, actions, children, padding = 'md' }: CardProps) {
  return (
    <section className={`card stack ${padding === 'lg' ? 'card-lg' : ''}`.trim()}>
      {title ? (
        <header className="card-header">
          <div className="stack">
            <h2 className="section-title">{title}</h2>
            {description ? <p className="muted">{description}</p> : null}
          </div>
          {actions ? <div className="card-actions">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

