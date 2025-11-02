import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Stethoscope, Pill, Calendar, TestTube, Scissors, HeartHandshake, ArrowRight, Star, Shield, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function LandingPage() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Stethoscope,
      title: 'Talk to Doctor',
      description: 'Consult with top doctors anytime',
      color: 'text-purple-600',
      bgColor: 'bg-white hover:bg-purple-50'
    },
    {
      icon: Pill,
      title: 'Medicines',
      description: 'Order medicines online',
      color: 'text-purple-600',
      bgColor: 'bg-white hover:bg-purple-50'
    },
    {
      icon: Calendar,
      title: 'Book Dr. Appointment',
      description: 'Book appointments easily',
      color: 'text-purple-600',
      bgColor: 'bg-white hover:bg-purple-50'
    },
    {
      icon: TestTube,
      title: 'Lab Test & Diagnostic',
      description: 'Book lab tests at home',
      color: 'text-purple-600',
      bgColor: 'bg-white hover:bg-purple-50'
    },
    {
      icon: Scissors,
      title: 'Surgery',
      description: 'Plan your surgery',
      color: 'text-purple-600',
      bgColor: 'bg-white hover:bg-purple-50'
    },
    {
      icon: HeartHandshake,
      title: 'Healthcare',
      description: 'Comprehensive care plans',
      color: 'text-purple-600',
      bgColor: 'bg-white hover:bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section - Modern Professional Style */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-purple-600" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Trusted by 10M+ Users
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your Health,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Our Priority
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Consult with top doctors online, anytime. Access premium healthcare services from the comfort of your home.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/doctors">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Consultation <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/vitals">
                <Button variant="outline" className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-xl">
                  Book Health Checkup
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Verified Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-purple-300 rounded-full opacity-20 animate-pulse delay-150"></div>
      </section>

      {/* Services Grid - Sehatify Style */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Healthcare Services at Your <span className="text-purple-600">Fingertips</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access comprehensive healthcare services from the comfort of your home
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link key={index} href={index === 0 ? "/doctors" : index === 1 ? "/medicines" : index === 2 ? "/doctors" : index === 3 ? "/vitals" : index === 4 ? "/ai-doctor" : "/mental-health"}>
                  <div className={`${service.bgColor} p-6 rounded-2xl text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border border-purple-100 shadow-md`}>
                    <div className="flex justify-center mb-4">
                      <div className={`w-16 h-16 ${service.color} bg-purple-50 rounded-full flex items-center justify-center shadow-sm`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Promotional Banner */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 py-8 px-6 rounded-3xl mb-12 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <TestTube className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Test Early. Stay Ahead.</h3>
                  <p className="text-purple-100">Book now and get tested at your doorstep</p>
                </div>
              </div>
              <Link href="/vitals">
                <Button className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl shadow-lg">
                  Book Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Consult with Top Doctors Online, <span className="text-purple-600">24x7</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with experienced doctors instantly for personalized healthcare advice
            </p>
            
            <Link href="/doctors">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Start Consultation <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-3">Safe & Secure</h3>
              <p className="text-gray-600">Your privacy is protected with end-to-end encryption</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-3">24x7 Available</h3>
              <p className="text-gray-600">Consult anytime, anywhere with instant access</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-3">Top Doctors</h3>
              <p className="text-gray-600">Verified & experienced medical professionals</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-3">Trusted by Millions</h3>
              <p className="text-gray-600">Over 10M+ successful consultations completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Section - Sehatify Style */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              <span className="text-purple-600">Insurance</span> Services
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Get access to all your Health insurance services - View Policy, Initiate and Track Claims, 
              Go Cashless with network hospitals and intimate Hospitalization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* E-Card */}
            <Link href="/dashboard">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:scale-105 rounded-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg text-white text-sm flex items-center justify-center font-bold">
                      EC
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-lg">E-Card</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Get e-cards for you and your family members</p>
                </div>
              </Card>
            </Link>

            {/* Claims */}
            <Link href="/dashboard">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:scale-105 rounded-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg text-white text-sm flex items-center justify-center font-bold">
                      CL
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-lg">Claims</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Track your claims in real-time</p>
                </div>
              </Card>
            </Link>

            {/* Network Hospitals */}
            <Link href="/doctors">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:scale-105 rounded-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg text-white text-sm flex items-center justify-center font-bold">
                      NH
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-lg">Network Hospitals</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Search for the nearest Network hospital to go cashless</p>
                </div>
              </Card>
            </Link>

            {/* Empanel Hospitals */}
            <Link href="/doctors">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:scale-105 rounded-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg text-white text-sm flex items-center justify-center font-bold">
                      EH
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-lg">Empanel Hospitals</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">Become a part of Network Hospitals</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-sehatify-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join millions of users who trust Sehatify for their healthcare needs and experience the future of medicine
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/doctors">
              <Button size="lg" variant="outline" className="border-2 border-white text-purple-700 hover:bg-white hover:text-purple-700 px-10 py-4 text-lg rounded-xl">
                Find Doctors
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}