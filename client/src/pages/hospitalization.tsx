import { useTranslation } from 'react-i18next';
import { Building2, Bed, Clock, CreditCard, MapPin, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export function HospitalizationPage() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Bed,
      title: 'Planned Hospitalization',
      description: 'Schedule non-emergency procedures and surgeries with our network hospitals',
      features: ['Cashless treatment', 'Pre-authorization', 'Room selection', 'Insurance coverage']
    },
    {
      icon: Clock,
      title: 'Emergency Admission',
      description: '24/7 emergency admission support with immediate medical attention',
      features: ['Emergency response', 'Ambulance service', 'ICU availability', 'Specialist on-call']
    },
    {
      icon: CreditCard,
      title: 'Insurance Processing',
      description: 'Seamless insurance claim processing and cashless treatment options',
      features: ['Cashless claims', 'Pre-approval', 'Document support', 'Reimbursement help']
    }
  ];

  const process = [
    {
      step: '01',
      title: 'Contact Sehatify',
      description: 'Call our helpline or use the app to inform about hospitalization needs'
    },
    {
      step: '02', 
      title: 'Hospital Selection',
      description: 'Choose from our network of partner hospitals based on your location and needs'
    },
    {
      step: '03',
      title: 'Insurance Verification',
      description: 'We verify your insurance coverage and arrange pre-authorization'
    },
    {
      step: '04',
      title: 'Admission Support',
      description: 'Complete admission process with dedicated support team assistance'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <Building2 className="w-4 h-4 mr-2" />
            Healthcare Services
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Hospitalization{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Services
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Comprehensive hospitalization support with cashless treatment, insurance processing, and dedicated assistance throughout your medical journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/doctors">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Find Hospital <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="tel:+911800123456">
              <Button variant="outline" className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-xl">
                Call Emergency: 1800-123-456
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Our <span className="text-purple-600">Services</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive hospitalization support tailored to your medical needs and insurance coverage
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardHeader className="p-0 mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-center text-xl text-gray-800">{service.title}</CardTitle>
                    <CardDescription className="text-center text-gray-600">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="space-y-3">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              How It <span className="text-purple-600">Works</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple and streamlined process to ensure you get the best hospitalization experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <Card key={index} className="p-8 bg-white hover:shadow-xl transition-all duration-300 text-center rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Network Hospitals */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Our <span className="text-purple-600">Network</span> Hospitals
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Access to over 10,000+ network hospitals across India for cashless treatment and quality healthcare
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600">Network Hospitals</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">1,000+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Cashless Claims</div>
            </div>
          </div>
          
          <Link href="/locate-hospital">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <MapPin className="w-5 h-5 mr-2" />
              Find Nearest Hospital
            </Button>
          </Link>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Immediate Help?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Our 24/7 helpline is available for emergency hospitalization support and guidance
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:108" className="inline-block">
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Phone className="w-5 h-5 mr-2" />
                Emergency: 108
              </Button>
            </a>
            <a href="tel:+911800123456" className="inline-block">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Phone className="w-5 h-5 mr-2" />
                Sehatify: 1800-123-456
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}