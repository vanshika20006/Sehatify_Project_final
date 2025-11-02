import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from 'react-i18next';
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/auth-context";
import { HealthProvider } from "@/context/health-context";
import { AdminProvider } from "@/context/admin-context";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import { AdminDashboard } from "@/pages/admin-dashboard";
import { AdminPatientDetail } from "@/pages/admin-patient-detail";
import { LandingPage } from "@/pages/landing";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Dashboard } from "@/pages/dashboard";
import { ProfilePage } from "@/pages/profile";
import { DoctorsPage } from "@/pages/doctors";
import { DonationsPage } from "@/pages/donations";
import { VitalsPage } from "@/pages/vitals";
import { ReportsPage } from "@/pages/reports";
import { LabTestsPage } from "@/pages/lab-tests";
import { MedicinesPage } from "@/pages/medicines";
import { AIDoctorPage } from "@/pages/ai-doctor";
import { SettingsPage } from "@/pages/settings";
import MentalHealthPage from "@/pages/mental-health";
import NotFound from "@/pages/not-found";
import { PartnershipPage } from "@/pages/partnership";
import { FAQsPage } from "@/pages/faqs";
import { OverviewPage } from "@/pages/overview";
import { HospitalizationPage } from "@/pages/hospitalization";
import { LocateHospitalPage } from "@/pages/locate-hospital";
import { BeliefsPage } from "@/pages/beliefs";
import { BlogPage } from "@/pages/blog";
import { TermsPage } from "@/pages/terms";
import { PrivacyPage } from "@/pages/privacy";
import { GrievancePage } from "@/pages/grievance";
import { DiseaseMapPage } from "@/pages/disease-map";
import { InsuranceHubPage } from "@/pages/insurance-hub";
import i18n from "@/lib/i18n";

function Router() {
  return (
    <Switch>
      {/* Admin Routes - No navigation/footer */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <AdminRouteGuard>
          <AdminDashboard />
        </AdminRouteGuard>
      </Route>
      <Route path="/admin/patient/:id">
        <AdminRouteGuard>
          <AdminPatientDetail />
        </AdminRouteGuard>
      </Route>
      
      {/* Regular App Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginForm} />
      <Route path="/register" component={RegisterForm} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/vitals" component={VitalsPage} />
      <Route path="/dashboard/reports" component={ReportsPage} />
      <Route path="/lab-tests" component={LabTestsPage} />
      <Route path="/dashboard/medicines" component={MedicinesPage} />
      <Route path="/dashboard/ai-doctor" component={AIDoctorPage} />
      <Route path="/dashboard/settings" component={SettingsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/doctors" component={DoctorsPage} />
      <Route path="/vitals" component={VitalsPage} />
      <Route path="/medicines" component={MedicinesPage} />
      <Route path="/ai-doctor" component={AIDoctorPage} />
      <Route path="/donations" component={DonationsPage} />
      <Route path="/mental-health" component={MentalHealthPage} />
      <Route path="/partnership" component={PartnershipPage} />
      <Route path="/faqs" component={FAQsPage} />
      <Route path="/overview" component={OverviewPage} />
      <Route path="/hospitalization" component={HospitalizationPage} />
      <Route path="/locate-hospital" component={LocateHospitalPage} />
      <Route path="/beliefs" component={BeliefsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/grievance" component={GrievancePage} />
      <Route path="/disease-map" component={DiseaseMapPage} />
      <Route path="/insurance-hub" component={InsuranceHubPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return <Router />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <AuthProvider>
            <HealthProvider>
              <AdminProvider>
                <AppContent />
                <Toaster />
              </AdminProvider>
            </HealthProvider>
          </AuthProvider>
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
