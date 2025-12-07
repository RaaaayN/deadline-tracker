"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { useAuth } from '../app/providers/AuthProvider';

import { Loading } from './ui/Loading';

type ProtectedProps = {
  children: ReactNode;
};

export function Protected({ children }: ProtectedProps) {
  const { token, isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!token) {
      const redirect = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/auth/login${redirect}` as '/auth/login');
      return;
    }
    setChecked(true);
  }, [isAuthLoading, pathname, router, token]);

  if (isAuthLoading || !checked) {
    return (
      <div className="app-content">
        <Loading label="Vérification de la session..." />
      </div>
    );
  }

  return <>{children}</>;
}

