"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';
import React, { useState } from 'react';

type BannerTone = 'info' | 'success' | 'warning' | 'error';

type BannerProps = {
  message: string;
  tone?: BannerTone;
  dismissible?: boolean;
  ariaLive?: 'polite' | 'assertive';
};

const toneConfig: Record<BannerTone, { icon: React.ElementType }> = {
  info: { icon: Info },
  success: { icon: CheckCircle },
  warning: { icon: AlertTriangle },
  error: { icon: XCircle },
};

/**
 * Animated notification banner with dismiss functionality.
 * @param message - The message to display
 * @param tone - Visual style: info, success, warning, or error
 * @param dismissible - Whether the banner can be dismissed
 * @param ariaLive - Accessibility announcement behavior
 * 
 * @example
 * <Banner 
 *   message="Settings saved successfully!"
 *   tone="success"
 *   dismissible
 * />
 */
export function Banner({
  message,
  tone = 'info',
  dismissible = false,
  ariaLive = 'polite',
}: BannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toneConfig[tone];
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`banner ${tone}`}
        role="alert"
        aria-live={ariaLive}
      >
        <Icon className="banner-icon" />
        <span style={{ flex: 1 }}>{message}</span>
        {dismissible && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVisible(false)}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Fermer"
            type="button"
          >
            <X size={16} />
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
