import { useTranslation } from 'react-i18next';
import { BookOpen, Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

export function BlogPage() {
  const { t } = useTranslation();

  const blogPosts = [
    {
      id: '1',
      title: 'The Future of AI in Healthcare: How Smart Wristbands are Revolutionizing Patient Monitoring',
      excerpt: 'Discover how AI-powered wearable devices are transforming the way we monitor and manage health conditions in real-time.',
      author: 'Dr. Priya Sharma',
      date: '2025-09-15',
      readTime: '8 min read',
      category: 'Technology',
      tags: ['AI', 'Wearables', 'Health Tech'],
      image: '/api/placeholder/600/400'
    },
    {
      id: '2',
      title: '10 Signs You Should Consult a Doctor Immediately',
      excerpt: 'Learn about critical health warning signs that require immediate medical attention and how telemedicine can help.',
      author: 'Dr. Rajesh Kumar',
      date: '2025-09-12',
      readTime: '6 min read',
      category: 'Health Tips',
      tags: ['Emergency', 'Symptoms', 'Prevention'],
      image: '/api/placeholder/600/400'
    },
    {
      id: '3',
      title: 'Understanding Health Insurance: A Complete Guide for Indian Families',
      excerpt: 'Navigate the complex world of health insurance with our comprehensive guide covering everything from policy selection to claim processing.',
      author: 'Financial Health Team',
      date: '2025-09-10',
      readTime: '12 min read',
      category: 'Insurance',
      tags: ['Insurance', 'Family Health', 'Financial Planning'],
      image: '/api/placeholder/600/400'
    },
    {
      id: '4',
      title: 'Mental Health in the Digital Age: Finding Balance with Technology',
      excerpt: 'Explore how digital health platforms can support mental wellness while maintaining healthy boundaries with technology.',
      author: 'Dr. Anita Menon',
      date: '2025-09-08',
      readTime: '10 min read',
      category: 'Mental Health',
      tags: ['Mental Health', 'Digital Wellness', 'Lifestyle'],
      image: '/api/placeholder/600/400'
    },
    {
      id: '5',
      title: 'Preventive Healthcare: Why Regular Checkups Save Lives',
      excerpt: 'Learn about the importance of preventive healthcare and how regular health monitoring can detect issues before they become serious.',
      author: 'Dr. Vikram Singh',
      date: '2025-09-05',
      readTime: '7 min read',
      category: 'Preventive Care',
      tags: ['Prevention', 'Health Checkups', 'Early Detection'],
      image: '/api/placeholder/600/400'
    },
    {
      id: '6',
      title: 'Nutrition and Immunity: Foods That Boost Your Natural Defenses',
      excerpt: 'Discover science-backed nutrition strategies to strengthen your immune system naturally through diet and lifestyle changes.',
      author: 'Dr. Meera Patel',
      date: '2025-09-02',
      readTime: '9 min read',
      category: 'Nutrition',
      tags: ['Nutrition', 'Immunity', 'Wellness'],
      image: '/api/placeholder/600/400'
    }
  ];

  const categories = ['All', 'Technology', 'Health Tips', 'Insurance', 'Mental Health', 'Preventive Care', 'Nutrition'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <BookOpen className="w-4 h-4 mr-2" />
            Health Insights
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sehatify{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Blog
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest health insights, medical breakthroughs, and expert advice from our team of healthcare professionals.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Featured Article</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded"></div>
          </div>
          
          <Card className="overflow-hidden rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="grid lg:grid-cols-2">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-8 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-24 h-24 text-purple-600 mx-auto mb-4" />
                  <p className="text-purple-700 font-medium">Featured Article Image</p>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 mb-4">
                    {blogPosts[0].category}
                  </Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 leading-tight">
                    {blogPosts[0].title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">{blogPosts[0].author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 text-sm">{blogPosts[0].date}</span>
                    </div>
                    <span className="text-gray-600 text-sm">{blogPosts[0].readTime}</span>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    Read Full Article <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                className={index === 0 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-xl shadow-lg" 
                  : "border-purple-200 text-purple-700 hover:bg-purple-50 px-6 py-2 rounded-xl"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Recent Articles</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white">
                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 text-purple-600 mx-auto mb-2" />
                    <p className="text-purple-700 font-medium text-sm">Article Image</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 mb-3">
                      {post.category}
                    </Badge>
                    <h3 className="font-bold text-gray-800 mb-3 text-lg leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-600 font-medium">{post.readTime}</span>
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded-lg">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Updated with Health Insights</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest health articles, expert tips, and medical breakthroughs delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-6 py-4 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <Button className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
              Subscribe
            </Button>
          </div>
          <p className="text-sm opacity-75 mt-4">
            No spam, unsubscribe anytime. Privacy policy applies.
          </p>
        </div>
      </section>
    </div>
  );
}