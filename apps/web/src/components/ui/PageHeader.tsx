"use client";

import { motion } from 'framer-motion';
import React, { type ReactNode } from 'react';

type PageHeaderProps = {
  badge?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

/**
 * Page header component with animated entrance.
 * @param badge - Small label above the title
 * @param title - Main page title
 * @param description - Subtitle or description
 * @param actions - Action buttons on the right
 * 
 * @example
 * <PageHeader
 *   badge="Dashboard"
 *   title="Welcome back!"
 *   description="Here's what's happening with your applications"
 *   actions={<Button>New Task</Button>}
 * />
 */
export function PageHeader({ badge, title, description, actions }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="page-header"
    >
      <div className="page-header-content">
        <div>
          {badge && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="page-badge"
            >
              {badge}
            </motion.span>
          )}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="page-title"
          >
            {title}
          </motion.h1>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="page-description"
            >
              {description}
            </motion.p>
          )}
        </div>
        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}

