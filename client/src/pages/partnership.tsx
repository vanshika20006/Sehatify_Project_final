import { useTranslation } from 'react-i18next';
import { HandHeart, Building2, Users, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

export function PartnershipPage() {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Users,
      title: 'Expand Patient Reach',
      description: 'Connect with millions of users seeking quality healthcare services'
    },
    {
      icon: Award,
      title: 'Quality Certification',
      description: 'Get verified and showcase your expertise to potential patients'
    },
    {
      icon: Building2,
      title: 'Digital Presence',
      description: 'Enhance your practice with our comprehensive digital platform'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <HandHeart className="w-4 h-4 mr-2" />
            Partner Network
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Partner with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Sehatify
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join our network of healthcare providers and expand your practice with cutting-edge technology and comprehensive patient care solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Join as Partner <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/doctors">
              <Button variant="outline" className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Why Partner with <span className="text-purple-600">Sehatify?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock new opportunities and grow your healthcare practice with our comprehensive partnership program
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-indigo-50 hover:scale-105 rounded-2xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">{benefit.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Partnership <span className="text-purple-600">Options</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-purple-600">Healthcare Providers</CardTitle>
                <CardDescription>Doctors, Specialists, and Clinics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Online consultations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Appointment scheduling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Patient management</span>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-purple-600">Hospitals</CardTitle>
                <CardDescription>Medical facilities and Health Centers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Bed availability</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Emergency services</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Insurance integration</span>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-purple-600">Pharmacies</CardTitle>
                <CardDescription>Medicine delivery and prescription services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Medicine delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Prescription management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Inventory tracking</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Our Network?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Start partnering with Sehatify today and transform the way you deliver healthcare services
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Apply Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}