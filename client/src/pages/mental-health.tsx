import { useState, useEffect, useRef } from 'react';
import { Brain, MessageCircle, Heart, Shield, Phone, UserPlus, Send, X, Video, Mic, MicOff, VideoOff, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VideoCall } from '@/components/ui/video-call';

type HelpCategory = 'loneliness' | 'study' | 'confidence' | 'career' | 'listen';

interface ChatMessage {
  id: string;
  type: 'student' | 'mentor';
  message: string;
  timestamp: Date;
  sender: string;
}

interface SavedSession {
  code: string;
  mentorName: string;
  category: HelpCategory;
  messages: ChatMessage[];
  lastUsed: Date;
}

interface EmergencyResource {
  name: string;
  number: string;
  description: string;
}

interface CallState {
  isCallActive: boolean;
  isVideoCall: boolean;
  isAudioCall: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  callDuration: number;
}

const helpCategories = [
  {
    id: 'loneliness' as HelpCategory,
    title: 'Loneliness & Stress',
    description: 'When you feel isolated or overwhelmed',
    icon: Heart,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  },
  {
    id: 'study' as HelpCategory,
    title: 'Study/Exam Pressure',
    description: 'Academic stress and performance anxiety',
    icon: Brain,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  },
  {
    id: 'confidence' as HelpCategory,
    title: 'Confidence & Personality',
    description: 'Building self-esteem and social skills',
    icon: Shield,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  },
  {
    id: 'career' as HelpCategory,
    title: 'Career & Future Path',
    description: 'Planning your future and making decisions',
    icon: MessageCircle,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  },
  {
    id: 'listen' as HelpCategory,
    title: 'Just Need Someone to Listen',
    description: 'A safe space to express your thoughts',
    icon: Heart,
    color: 'bg-white hover:bg-purple-50 border border-purple-100'
  }
];

const emergencyResources: EmergencyResource[] = [
  {
    name: 'National Suicide Prevention Helpline',
    number: '108',
    description: '24/7 free crisis helpline'
  },
  {
    name: 'Mental Health Helpline',
    number: '1800-599-0019',
    description: 'Professional counseling support'
  },
  {
    name: 'Youth Helpline',
    number: '1098',
    description: 'Support for children and young adults'
  }
];

