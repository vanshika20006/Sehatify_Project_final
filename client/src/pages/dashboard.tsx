import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/layout/sidebar';
import { HealthCards } from '@/components/dashboard/health-cards';
import { VitalCharts } from '@/components/dashboard/vital-charts';
import { AIChatbot } from '@/components/dashboard/ai-chatbot';
import { EmergencySOS } from '@/components/dashboard/emergency-sos';
import { WristbandStatus } from '@/components/dashboard/wristband-status';
import { HealthNotifications } from '@/components/dashboard/health-notifications';
import { HealthOverview } from '@/components/dashboard/health-overview';
import { useAuth } from '@/hooks/use-auth';
import { useHealthData } from '@/hooks/use-health-data';

export function Dashboard() {
  const { t } = useTranslation();
  const { user, userProfile } = useAuth();
  const { currentVitals, analysis } = useHealthData();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  const displayName = userProfile?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-dashboard-welcome">
            Welcome back, {displayName}!
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            {t('dashboard_subtitle')}
          </p>
          
          {/* Health Alert Banner */}
          {analysis && analysis.riskLevel !== 'low' && (
            <div className={`mt-4 p-4 rounded-lg border ${
              analysis.riskLevel === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
              analysis.riskLevel === 'high' ? 'bg-orange-50 border-orange-200 text-orange-800' :
              'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`} data-testid="banner-health-alert">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Health Alert</h3>
                  <p className="text-sm">{analysis.analysis}</p>
                </div>
                <button 
                  onClick={() => setIsEmergencyOpen(true)}
                  className="text-sm underline hover:no-underline"
                  data-testid="button-emergency-from-alert"
                >
                  Get Help
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Health Overview - New comprehensive section */}
        <div className="mb-8">
          <HealthOverview />
        </div>

        {/* Wristband Status */}
        <div className="mb-8">
          <WristbandStatus />
        </div>

        {/* Health Status Cards */}
        <div className="mb-8">
          <HealthCards />
        </div>

        {/* Health Notifications and Doctor Reports */}
        <div className="mb-8">
          <HealthNotifications />
        </div>

        {/* Charts and Additional Content */}
        <VitalCharts />
      </div>

      {/* AI Chatbot */}
      <AIChatbot 
        isOpen={isChatbotOpen} 
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)} 
      />

      {/* Emergency SOS Modal */}
      <EmergencySOS 
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
