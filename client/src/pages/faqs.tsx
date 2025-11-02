import { useTranslation } from 'react-i18next';
import { MessageCircleQuestion, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQsPage() {
  const { t } = useTranslation();

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What is Sehatify and how does it work?",
          answer: "Sehatify is a comprehensive healthcare platform that connects patients with doctors, enables online consultations, medicine delivery, lab test bookings, and provides AI-powered health monitoring through smart wristbands."
        },
        {
          question: "Is Sehatify available in my location?",
          answer: "Sehatify is expanding rapidly across India. You can check availability in your area by entering your location in our app or website."
        },
        {
          question: "How do I create an account?",
          answer: "You can sign up using your mobile number, email, or social media accounts. The registration process is simple and takes less than 2 minutes."
        }
      ]
    },
    {
      category: "Consultations",
      questions: [
        {
          question: "How do I book an online consultation?",
          answer: "Navigate to the 'Doctors' section, select your preferred specialty, choose a doctor, and book an available slot. You can consult via video call, audio call, or chat."
        },
        {
          question: "Are the doctors on Sehatify verified?",
          answer: "Yes, all doctors on our platform are verified medical professionals with valid licenses. We conduct thorough background checks and credential verification."
        },
        {
          question: "What if I need to reschedule my appointment?",
          answer: "You can reschedule your appointment up to 2 hours before the scheduled time through your dashboard or by contacting our support team."
        }
      ]
    },
    {
      category: "Medicines & Lab Tests",
      questions: [
        {
          question: "How does medicine delivery work?",
          answer: "Upload your prescription, select medicines, choose delivery address, and make payment. Your medicines will be delivered within 2-4 hours in most areas."
        },
        {
          question: "Can I book lab tests at home?",
          answer: "Yes, we offer home sample collection for most lab tests. Book through the app and our certified technicians will visit your location."
        },
        {
          question: "Do you accept insurance?",
          answer: "We accept most major health insurance plans. You can check your coverage and claim benefits directly through the app."
        }
      ]
    },
    {
      category: "Wristband & Health Monitoring",
      questions: [
        {
          question: "What health parameters does the wristband monitor?",
          answer: "The Sehatify wristband monitors heart rate, blood pressure, SpO2, body temperature, sleep patterns, and activity levels in real-time."
        },
        {
          question: "How accurate is the health monitoring?",
          answer: "Our wristband uses medical-grade sensors with clinical accuracy. All readings are FDA and ISO certified for reliability."
        },
        {
          question: "What happens during an emergency alert?",
          answer: "The wristband automatically detects emergencies and sends alerts to 108 services, your emergency contacts, and nearby hospitals with your location."
        }
      ]
    },
    {
      category: "Payment & Privacy",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. All transactions are secure and encrypted."
        },
        {
          question: "Is my health data secure?",
          answer: "Yes, we use bank-level encryption and comply with HIPAA standards. Your health data is never shared without your explicit consent."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes, you can delete your account and all associated data anytime through the settings page or by contacting our support team."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <MessageCircleQuestion className="w-4 h-4 mr-2" />
            Help Center
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Questions
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about Sehatify's healthcare services, wristband monitoring, and platform features.
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                <span className="text-purple-600">{category.category}</span> Questions
              </h2>
              
              <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem key={index} value={`${categoryIndex}-${index}`} className="border-b border-gray-100 last:border-0">
                        <AccordionTrigger className="px-8 py-6 text-left hover:bg-purple-50 transition-colors">
                          <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-8 pb-6 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Still have questions?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Our support team is available 24/7 to help you with any queries or concerns
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:+911800123456" className="inline-block">
              <button className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Call Support: 1800-123-456
              </button>
            </a>
            <a href="mailto:support@sehatify.com" className="inline-block">
              <button className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-8 py-4 text-lg rounded-xl font-semibold transition-all duration-300">
                Email: support@sehatify.com
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}