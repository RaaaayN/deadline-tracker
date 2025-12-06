"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { useAuth } from '../app/providers/AuthProvider';

import { Button } from './ui/Button';

const links = [
  { href: '/dashboard', label: 'Tableau de bord', authOnly: true },
  { href: '/candidatures', label: 'Candidatures', authOnly: true },
  { href: '/deadlines', label: 'Échéances', authOnly: true },
  { href: '/settings', label: 'Paramètres', authOnly: true },
];

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="nav">
      <div className="nav-brand">
        <Link href="/">
          <span className="brand-mark">DossierTracker</span>
        </Link>
      </div>
      <nav className="nav-links" aria-label="Navigation principale">
        {links
          .filter((link) => !link.authOnly || user)
          .map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={active ? 'nav-link active' : 'nav-link'}>
                {link.label}
              </Link>
            );
          })}
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <div className="nav-user">
              <span className="muted">Connecté</span>
              <span className="nav-identity">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <Button variant="ghost" type="button" onClick={logout}>
              Déconnexion
            </Button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="nav-link">
              Connexion
            </Link>
            <Link href="/auth/signup" className="nav-link strong">
              Créer un compte
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

