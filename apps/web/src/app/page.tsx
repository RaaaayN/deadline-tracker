"use client";

import { motion } from 'framer-motion';
import {
  Calendar,
  Bell,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '../components/ui/Button';

import { useAuth } from './providers/AuthProvider';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: Calendar,
    title: 'Toutes tes échéances',
    description: 'Centralise les deadlines de tous tes concours AST et écoles en un seul endroit.',
    color: 'var(--primary)',
    bg: 'var(--primary-soft)',
  },
  {
    icon: Bell,
    title: 'Rappels intelligents',
    description: 'Reçois des notifications J-30, J-7 et J-1 pour ne jamais manquer une date limite.',
    color: 'var(--warning)',
    bg: 'var(--warning-soft)',
  },
  {
    icon: CheckCircle2,
    title: 'Checklist interactive',
    description: 'Suis ta progression avec des tâches Todo → Doing → Done pour chaque dossier.',
    color: 'var(--success)',
    bg: 'var(--success-soft)',
  },
];

const stats = [
  { value: '15+', label: 'Écoles partenaires' },
  { value: '500+', label: 'Étudiants actifs' },
  { value: '99%', label: 'Satisfaction' },
];

const benefits = [
  {
    icon: Zap,
    title: 'Synchronisation automatique',
    description: 'Les deadlines officielles sont importées et mises à jour automatiquement.',
  },
  {
    icon: Shield,
    title: 'Sécurisé & privé',
    description: 'Tes données sont protégées et jamais partagées avec des tiers.',
  },
  {
    icon: Users,
    title: 'Connecté à Google',
    description: 'Synchronise avec Google Calendar et reçois des emails de rappel.',
  },
  {
    icon: Clock,
    title: 'Gain de temps',
    description: 'Plus besoin de jongler entre les sites des écoles pour trouver les dates.',
  },
  {
    icon: Target,
    title: 'Vue d\'ensemble',
    description: 'Dashboard complet pour visualiser ta progression sur tous tes dossiers.',
  },
  {
    icon: Sparkles,
    title: 'Suggestions smart',
    description: 'Reçois des conseils personnalisés pour compléter tes candidatures.',
  },
];

/**
 * Landing page with hero section, features, and call-to-action.
 * Displays different content based on authentication status.
 */
export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="app-main full-width">
      <div className="app-content">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero"
          style={{ marginBottom: 'var(--space-12)' }}
        >
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="page-badge"
              style={{ marginBottom: 'var(--space-4)' }}
            >
              <Sparkles size={14} />
              <span>La référence pour les admissions AST</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hero-title"
            >
              Pilote tes dossiers sans rater une date
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="hero-description"
            >
              Centralise toutes tes échéances, coche les tâches accomplies, 
              connecte Google Calendar et reçois des rappels automatiques J-30/J-7/J-1.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="hero-actions"
            >
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" iconRight={<ArrowRight size={18} />}>
                      Ouvrir le tableau de bord
                    </Button>
                  </Link>
                  <Link href="/deadlines">
                    <Button variant="secondary" size="lg">
                      Voir mes échéances
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button size="lg" iconRight={<ArrowRight size={18} />}>
                      Créer un compte gratuit
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="secondary" size="lg">
                      Se connecter
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-3"
          style={{ marginBottom: 'var(--space-12)' }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={item}
              className="stat-card"
              style={{ textAlign: 'center' }}
            >
              <motion.div
                className="stat-card-value"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
              >
                {stat.value}
              </motion.div>
              <p className="stat-card-label">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Features Section */}
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          style={{ marginBottom: 'var(--space-12)' }}
        >
          <motion.div variants={item} style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <span className="page-badge">Fonctionnalités</span>
            <h2 style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              Tout ce dont tu as besoin
            </h2>
            <p className="text-secondary" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Des outils puissants pour gérer tes candidatures sereinement.
            </p>
          </motion.div>
          
          <div className="grid grid-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={item}
                  whileHover={{ y: -4 }}
                  className="card card-interactive"
                >
                  <div
                    className="stat-card-icon"
                    style={{
                      background: feature.bg,
                      color: feature.color,
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-lg)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-secondary text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Benefits Grid */}
        <motion.section
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ marginBottom: 'var(--space-12)' }}
        >
          <motion.div variants={item} style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <span className="page-badge">Pourquoi DossierTracker ?</span>
            <h2 style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              Conçu pour ta réussite
            </h2>
          </motion.div>
          
          <div className="grid grid-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  variants={item}
                  className="flex gap-3"
                  style={{ alignItems: 'flex-start' }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 style={{ marginBottom: 'var(--space-1)', fontSize: 'var(--text-base)' }}>
                      {benefit.title}
                    </h4>
                    <p className="text-muted text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card"
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) var(--space-6)',
            background: 'linear-gradient(135deg, var(--primary-soft), var(--surface))',
            marginBottom: 'var(--space-8)',
          }}
        >
          <h2 style={{ marginBottom: 'var(--space-3)' }}>
            Prêt à organiser tes candidatures ?
          </h2>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-6)', maxWidth: '400px', margin: '0 auto var(--space-6)' }}>
            Rejoins des centaines d&apos;étudiants qui utilisent DossierTracker pour leurs admissions.
          </p>
          <div className="flex justify-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" iconRight={<ArrowRight size={18} />}>
                  Accéder au tableau de bord
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" iconRight={<ArrowRight size={18} />}>
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link href="/diplomas">
                  <Button variant="ghost" size="lg">
                    Explorer les diplômes
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            textAlign: 'center',
            padding: 'var(--space-6)',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <p>© 2025 DossierTracker. Fait avec ❤️ pour les étudiants AST.</p>
        </motion.footer>
      </div>
    </div>
  );
}
