import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'DossierTracker',
  description: 'Centralise les deadlines AST et vos checklists',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'Inter, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

