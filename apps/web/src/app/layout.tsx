import type { Metadata } from 'next';
import React from 'react';

import { Sidebar } from '../components/Sidebar';

import { AuthProvider } from './providers/AuthProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'DossierTracker',
  description: 'Centralise les deadlines AST et vos checklists',
};

/**
 * Root layout with sidebar navigation.
 * The sidebar is hidden on landing page for non-authenticated users.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <div className="app-layout">
            <Sidebar />
            <main className="app-main">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
