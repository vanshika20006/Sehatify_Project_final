import { useTranslation } from 'react-i18next';
import { FileText, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TermsPage() {
  const { t } = useTranslation();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using the Sehatify platform, including our website, mobile application, and wristband device, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services."
    },
    {
      title: "2. Services Description", 
      content: "Sehatify provides digital healthcare services including but not limited to: online medical consultations, health monitoring through wearable devices, medicine delivery, lab test bookings, emergency SOS services, and AI-powered health analysis. Our services are designed to supplement, not replace, the relationship between you and your healthcare providers."
    },
    {
      title: "3. User Accounts and Registration",
      content: "To access certain features of our platform, you must create an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account."
    },
    {
      title: "4. Medical Disclaimers",
      content: "The information and services provided by Sehatify are for informational purposes only and should not be considered as medical advice, diagnosis, or treatment recommendations. Always consult with qualified healthcare professionals for medical decisions. Our AI analysis and health monitoring features are supplementary tools and should not replace professional medical judgment."
    },
    {
      title: "5. Privacy and Data Protection",
      content: "We are committed to protecting your privacy and health data. Our collection, use, and sharing of your personal and health information is governed by our Privacy Policy. We comply with applicable healthcare privacy laws including HIPAA standards. You retain ownership of your health data, and we will not share it with third parties without your explicit consent, except as required by law."
    },
    {
      title: "6. Wristband and Device Usage",
      content: "The Sehatify wristband is designed for health monitoring purposes and uses medical-grade sensors. While our devices meet industry standards for accuracy, readings may be affected by various factors including device placement, skin condition, and movement. The device is not intended to diagnose, treat, cure, or prevent any disease."
    },
    {
      title: "7. Emergency Services",
      content: "Our emergency SOS feature is designed to assist in medical emergencies by alerting designated contacts and emergency services. However, we cannot guarantee the availability, response time, or effectiveness of emergency services. In case of a medical emergency, you should also call local emergency numbers (108, 102) directly."
    },
    {
      title: "8. Telehealth and Consultation Services",
      content: "Our platform connects you with licensed healthcare providers for consultations. The quality and outcomes of these consultations depend on various factors including internet connectivity, device functionality, and the accuracy of information provided. We do not guarantee specific health outcomes from consultations."
    },
    {
      title: "9. Payment and Billing",
      content: "Payment for services is due at the time of booking or as specified in your service agreement. We accept various payment methods and use secure payment processing. Refund policies vary by service type and are outlined in our refund policy. You are responsible for any applicable taxes on services purchased."
    },
    {
      title: "10. Intellectual Property",
      content: "All content, features, and functionality of the Sehatify platform, including but not limited to text, graphics, logos, software, and AI algorithms, are owned by Sehatify and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission."
    },
    {
      title: "11. User Conduct and Prohibited Uses",
      content: "You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or impair our platform. Prohibited activities include: sharing false health information, attempting to hack or compromise our systems, using the platform for fraudulent activities, or violating the rights of other users."
    },
    {
      title: "12. Limitation of Liability",
      content: "Sehatify's liability for any damages arising from your use of our services is limited to the amount you paid for the specific service that gave rise to the claim. We are not liable for indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or health outcomes."
    },
    {
      title: "13. Indemnification",
      content: "You agree to indemnify and hold Sehatify harmless from any claims, losses, damages, or expenses arising from your use of our services, violation of these terms, or infringement of any third-party rights. This includes reasonable attorney fees and costs incurred in defending against such claims."
    },
    {
      title: "14. Termination",
      content: "We reserve the right to terminate or suspend your account at any time for violation of these terms or for any other reason we deem appropriate. Upon termination, your right to use our services will cease immediately. You may also terminate your account at any time by contacting our support team."
    },
    {
      title: "15. Governing Law and Dispute Resolution",
      content: "These terms are governed by Indian law. Any disputes arising from these terms or your use of our services will be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 2015. The arbitration will be conducted in English and will take place in New Delhi, India."
    },
    {
      title: "16. Changes to Terms",
      content: "We reserve the right to modify these terms at any time. We will notify users of significant changes through our platform or via email. Your continued use of our services after changes are posted constitutes acceptance of the new terms. We encourage you to review these terms periodically."
    },
    {
      title: "17. Contact Information",
      content: "If you have any questions about these Terms of Use, please contact us at: Email: legal@sehatify.com, Phone: +91-1800-123-456, Address: Sehatify Technologies Pvt. Ltd., New Delhi, India"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <FileText className="w-4 h-4 mr-2" />
            Legal Documents
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Terms of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Use
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using Sehatify's healthcare platform and services.
          </p>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Last updated: September 18, 2025</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Legally binding agreement</span>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-2xl">
            <CardContent className="p-0">
              <h3 className="font-bold text-blue-800 mb-4 text-lg">Important Notice</h3>
              <p className="text-blue-700 leading-relaxed">
                By using Sehatify's services, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Use. 
                These terms constitute a legally binding agreement between you and Sehatify Technologies Pvt. Ltd.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0">
                <CardContent className="p-0">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-purple-600">
                    {section.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-justify">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Acknowledgment Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Questions About Our Terms?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Our legal team is available to clarify any questions you may have about these terms of use
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="mailto:legal@sehatify.com" className="inline-block">
              <button className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Email Legal Team
              </button>
            </a>
            <a href="tel:+911800123456" className="inline-block">
              <button className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-10 py-4 text-lg rounded-xl font-semibold transition-all duration-300">
                Call: 1800-123-456
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}