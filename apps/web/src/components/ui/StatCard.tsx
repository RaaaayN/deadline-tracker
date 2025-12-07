"use client";

import { motion, useSpring, useTransform } from 'framer-motion';
import React, { type ReactNode, useEffect, useState } from 'react';

type StatCardVariant = 'primary' | 'success' | 'warning' | 'accent';

type StatCardProps = {
  label: string;
  value: number | string;
  trend?: string;
  icon?: ReactNode;
  variant?: StatCardVariant;
};

/**
 * Animated stat card with counting animation for numeric values.
 * @param label - Description of the stat
 * @param value - The stat value (number will animate, string displays directly)
 * @param trend - Additional context below the value
 * @param icon - Icon displayed in the card header
 * @param variant - Color theme: primary, success, warning, or accent
 * 
 * @example
 * <StatCard 
 *   label="Total Tasks" 
 *   value={42}
 *   trend="+5 this week"
 *   icon={<CheckCircle size={20} />}
 *   variant="success"
 * />
 */
export function StatCard({ label, value, trend, icon, variant = 'primary' }: StatCardProps) {
  const isNumeric = typeof value === 'number';
  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : value);

  // Animated counter for numeric values
  const springValue = useSpring(0, { stiffness: 100, damping: 20 });
  const roundedValue = useTransform(springValue, (val) => Math.round(val));

  useEffect(() => {
    if (isNumeric) {
      springValue.set(value);
      const unsubscribe = roundedValue.on('change', (v) => setDisplayValue(v));
      return () => unsubscribe();
    }
  }, [value, isNumeric, springValue, roundedValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="stat-card"
    >
      <div className="stat-card-header">
        {icon && <div className={`stat-card-icon ${variant}`}>{icon}</div>}
        <span className="stat-card-label">{label}</span>
      </div>
      <motion.div
        className="stat-card-value"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {displayValue}
      </motion.div>
      {trend && <p className="stat-card-trend">{trend}</p>}
    </motion.div>
  );
}
