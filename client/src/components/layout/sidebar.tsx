import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  UserCheck, 
  Pill, 
  Heart, 
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: t('nav_overview'),
      key: 'overview'
    },
    {
      href: '/dashboard/vitals',
      icon: Activity,
      label: t('nav_vitals'),
      key: 'vitals'
    },
    {
      href: '/dashboard/reports',
      icon: FileText,
      label: t('nav_reports'),
      key: 'reports'
    },
    {
      href: '/doctors',
      icon: UserCheck,
      label: t('nav_doctors'),
      key: 'doctors'
    },
    {
      href: '/dashboard/medicines',
      icon: Pill,
      label: t('nav_medicines'),
      key: 'medicines'
    },
    {
      href: '/donations',
      icon: Heart,
      label: t('nav_donations'),
      key: 'donations'
    },
    {
      href: '/dashboard/ai-doctor',
      icon: Bot,
      label: t('nav_ai_doctor'),
      key: 'ai-doctor'
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      label: t('settings'),
      key: 'settings'
    }
  ];

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold">{t('dashboard')}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
            data-testid="button-sidebar-toggle"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.href || location.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link key={item.key} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isCollapsed && "px-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  data-testid={`nav-item-${item.key}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
