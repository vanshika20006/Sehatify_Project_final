import { useTranslation } from 'react-i18next';
import { Heart, Users, Shield, Lightbulb, Globe, Handshake, Award, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function BeliefsPage() {
  const { t } = useTranslation();

  const beliefs = [
    {
      icon: Heart,
      title: 'Healthcare is a Human Right',
      description: 'We believe that quality healthcare should be accessible to every individual, regardless of their economic status or geographical location. Healthcare is not a privilege but a fundamental human right.',
      color: 'text-red-500'
    },
    {
      icon: Users,
      title: 'Patient-Centric Approach',
      description: 'Our patients are at the center of everything we do. Every decision, every feature, and every service is designed with the patient\'s wellbeing, privacy, and convenience in mind.',
      color: 'text-blue-500'
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'We maintain the highest standards of transparency in our operations, pricing, and data handling. Trust is earned through consistent actions and transparent communication.',
      color: 'text-green-500'
    },
    {
      icon: Lightbulb,
      title: 'Innovation for Good',
      description: 'Technology should serve humanity. We harness the power of AI, IoT, and digital platforms to make healthcare more efficient, accurate, and accessible for everyone.',
      color: 'text-yellow-500'
    },
    {
      icon: Globe,
      title: 'Preventive Healthcare Focus',
      description: 'Prevention is better than cure. We emphasize early detection, continuous monitoring, and preventive care to keep people healthy rather than just treating illnesses.',
      color: 'text-purple-500'
    },
    {
      icon: Handshake,
      title: 'Collaborative Healthcare',
      description: 'Healthcare is a team effort. We bring together doctors, patients, caregivers, and technology to create a collaborative ecosystem focused on better health outcomes.',
      color: 'text-indigo-500'
    },
    {
      icon: Award,
      title: 'Quality Without Compromise',
      description: 'We never compromise on quality. From medical-grade sensors to certified doctors, every aspect of our service meets the highest standards of healthcare excellence.',
      color: 'text-orange-500'
    },
    {
      icon: Target,
      title: 'Continuous Improvement',
      description: 'We believe in constantly evolving and improving our services based on user feedback, medical advancements, and emerging technologies to serve our community better.',
      color: 'text-pink-500'
    }
  ];

  const values = [
    {
      title: 'Empathy',
      description: 'Understanding and sharing the feelings of our patients and healthcare partners'
    },
    {
      title: 'Integrity',
      description: 'Maintaining honesty and strong moral principles in all our interactions'
    },
    {
      title: 'Excellence',
      description: 'Striving for the highest standards in everything we do'
    },
    {
      title: 'Innovation',
      description: 'Continuously seeking better ways to deliver healthcare services'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <Heart className="w-4 h-4 mr-2" />
            Our Philosophy
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sehatify{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Beliefs
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Our core beliefs and values guide everything we do at Sehatify. These principles shape our mission to democratize healthcare and make it accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            Our <span className="text-purple-600">Mission</span>
          </h2>
          <Card className="p-12 bg-gradient-to-r from-purple-50 to-indigo-50 border-0 rounded-3xl shadow-xl">
            <CardContent className="p-0">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed italic">
                "To revolutionize healthcare by making quality medical services accessible, affordable, and efficient for every individual through innovative technology and compassionate care."
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Beliefs */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              What We <span className="text-purple-600">Believe</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These fundamental beliefs drive our passion for creating better healthcare experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {beliefs.map((belief, index) => {
              const Icon = belief.icon;
              return (
                <Card key={index} className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl border-0">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-6">
                      <div className={`w-16 h-16 ${belief.color} bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-8 h-8 ${belief.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 text-xl">{belief.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{belief.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Our Core <span className="text-purple-600">Values</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The fundamental values that guide our team's actions and decisions every day
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-8 text-center bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl border-0">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                    {value.title.charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-4 text-xl">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Statement */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            Our <span className="text-purple-600">Vision</span>
          </h2>
          <Card className="p-12 bg-white border-0 rounded-3xl shadow-xl">
            <CardContent className="p-0">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed italic mb-8">
                "To become the most trusted healthcare ecosystem in India, where technology and compassion come together to create healthier communities and happier lives."
              </p>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">2030</div>
                  <div className="text-gray-600">100M+ Lives Impacted</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">Pan-India</div>
                  <div className="text-gray-600">Every District Covered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">AI-First</div>
                  <div className="text-gray-600">Predictive Healthcare</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Commitment to You</h2>
          <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
            We pledge to uphold these beliefs and values in every interaction, every service, and every innovation we bring to the healthcare ecosystem. Your trust in us drives our commitment to excellence.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-bold text-xl mb-2">Data Privacy</h3>
              <p className="opacity-90">Your health data is completely secure and private</p>
            </div>
            <div className="p-6">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-bold text-xl mb-2">Quality Care</h3>
              <p className="opacity-90">Medical-grade accuracy in all our services</p>
            </div>
            <div className="p-6">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="font-bold text-xl mb-2">Community First</h3>
              <p className="opacity-90">Building healthier communities together</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}