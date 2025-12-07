"use client";

import { motion } from 'framer-motion';
import { Circle, Clock, CheckCircle2 } from 'lucide-react';
import React from 'react';

type Status = 'todo' | 'doing' | 'done';

type StatusPillProps = {
  status: Status;
  showLabel?: boolean;
};

const statusConfig: Record<Status, { icon: React.ElementType; label: string }> = {
  todo: { icon: Circle, label: 'À faire' },
  doing: { icon: Clock, label: 'En cours' },
  done: { icon: CheckCircle2, label: 'Terminé' },
};

/**
 * Status indicator pill with icon and optional label.
 * @param status - Current status: todo, doing, or done
 * @param showLabel - Whether to display the text label
 * 
 * @example
 * <StatusPill status="doing" showLabel />
 */
export function StatusPill({ status, showLabel = true }: StatusPillProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`pill ${status}`}
    >
      <Icon className="pill-icon" />
      {showLabel && <span>{config.label}</span>}
    </motion.span>
  );
}