function generateAnonymousId(): string {
  const prefixes = ['Student', 'Dreamer', 'Listener', 'Seeker', 'Hope', 'Brave', 'Kind', 'Wise'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${prefix}_${number}`;
}

// Category-based mentor pool
const mentorPool = {
  loneliness: ['Mentor_Sarah', 'Mentor_Rahul', 'Mentor_Empathy'],
  study: ['Mentor_Academic', 'Mentor_Focus', 'Mentor_Study'],
  confidence: ['Mentor_Boost', 'Mentor_Shine', 'Mentor_Confident'],
  career: ['Mentor_Guide', 'Mentor_Path', 'Mentor_Future'],
  listen: ['Mentor_Heart', 'Mentor_Listener', 'Mentor_Care']
};

function getMentorForCategory(category: HelpCategory): string {
  const mentors = mentorPool[category];
  return mentors[Math.floor(Math.random() * mentors.length)];
}

function getMentorResponse(category: HelpCategory, studentMessage: string): string {
  const responses = {
    loneliness: [
      "I hear you, and what you're feeling is completely valid. Loneliness can be really tough. Can you tell me a bit more about what's making you feel this way?",
      "It takes courage to reach out when you're feeling lonely. That's actually a strength, not a weakness. What usually helps you feel a little better?",
      "Sometimes when we feel misunderstood, it helps to talk about it. I'm here to listen without any judgment."
    ],
    study: [
      "Academic pressure can feel overwhelming sometimes. You're definitely not alone in feeling this way. What aspect of studying is causing you the most stress right now?",
      "It sounds like you're putting a lot of pressure on yourself. Let's break this down together - what's one small thing we can work on today?",
      "Remember, your worth isn't determined by grades or exam results. You're valuable just as you are. What's been on your mind lately?"
    ],
    confidence: [
      "Building confidence is a journey, and it's okay to have ups and downs. What situations make you feel most uncertain about yourself?",
      "You took a big step by reaching out today - that shows more courage than you might realize. What would feeling more confident mean to you?",
      "Everyone struggles with self-doubt sometimes. What are some things you actually do well, even if they seem small?"
    ],
    career: [
      "Thinking about the future can feel both exciting and scary. It's normal to feel uncertain about your path. What aspects of your future feel most unclear?",
      "Career decisions can feel overwhelming, but remember - there's no single 'right' path. What are you passionate about, even if it seems small?",
      "It's okay not to have everything figured out. Most successful people changed directions multiple times. What interests you right now?"
    ],
    listen: [
      "I'm here and I'm listening. Sometimes we just need someone to hear us without trying to fix everything. What's on your heart today?",
      "Thank you for trusting me with your thoughts. There's no rush - share whatever feels right for you to share.",
      "You don't have to carry everything alone. I'm here to listen for as long as you need. What would help you feel heard today?"
    ]
  };
  
  const categoryResponses = responses[category];
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

export default function MentalHealth() {
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatActive, setChatActive] = useState(false);
  const [mentorName, setMentorName] = useState('');
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [showPrivacyConsent, setShowPrivacyConsent] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    isCallActive: false,
    isVideoCall: false,
    isAudioCall: false,
    isMicMuted: false,
    isVideoMuted: false,
    callDuration: 0
  });
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [mentorRegistration, setMentorRegistration] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    qualifications: '',
    availability: '',
    motivation: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mentalHealthSessions');
    if (saved) {
      try {
        const sessions = JSON.parse(saved) as SavedSession[];
        const processedSessions = sessions.map(session => ({
          ...session,
          lastUsed: new Date(session.lastUsed),
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSavedSessions(processedSessions);
      } catch (error) {
        console.error('Error loading saved sessions:', error);
        setSavedSessions([]);
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startChat = (category: HelpCategory) => {
    const newId = generateAnonymousId();
    const assignedMentor = getMentorForCategory(category);
    
    setAnonymousId(newId);
    setSelectedCategory(category);
    setMentorName(assignedMentor);
    setChatActive(true);
    
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'mentor',
      message: `Hi ${newId} 👋 You can now talk to a mentor. Don't worry, your real identity will never be shown. I'm ${assignedMentor}, specializing in ${helpCategories.find(c => c.id === category)?.title.toLowerCase()}. How are you feeling today?`,
      timestamp: new Date(),
      sender: assignedMentor
    };
    
    setChatMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const messageText = currentMessage.trim();
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'student',
      message: messageText,
      timestamp: new Date(),
      sender: anonymousId
    };

    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');

    try {
      const response = await fetch('/api/chat/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          category: selectedCategory,
          mentorName: mentorName,
          studentId: anonymousId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const mentorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'mentor',
          message: data.response,
          timestamp: new Date(),
          sender: mentorName
        };

        setChatMessages(prev => [...prev, mentorResponse]);
      } else {
        const mentorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'mentor',
          message: getMentorResponse(selectedCategory || 'listen', messageText),
          timestamp: new Date(),
          sender: mentorName
        };

        setChatMessages(prev => [...prev, mentorResponse]);
      }
    } catch (error) {
      console.error('Error getting mentor response:', error);
      const mentorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'mentor',
        message: getMentorResponse(selectedCategory || 'listen', messageText),
        timestamp: new Date(),
        sender: mentorName
      };

      setChatMessages(prev => [...prev, mentorResponse]);
    }

    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'no point', 'worthless', 'harm myself'];
    if (crisisKeywords.some(keyword => messageText.toLowerCase().includes(keyword))) {
      setTimeout(() => {
        setShowEmergencyDialog(true);
      }, 2000);
    }
  };

  const endChat = () => {
    setChatActive(false);
    setChatMessages([]);
    setSelectedCategory(null);
    setAnonymousId('');
    setMentorName('');
  };

  const saveSession = () => {
    if (!selectedCategory) return;
    
    const hasConsent = localStorage.getItem('mentalHealthPrivacyConsent');
    if (!hasConsent) {
      setShowPrivacyConsent(true);
      return;
    }
    
    const newSession: SavedSession = {
      code: anonymousId,
      mentorName: mentorName,
      category: selectedCategory,
      messages: chatMessages,
      lastUsed: new Date()
    };
    
    const updatedSessions = savedSessions.filter(session => session.code !== anonymousId);
    updatedSessions.push(newSession);
    
    setSavedSessions(updatedSessions);
    localStorage.setItem('mentalHealthSessions', JSON.stringify(updatedSessions));
    alert(`Session saved: ${anonymousId}. Find this session in 'Your Saved Sessions' on this device to continue with ${mentorName}.`);
  };
  
  const handlePrivacyConsent = (consent: boolean) => {
    if (consent) {
      localStorage.setItem('mentalHealthPrivacyConsent', 'true');
      saveSession();
    }
    setShowPrivacyConsent(false);
  };

  const loadSavedSession = (session: SavedSession) => {
    setAnonymousId(session.code);
    setSelectedCategory(session.category);
    setMentorName(session.mentorName);
    setChatActive(true);
    
    const welcomeBackMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'mentor',
      message: `Welcome back ${session.code}! It's ${session.mentorName}. I remember our conversation about ${helpCategories.find(c => c.id === session.category)?.title.toLowerCase()}. How have you been since we last talked?`,
      timestamp: new Date(),
      sender: session.mentorName
    };
    
    setChatMessages([...session.messages, welcomeBackMessage]);
  };

  const handleMentorRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your application! Our team will review your submission and contact you within 3-5 business days.');
    setMentorRegistration({
      name: '',
      email: '',
      specialization: '',
      experience: '',
      qualifications: '',
      availability: '',
      motivation: ''
    });
  };

  if (chatActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25 p-4" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-t-lg border p-4 flex justify-between items-center shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Anonymous Chat</h2>
                <p className="text-sm text-muted-foreground">Connected as: {anonymousId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowVideoCall(true)} 
                variant="outline" 
                size="sm"
                className="text-purple-600 hover:bg-purple-50"
              >
                <Video className="w-4 h-4 mr-1" />
                Video
              </Button>
              <Button 
                onClick={() => setShowVideoCall(true)} 
                variant="outline" 
                size="sm"
                className="text-green-600 hover:bg-green-50"
              >
                <Phone className="w-4 h-4 mr-1" />
                Voice
              </Button>
              <Button onClick={saveSession} variant="outline" size="sm">
                Save Session
              </Button>
              <Button onClick={endChat} variant="destructive" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white border-x h-96">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'student'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{message.sender}</p>
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Video Call Interface */}
          {showVideoCall && (
            <div className="bg-white border-x border-b p-4">
              <VideoCall 
                mentorName={mentorName}
                roomId={`${anonymousId}-${selectedCategory}`}
                onEndCall={() => setShowVideoCall(false)}
              />
            </div>
          )}

          <div className="bg-white rounded-b-lg border p-4">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!currentMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-25 via-white to-indigo-25" style={{background: 'linear-gradient(to bottom right, #faf7ff, #ffffff, #f8faff)'}}>
      {/* Hero Section - Modern Professional Style */}
      <section className="relative py-20 px-4 overflow-hidden">
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              24/7 Anonymous Support
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Mental Health{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Support
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Anonymous, confidential mental health support available 24/7. Connect with trained mentors in a safe environment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Become a Mentor
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-green-500" />
                      <span>Become a Mental Health Mentor</span>
                    </DialogTitle>
                    <DialogDescription>
                      Join our community of caring individuals providing anonymous mental health support to students in need.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleMentorRegistration} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={mentorRegistration.name}
                          onChange={(e) => setMentorRegistration(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={mentorRegistration.email}
                          onChange={(e) => setMentorRegistration(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motivation">Why do you want to be a mentor? *</Label>
                      <Textarea
                        id="motivation"
                        value={mentorRegistration.motivation}
                        onChange={(e) => setMentorRegistration(prev => ({ ...prev, motivation: e.target.value }))}
                        placeholder="Tell us about your passion for helping others..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                      Submit Application
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Anonymous & Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Trained Mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Confidential</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-purple-300 rounded-full opacity-20 animate-pulse delay-150"></div>
      </section>

      {/* Mental Health Categories Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How can we <span className="text-purple-600">help you today?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the support you need and connect with a caring mentor who understands
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => startChat(category.id)}
                  className={`${category.color} p-8 rounded-2xl text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-md`}
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 text-purple-600 bg-purple-50 rounded-full flex items-center justify-center shadow-sm">
                      <Icon className="w-10 h-10" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-3 text-lg">{category.title}</h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl">
                    Start Conversation
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Resources Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Crisis Support <span className="text-red-600">Resources</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              If you're in immediate danger or having thoughts of self-harm, please reach out for help right away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {emergencyResources.map((resource, index) => (
              <div key={index} className="bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-2xl text-center hover:shadow-lg transition-all duration-300 border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-3">{resource.name}</h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <Button
                  variant="destructive"
                  onClick={() => window.open(`tel:${resource.number}`, '_self')}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call {resource.number}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Saved Sessions Section */}
      {savedSessions.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-indigo-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Your <span className="text-purple-600">Saved Sessions</span>
              </h2>
              <p className="text-lg text-gray-600">
                Continue your conversations with your previous mentors
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSessions.map((session, index) => (
                <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white hover:scale-105 rounded-2xl" onClick={() => loadSavedSession(session)}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{session.code}</h3>
                    <p className="text-purple-600 mb-2">{session.mentorName}</p>
                    <Badge variant="secondary" className="mb-3">
                      {helpCategories.find(c => c.id === session.category)?.title}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      Last used: {session.lastUsed.toLocaleDateString()}
                    </p>
                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                      Continue Chat
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}