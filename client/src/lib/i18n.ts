import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      app_name: "Sehatify",
      nav_home: "Home",
      nav_features: "Features",
      nav_doctors: "Doctors",
      nav_contact: "Contact",
      emergency_sos: "Emergency",
      login: "Login",
      register: "Register",
      dashboard: "Dashboard",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      
      // Hero Section
      hero_title: "Your Health, Our Priority",
      hero_subtitle: "Smart Monitoring, Smarter Care",
      hero_description: "Monitor your health 24/7 with our AI-powered wristband. Get instant alerts, personalized recommendations, and connect with top doctors seamlessly.",
      get_started: "Get Started",
      watch_demo: "Watch Demo",
      
      // Features
      features_title: "Comprehensive Health Monitoring",
      features_subtitle: "Advanced AI-powered health monitoring with real-time alerts and professional medical support",
      feature_monitoring_title: "Real-time Monitoring",
      feature_monitoring_desc: "Continuous tracking of vital signs including heart rate, blood pressure, SpO₂, ECG, and body temperature with instant alerts.",
      feature_ai_title: "AI-Powered Analysis",
      feature_ai_desc: "Advanced machine learning algorithms analyze your health patterns and predict potential issues before they become serious.",
      feature_doctor_title: "Expert Consultation",
      feature_doctor_desc: "Connect with certified doctors and specialists. Automated report sharing ensures your doctor is prepared for your visit.",
      feature_emergency_title: "Emergency SOS",
      feature_emergency_desc: "Instant emergency alerts to 108 ambulance services, family members, and nearby hospitals with precise location tracking.",
      feature_donation_title: "Community Care",
      feature_donation_desc: "Donate blood, plasma, and other components to save lives. Earn reward coins for healthcare discounts and help build a caring community.",
      feature_insurance_title: "Insurance & ABHA",
      feature_insurance_desc: "Seamless integration with ABHA, PM-JAY, and private insurance for cashless treatments and instant eligibility checks.",
      
      // Compliance
      compliance_title: "Trusted & Compliant",
      compliance_subtitle: "Your data security and privacy are our top priorities",
      compliance_medical_grade: "Medical Grade Sensors",
      compliance_medical_desc: "ISO & FDA approved sensors ensure accurate health monitoring beyond fitness-grade devices.",
      compliance_data_security: "Data Security",
      compliance_data_desc: "HIPAA, GDPR, and DISHA compliant with end-to-end encryption and NDHM standards.",
      compliance_offline_mode: "Offline Access",
      compliance_offline_desc: "Access vital health data even without internet. Automatic sync when connection resumes.",
      
      // CTA
      cta_title: "Start Your Health Journey Today",
      cta_subtitle: "Join thousands of users who trust Sehatify for their health monitoring needs",
      register_now: "Register Now",
      
      // Forms
      full_name: "Full Name",
      age: "Age",
      gender: "Gender",
      phone: "Phone Number",
      email: "Email",
      password: "Password",
      confirm_password: "Confirm Password",
      medical_history: "Medical History (Optional)",
      abha_id: "ABHA Health ID (Optional)",
      male: "Male",
      female: "Female",
      other: "Other",
      
      // Dashboard
      dashboard_welcome: "Welcome back!",
      dashboard_subtitle: "Here's your health overview for today",
      nav_overview: "Overview",
      nav_vitals: "Vitals",
      nav_reports: "Reports",
      nav_medicines: "Medicines",
      nav_donations: "Donations",
      nav_ai_doctor: "AI Doctor",
      
      // Health Status
      heart_rate: "Heart Rate",
      blood_pressure: "Blood Pressure",
      oxygen_saturation: "SpO₂",
      body_temperature: "Body Temperature",
      normal: "Normal",
      excellent: "Excellent",
      
      // AI Doctor
      ai_doctor_name: "Dr. AI Assistant",
      ai_doctor_status: "Online",
      ai_welcome: "Hello! I'm your AI health assistant. How can I help you today?",
      
      // Emergency
      emergency_title: "Emergency Alert",
      emergency_description: "This will immediately contact emergency services and your emergency contacts.",
      call_ambulance: "Call 108 Ambulance",
      notify_contacts: "Notify Emergency Contacts",
      share_location: "Share Current Location",
      cancel: "Cancel",
      
      // Common
      loading: "Loading...",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
      confirm: "Confirm",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      search: "Search"
    }
  },
  hi: {
    translation: {
      // Navigation
      app_name: "सेहतिफाई",
      nav_home: "होम",
      nav_features: "विशेषताएं",
      nav_doctors: "डॉक्टर",
      nav_contact: "संपर्क",
      emergency_sos: "आपातकाल",
      login: "लॉगिन",
      register: "रजिस्टर",
      dashboard: "डैशबोर्ड",
      profile: "प्रोफ़ाइल",
      settings: "सेटिंग्स",
      logout: "लॉगआउट",
      
      // Hero Section
      hero_title: "आपका स्वास्थ्य, हमारी प्राथमिकता",
      hero_subtitle: "स्मार्ट मॉनिटरिंग, बेहतर देखभाल",
      hero_description: "हमारे AI-powered रिस्टबैंड के साथ 24/7 अपने स्वास्थ्य की निगरानी करें। तुरंत अलर्ट, व्यक्तिगत सुझाव, और टॉप डॉक्टरों से जुड़ें।",
      get_started: "शुरू करें",
      watch_demo: "डेमो देखें",
      
      // Features
      features_title: "व्यापक स्वास्थ्य निगरानी",
      features_subtitle: "उन्नत AI-powered स्वास्थ्य निगरानी के साथ रीयल-टाइम अलर्ट और पेशेवर चिकित्सा सहायता",
      
      // CTA
      cta_title: "आज ही अपनी स्वास्थ्य यात्रा शुरू करें",
      cta_subtitle: "हजारों उपयोगकर्ताओं के साथ जुड़ें जो अपनी स्वास्थ्य निगरानी के लिए सेहतिफाई पर भरोसा करते हैं",
      register_now: "अभी रजिस्टर करें",
      
      // Forms
      full_name: "पूरा नाम",
      age: "उम्र",
      gender: "लिंग",
      phone: "फोन नंबर",
      email: "ईमेल",
      password: "पासवर्ड",
      confirm_password: "पासवर्ड की पुष्टि करें",
      medical_history: "मेडिकल हिस्ट्री (वैकल्पिक)",
      abha_id: "ABHA हेल्थ ID (वैकल्पिक)",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      
      // Common
      loading: "लोड हो रहा है...",
      save: "सेव करें",
      edit: "संपादित करें",
      delete: "हटाएं",
      confirm: "पुष्टि करें",
      close: "बंद करें",
      back: "वापस",
      next: "अगला",
      previous: "पिछला",
      search: "खोजें"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
