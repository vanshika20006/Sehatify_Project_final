import { useTranslation } from 'react-i18next';
import { Shield, Lock, Eye, Database, Users, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function PrivacyPage() {
  const { t } = useTranslation();

  const principles = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All your health data is encrypted using industry-standard AES-256 encryption both in transit and at rest.'
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'We clearly explain what data we collect, why we collect it, and how we use it to provide you better healthcare services.'
    },
    {
      icon: Users,
      title: 'User Control',
      description: 'You have complete control over your data with options to view, edit, export, or delete your information anytime.'
    },
    {
      icon: Database,
      title: 'Data Minimization',
      description: 'We only collect data that is necessary to provide our services and improve your healthcare experience.'
    }
  ];

  const sections = [
    {
      title: "Information We Collect",
      content: [
        "Personal Information: Name, age, gender, contact details, and identity verification documents.",
        "Health Data: Vital signs from your wristband, medical history, symptoms, lab results, and consultation records.",
        "Device Information: Wristband readings, device ID, battery status, and usage patterns.",
        "Usage Data: App interactions, feature usage, and performance analytics to improve our services.",
        "Location Data: GPS coordinates for emergency services and nearby hospital recommendations (with your consent)."
      ]
    },
    {
      title: "How We Use Your Information", 
      content: [
        "Provide personalized healthcare services and AI-powered health insights.",
        "Connect you with qualified healthcare providers for consultations and treatments.",
        "Monitor your health vitals and provide real-time alerts for abnormal readings.",
        "Process emergency SOS requests and coordinate with emergency services.",
        "Improve our AI algorithms and service quality through anonymized data analysis.",
        "Send important health notifications, appointment reminders, and service updates.",
        "Comply with legal requirements and support law enforcement when legally required."
      ]
    },
    {
      title: "Data Sharing and Disclosure",
      content: [
        "Healthcare Providers: We share relevant health information with doctors you consult through our platform.",
        "Emergency Services: In emergencies, we share your location and medical information with emergency responders.",
        "Service Partners: Trusted partners like labs, pharmacies, and hospitals receive minimal necessary information.",
        "Legal Requirements: We may disclose information when required by law, court orders, or government regulations.",
        "Business Transfers: In case of merger or acquisition, your data may be transferred to the new entity.",
        "We never sell your personal or health data to third parties for marketing or commercial purposes."
      ]
    },
    {
      title: "Data Security Measures",
      content: [
        "End-to-end encryption for all data transmission between devices and servers.",
        "Advanced access controls and authentication systems to prevent unauthorized access.",
        "Regular security audits and penetration testing by independent cybersecurity firms.",
        "HIPAA-compliant data handling processes and staff training on privacy protection.",
        "Secure cloud infrastructure with redundant backups and disaster recovery systems.",
        "Multi-factor authentication requirements for accessing sensitive health data."
      ]
    },
    {
      title: "Your Privacy Rights",
      content: [
        "Access: View all personal and health data we have collected about you.",
        "Rectification: Correct any inaccurate or incomplete information in your profile.",
        "Erasure: Request deletion of your data, subject to legal and medical record requirements.",
        "Portability: Export your health data in a standard format to share with other providers.",
        "Restriction: Limit how we process your data for specific purposes.",
        "Objection: Opt out of certain data processing activities like marketing communications."
      ]
    },
    {
      title: "Cookies and Tracking",
      content: [
        "Essential Cookies: Required for basic platform functionality and security.",
        "Analytics Cookies: Help us understand how users interact with our platform to improve services.",
        "Preference Cookies: Remember your settings and preferences for a personalized experience.",
        "Marketing Cookies: Used to deliver relevant health information and service recommendations.",
        "You can control cookie preferences through your browser settings or our cookie management tool."
      ]
    },
    {
      title: "International Data Transfers",
      content: [
        "Your data is primarily stored and processed within India to comply with local data protection laws.",
        "Some services may involve data processing by trusted international partners with adequate protection measures.",
        "All international transfers are secured through appropriate safeguards like standard contractual clauses.",
        "We ensure that international partners maintain equivalent privacy protection standards."
      ]
    },
    {
      title: "Data Retention",
      content: [
        "Active health monitoring data is retained as long as you use our services.",
        "Medical consultation records are kept for 7 years as per medical record retention requirements.",
        "Emergency SOS data is retained for 2 years for safety and legal compliance purposes.",
        "Marketing and analytics data is anonymized after 2 years and may be retained for research.",
        "You can request earlier deletion of non-essential data through your account settings."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <Shield className="w-4 h-4 mr-2" />
            Data Protection
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Privacy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Policy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your privacy and data security are fundamental to our mission of providing trusted healthcare services.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
            <p className="text-green-800 font-medium">
              🔒 Last updated: September 18, 2025 • Effective immediately • HIPAA Compliant
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Our Privacy <span className="text-purple-600">Principles</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core principles guide how we handle your sensitive health information
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <Card key={index} className="p-8 text-center bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl border-0">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-4 text-lg">{principle.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{principle.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy Policy Sections */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-purple-600 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                      {index + 1}
                    </div>
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Rights Summary */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            Your Data <span className="text-purple-600">Rights</span>
          </h2>
          <Card className="p-8 bg-white rounded-2xl shadow-xl border-0">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">View & Access</h3>
                  <p className="text-gray-600 text-sm">See all data we have collected about you</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Export & Port</h3>
                  <p className="text-gray-600 text-sm">Download your data in standard formats</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Delete & Control</h3>
                  <p className="text-gray-600 text-sm">Request deletion or limit data processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Privacy Questions or Concerns?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Our Data Protection Officer is available to address any privacy-related questions or requests
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="text-center">
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-90" />
              <h3 className="font-bold mb-2">Privacy Requests</h3>
              <p className="text-sm opacity-90">privacy@sehatify.com</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-3 opacity-90" />
              <h3 className="font-bold mb-2">Security Issues</h3>
              <p className="text-sm opacity-90">security@sehatify.com</p>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-90" />
              <h3 className="font-bold mb-2">General Support</h3>
              <p className="text-sm opacity-90">support@sehatify.com</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="mailto:privacy@sehatify.com" className="inline-block">
              <button className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Contact Privacy Team
              </button>
            </a>
            <a href="/settings" className="inline-block">
              <button className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-10 py-4 text-lg rounded-xl font-semibold transition-all duration-300">
                Manage Privacy Settings
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}