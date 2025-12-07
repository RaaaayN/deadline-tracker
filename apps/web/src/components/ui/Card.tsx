"use client";

import { motion } from 'framer-motion';
import React, { type ReactNode } from 'react';

type CardProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  variant?: 'default' | 'nested' | 'interactive';
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Card component with optional header, icon, and hover effects.
 * @param title - Card title displayed in header
 * @param description - Subtitle/description below the title
 * @param icon - Optional icon displayed next to the title
 * @param actions - Action buttons for the card header
 * @param variant - Visual style: default, nested, or interactive
 * 
 * @example
 * <Card 
 *   title="Settings" 
 *   description="Manage your preferences"
 *   icon={<Settings size={20} />}
 * >
 *   <p>Card content here</p>
 * </Card>
 */
export function Card({
  title,
  description,
  icon,
  actions,
  children,
  variant = 'default',
  className = '',
  style,
}: CardProps) {
  const variantClasses = {
    default: 'card',
    nested: 'card card-nested',
    interactive: 'card card-interactive',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${variantClasses[variant]} ${className}`.trim()}
      style={style}
    >
      {title && (
        <header className="card-header">
          <div className="card-header-content">
            <h2 className="card-title">
              {icon && <span className="card-title-icon">{icon}</span>}
              {title}
            </h2>
            {description && <p className="card-description">{description}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </motion.section>
  );
}
