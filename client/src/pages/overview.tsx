import { useTranslation } from 'react-i18next';
import { Heart, Users, Award, Globe, Target, Shield, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function OverviewPage() {
  const { t } = useTranslation();

  const stats = [
    { label: 'Active Users', value: '10M+', icon: Users },
    { label: 'Doctors Network', value: '50K+', icon: Award },
    { label: 'Cities Covered', value: '1000+', icon: Globe },
    { label: 'Consultations', value: '100M+', icon: Heart }
  ];

  const features = [
    {
      icon: Heart,
      title: 'AI-Powered Health Monitoring',
      description: 'Advanced wristband technology monitors vital signs 24/7 with medical-grade precision and real-time health analysis.'
    },
    {
      icon: Users,
      title: 'Expert Doctor Network',
      description: 'Connect with verified specialists and general practitioners for instant consultations and personalized healthcare advice.'
    },
    {
      icon: Shield,
      title: 'Emergency SOS System',
      description: 'Automatic emergency detection and alert system that connects you to 108 services and nearby hospitals instantly.'
    },
    {
      icon: Clock,
      title: '24/7 Healthcare Access',
      description: 'Round-the-clock access to healthcare services including consultations, medicine delivery, and lab test bookings.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
              <Target className="w-4 h-4 mr-2" />
              Company Overview
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transforming Healthcare with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Innovation
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Sehatify is India's leading digital healthcare platform, revolutionizing the way people access and manage their health through cutting-edge technology and comprehensive medical services.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-6 text-center bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl border-0">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Our <span className="text-purple-600">Mission</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To democratize healthcare access across India by providing innovative, technology-driven solutions that make quality medical care affordable, accessible, and efficient for everyone.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that every individual deserves access to world-class healthcare, regardless of their location or economic status. Our mission is to bridge the gap between patients and healthcare providers through digital innovation.
              </p>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Our <span className="text-purple-600">Vision</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To become the most trusted and comprehensive healthcare ecosystem in India, empowering individuals to take control of their health through preventive care, early detection, and seamless access to medical services.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We envision a future where healthcare is predictive, personalized, and accessible to all, powered by artificial intelligence and supported by a network of dedicated healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              What Makes <span className="text-purple-600">Sehatify</span> Different
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the innovative features and services that set us apart in the healthcare industry
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl border-0">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-xl">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Our Core <span className="text-purple-600">Values</span>
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            The principles that guide everything we do at Sehatify
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-4 text-xl">Patient-First Approach</h3>
              <p className="text-gray-600 leading-relaxed">
                Every decision we make prioritizes patient safety, privacy, and well-being above all else.
              </p>
            </div>
            
            <div className="p-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-4 text-xl">Innovation & Excellence</h3>
              <p className="text-gray-600 leading-relaxed">
                We continuously innovate and strive for excellence in everything we deliver to our users.
              </p>
            </div>
            
            <div className="p-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-4 text-xl">Trust & Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                We maintain the highest standards of transparency and build lasting trust with our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Healthcare Revolution</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Experience the future of healthcare with Sehatify's comprehensive digital health platform
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/register" className="inline-block">
              <button className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                Get Started Today
              </button>
            </a>
            <a href="/doctors" className="inline-block">
              <button className="border-2 border-white text-white hover:bg-white hover:text-purple-700 px-10 py-4 text-lg rounded-xl font-semibold transition-all duration-300">
                Explore Services
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}