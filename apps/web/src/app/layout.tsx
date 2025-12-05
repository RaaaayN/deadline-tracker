import type { Metadata } from 'next';
import React from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'DossierTracker',
  description: 'Centralise les deadlines AST et vos checklists',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="app-body">{children}</body>
    </html>
  );
}

