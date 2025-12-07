"use client";

import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import React, { type ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

/**
 * Empty state component with icon, message, and optional action.
 * @param title - Main message to display
 * @param description - Additional context or instructions
 * @param icon - Custom icon (defaults to Inbox)
 * @param action - CTA button or link
 * 
 * @example
 * <EmptyState
 *   title="No tasks yet"
 *   description="Create your first task to get started"
 *   action={<Button>Create Task</Button>}
 * />
 */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="empty-state"
    >
      <motion.div
        initial={{ y: 10 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        className="empty-state-icon"
      >
        {icon || <Inbox size={64} />}
      </motion.div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </motion.div>
  );
}
