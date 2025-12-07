"use client";

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import React from 'react';

type LoadingProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

/**
 * Loading spinner component with optional label.
 * @param label - Text to display next to the spinner
 * @param size - Spinner size: sm, md, or lg
 * 
 * @example
 * <Loading label="Fetching data..." size="lg" />
 */
export function Loading({ label, size = 'md' }: LoadingProps) {
  return (
    <div className="loading">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={sizeMap[size]} />
      </motion.div>
      {label && <span>{label}</span>}
    </div>
  );
}

/**
 * Skeleton loading placeholder for content.
 * @example
 * <Skeleton className="h-4 w-32" />
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      className={`skeleton ${className}`}
      style={{ height: '1rem', minWidth: '4rem' }}
    />
  );
}
