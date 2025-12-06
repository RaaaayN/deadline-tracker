import React from 'react';

type BannerTone = 'info' | 'success' | 'error';

type BannerProps = {
  message: string;
  tone?: BannerTone;
  ariaLive?: 'polite' | 'assertive';
};

export function Banner({ message, tone = 'info', ariaLive = 'polite' }: BannerProps) {
  if (!message) {
    return null;
  }
  return (
    <div className={`banner ${tone}`} role="status" aria-live={ariaLive}>
      {message}
    </div>
  );
}

