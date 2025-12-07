"use client";

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  Trophy,
  Medal,
  FolderKanban,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import { useAuth } from '../app/providers/AuthProvider';

type NavLink = {
  href:
    | '/dashboard'
    | '/candidatures'
    | '/deadlines'
    | '/diplomas'
    | '/contests'
    | '/leaderboards'
    | '/settings';
  label: string;
  icon: React.ElementType;
  authOnly: boolean;
};

const mainLinks: NavLink[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, authOnly: true },
  { href: '/candidatures', label: 'Candidatures', icon: FolderKanban, authOnly: true },
  { href: '/deadlines', label: 'Échéances', icon: Calendar, authOnly: true },
];

const exploreLinks: NavLink[] = [
  { href: '/diplomas', label: 'Diplômes', icon: GraduationCap, authOnly: false },
  { href: '/contests', label: 'Concours', icon: Medal, authOnly: false },
  { href: '/leaderboards', label: 'Classements', icon: Trophy, authOnly: false },
];

const settingsLinks: NavLink[] = [
  { href: '/settings', label: 'Paramètres', icon: Settings, authOnly: true },
];

/**
 * Sidebar navigation component with animated links and user profile.
 * Collapses to a bottom sheet on mobile.
 */
export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isLandingPage = pathname === '/';

  // Don't show sidebar on landing page
  if (isLandingPage && !user) {
    return null;
  }

  const renderLinks = (links: NavLink[], sectionTitle?: string) => {
    const filteredLinks = links.filter((link) => !link.authOnly || user);
    
    if (filteredLinks.length === 0) return null;

    return (
      <div className="sidebar-section">
        {sectionTitle && (
          <div className="sidebar-section-title">{sectionTitle}</div>
        )}
        {filteredLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="sidebar-link-icon"
              >
                <Icon size={20} />
              </motion.div>
              <span>{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="active-indicator"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    background: 'var(--primary)',
                    borderRadius: '0 2px 2px 0',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <Link href="/" className="sidebar-brand">
          <div className="sidebar-logo">D</div>
          <span className="sidebar-title">DossierTracker</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {user && renderLinks(mainLinks, 'Principal')}
        {renderLinks(exploreLinks, 'Explorer')}
        {user && renderLinks(settingsLinks, 'Compte')}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.firstName?.charAt(0).toUpperCase()}
              {user.lastName?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="btn btn-ghost btn-icon"
              aria-label="Se déconnecter"
              type="button"
            >
              <LogOut size={18} />
            </motion.button>
          </div>
        </div>
      )}

      {!user && (
        <div className="sidebar-footer">
          <div className="stack-sm" style={{ padding: 'var(--space-3)' }}>
            <Link href="/auth/login" className="btn btn-secondary" style={{ width: '100%' }}>
              Connexion
            </Link>
            <Link href="/auth/signup" className="btn btn-primary" style={{ width: '100%' }}>
              Créer un compte
            </Link>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="app-sidebar"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mobile-nav-toggle btn btn-icon"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        type="button"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay visible"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="app-sidebar open"
            style={{ position: 'fixed', zIndex: 100 }}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

