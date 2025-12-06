import type { Metadata } from 'next';
import React from 'react';

import { Navigation } from '../components/Navigation';

import { AuthProvider } from './providers/AuthProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'DossierTracker',
  description: 'Centralise les deadlines AST et vos checklists',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="app-body">
        <AuthProvider>
          <Navigation />
          <div className="page-shell">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}

