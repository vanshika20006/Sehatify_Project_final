import { useTranslation } from 'react-i18next';
import { AlertCircle, MessageSquare, Phone, Mail, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function GrievancePage() {
  const { t } = useTranslation();

  const grievanceTypes = [
    { value: 'service_quality', label: 'Service Quality Issues' },
    { value: 'billing', label: 'Billing & Payment Issues' },
    { value: 'privacy', label: 'Privacy & Data Concerns' },
    { value: 'technical', label: 'Technical Problems' },
    { value: 'doctor_consultation', label: 'Doctor Consultation Issues' },
    { value: 'medicine_delivery', label: 'Medicine Delivery Problems' },
    { value: 'emergency_response', label: 'Emergency Response Issues' },
    { value: 'other', label: 'Other Concerns' }
  ];

  const process = [
    {
      step: '01',
      title: 'Submit Complaint',
      description: 'Fill out the grievance form with detailed information about your concern',
      time: 'Immediate'
    },
    {
      step: '02',
      title: 'Acknowledgment',
      description: 'Receive confirmation and unique ticket number within 24 hours',
      time: '24 hours'
    },
    {
      step: '03',
      title: 'Investigation',
      description: 'Our team investigates the issue and may contact you for additional details',
      time: '3-5 business days'
    },
    {
      step: '04',
      title: 'Resolution',
      description: 'Receive resolution update and closure confirmation',
      time: '7-10 business days'
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'grievances@sehatify.com',
      response: 'Response within 24 hours',
      action: 'mailto:grievances@sehatify.com'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+91-1800-123-456',
      response: 'Available 9 AM - 9 PM IST',
      action: 'tel:+911800123456'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Instant chat support',
      response: 'Available 24/7',
      action: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <AlertCircle className="w-4 h-4 mr-2" />
            Customer Support
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Grievance{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Redressal
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            We're committed to resolving your concerns promptly and fairly. Your feedback helps us improve our healthcare services.
          </p>
        </div>
      </section>

      {/* Grievance Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Submit Your <span className="text-purple-600">Grievance</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Please provide detailed information about your concern so we can assist you effectively
            </p>
          </div>
          
          <Card className="p-8 shadow-xl rounded-2xl border-0 bg-white">
            <CardContent className="p-0">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <Input 
                      placeholder="Enter your full name"
                      className="py-3 text-lg rounded-xl border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <Input 
                      type="email"
                      placeholder="Enter your email address"
                      className="py-3 text-lg rounded-xl border-purple-200 focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <Input 
                      placeholder="Enter your phone number"
                      className="py-3 text-lg rounded-xl border-purple-200 focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grievance Type *</label>
                    <Select>
                      <SelectTrigger className="py-3 text-lg rounded-xl border-purple-200">
                        <SelectValue placeholder="Select grievance type" />
                      </SelectTrigger>
                      <SelectContent>
                        {grievanceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                  <Input 
                    placeholder="Brief description of your concern"
                    className="py-3 text-lg rounded-xl border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description *</label>
                  <Textarea 
                    placeholder="Please provide detailed information about your grievance including dates, services involved, and specific issues faced..."
                    rows={6}
                    className="text-lg rounded-xl border-purple-200 focus:border-purple-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Order/Consultation ID (if applicable)</label>
                  <Input 
                    placeholder="Enter your order or consultation ID"
                    className="py-3 text-lg rounded-xl border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="pt-4">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Submit Grievance <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Our Resolution <span className="text-purple-600">Process</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We follow a structured approach to ensure your grievance is resolved efficiently and fairly
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <Card key={index} className="p-8 text-center bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl border-0">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">{item.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">{item.description}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-600 font-medium text-sm">{item.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Alternative <span className="text-purple-600">Contact Methods</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the communication method that works best for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="p-8 text-center bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl border-0">
                  <CardHeader className="p-0 mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-800">{method.title}</CardTitle>
                    <CardDescription className="text-gray-600 text-lg font-medium">{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-gray-600 mb-6">{method.response}</p>
                    <a href={method.action}>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        Contact Now
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Commitment to You</h2>
          <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
            We are committed to providing excellent customer service and resolving all grievances in a timely, fair, and transparent manner. Your satisfaction is our priority.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="p-6">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-bold text-xl mb-2">Fair Resolution</h3>
              <p className="opacity-90">Every grievance is investigated impartially with a focus on fair outcomes</p>
            </div>
            <div className="p-6">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-bold text-xl mb-2">Timely Response</h3>
              <p className="opacity-90">Acknowledgment within 24 hours and resolution within 7-10 business days</p>
            </div>
            <div className="p-6">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-bold text-xl mb-2">Continuous Improvement</h3>
              <p className="opacity-90">We use your feedback to continuously improve our services</p>
            </div>
          </div>
          
          <p className="text-lg opacity-90">
            If you're not satisfied with our initial response, you can escalate your concern to our senior management team at{" "}
            <a href="mailto:escalations@sehatify.com" className="underline hover:no-underline">
              escalations@sehatify.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}