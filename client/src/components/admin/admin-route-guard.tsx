import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAdmin } from '@/context/admin-context';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { adminUser, loginStep } = useAdmin();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!adminUser || loginStep !== 'complete') {
      setLocation('/admin/login');
    }
  }, [adminUser, loginStep, setLocation]);

  if (!adminUser || loginStep !== 'complete') {
    return null;
  }

  return <>{children}</>;
}