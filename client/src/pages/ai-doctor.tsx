import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Volume2,
  VolumeX,
  User,
  Stethoscope,
  Heart,
  Brain,
  MessageSquare,
  Sparkles,
  FileText,
  Upload
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { useHealthData } from '@/hooks/use-health-data';
import { useAuth } from '@/hooks/use-auth';
import { ThreeScene } from '@/components/ui/three-scene';
import { AnatomicalModel } from '@/components/ui/anatomical-model';
import { StructuredHealthResponse } from '@/components/ui/structured-health-response';

interface ChatMessage {
  id: string;
  role: 'user' | 'doctor';
  content: string;
  timestamp: Date;
  analyzed?: boolean;
  anatomicalModel?: string;
  bodyPart?: string;
  structured?: any;
}

interface HealthContext {
  symptoms?: string[];
  concerns?: string[];
  medications?: string[];
  currentVitals?: any;
}

export function AIDoctorPage() {
  const { t } = useTranslation();
  const { currentVitals, historicalData } = useHealthData();
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [healthContext, setHealthContext] = useState<HealthContext>({});
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [currentAnatomicalModel, setCurrentAnatomicalModel] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<any>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'doctor',
      content: `Hello! I'm Dr. AI, your personal 3D virtual health assistant. I'm here to help you with health questions, analyze your symptoms, and provide medical guidance. 

How are you feeling today? Is there anything specific about your health you'd like to discuss?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      // Set recognition language based on selected language
      const languageMap: { [key: string]: string } = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'es': 'es-ES', 
        'fr': 'fr-FR'
      };
      speechRecognition.current.lang = languageMap[selectedLanguage] || 'en-US';

      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
      };

      speechRecognition.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Update speech recognition language when selectedLanguage changes
  useEffect(() => {
    if (speechRecognition.current) {
      // Set recognition language based on selected language
      const languageMap: { [key: string]: string } = {
        'en': 'en-US',
        'hi': 'hi-IN',
        'es': 'es-ES', 
        'fr': 'fr-FR'
      };
      speechRecognition.current.lang = languageMap[selectedLanguage] || 'en-US';
    }
  }, [selectedLanguage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update health context when vitals change
    if (currentVitals) {
      setHealthContext(prev => ({
        ...prev,
        currentVitals
      }));
    }
  }, [currentVitals]);

  // Cleanup effect for speech recognition
  useEffect(() => {
    return () => {
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: currentMessage,
          language: selectedLanguage,
          healthContext: currentVitals ? {
            heartRate: currentVitals.heartRate,
            bloodPressureSystolic: currentVitals.bloodPressureSystolic,
            bloodPressureDiastolic: currentVitals.bloodPressureDiastolic,
            oxygenSaturation: currentVitals.oxygenSaturation,
            bodyTemperature: currentVitals.bodyTemperature,
            timestamp: new Date()
          } : undefined,
          userProfile: {
            age: userProfile?.age || 30,
            gender: userProfile?.gender || 'other',
            medicalHistory: userProfile?.medicalHistory
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const doctorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'doctor',
          content: data.response,
          timestamp: new Date(),
          analyzed: true,
          anatomicalModel: data.anatomicalModel,
          bodyPart: data.bodyPart,
          structured: data.structured
        };
        setMessages(prev => [...prev, doctorMessage]);
        
        // Update the current anatomical model if detected
        if (data.anatomicalModel) {
          console.log('3D Model detected:', data.anatomicalModel, 'for body part:', data.bodyPart);
          setCurrentAnatomicalModel(data.anatomicalModel);
        } else {
          console.log('No anatomical model detected in response:', data);
        }
        
        // Speak the response if enabled
        if (isSpeaking) {
          speakResponse(data.response);
        }
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'doctor',
        content: "I apologize, but I'm having trouble processing your request right now. For immediate health concerns, please contact your healthcare provider or emergency services.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    // Stop any ongoing speech synthesis to avoid conflicts
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    if (speechRecognition.current && !isListening) {
      setIsListening(true);
      speechRecognition.current.start();
    }
  };

  const stopListening = () => {
    if (speechRecognition.current && isListening) {
      setIsListening(false);
      speechRecognition.current.stop();
    }
  };

  const speakText = (text: string) => {
    // Use the enhanced speakResponse function
    speakResponse(text);
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
    }
  };

  const quickQuestions = [
    "I'm feeling tired lately, what could be causing this?",
    "My blood pressure readings seem high, should I be concerned?",
    "What are some good exercises for heart health?",
    "I have a headache, what might help?",
    "Can you explain my recent vitals?",
    "What symptoms should I watch out for?"
  ];

  const handleQuickQuestion = (question: string) => {
    setCurrentMessage(question);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', selectedLanguage);
    
    // Determine document type based on file name/type (using valid schema values)
    let documentType = 'other';
    const fileName = file.name.toLowerCase();
    if (fileName.includes('prescription') || fileName.includes('rx')) {
      documentType = 'prescription';
    } else if (fileName.includes('lab') || fileName.includes('test') || fileName.includes('blood')) {
      documentType = 'blood_test';
    } else if (fileName.includes('xray') || fileName.includes('x-ray') || fileName.includes('x_ray')) {
      documentType = 'xray';
    } else if (fileName.includes('mri')) {
      documentType = 'mri';
    } else if (fileName.includes('ct') || fileName.includes('scan')) {
      documentType = 'ct_scan';
    } else if (fileName.includes('ecg') || fileName.includes('ekg')) {
      documentType = 'ecg';
    } else if (fileName.includes('discharge') || fileName.includes('summary')) {
      documentType = 'discharge_summary';
    }

    console.log('Determined document type:', documentType);
    formData.append('reportType', documentType);
    formData.append('sourceType', 'user_upload');
    formData.append('sourceId', user?.id || 'anonymous');
    formData.append('description', `User uploaded ${documentType} for analysis`);

    try {
      console.log('Starting upload to /api/uploads');
      const response = await fetch('/api/uploads', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      console.log('Upload response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload response data:', data);
        
        // Add file upload message to chat
        const fileMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: `📄 Uploaded: ${file.name}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fileMessage]);

        // Add analysis result to chat if available
        console.log('Checking for analysis data:', data.report?.analysis);
        if (data.report?.analysis) {
          const analysisMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'doctor',
            content: `📋 **Document Analysis Summary:**

**Key Findings:**
${data.report.analysis.keyFindings?.map((finding: string) => `• ${finding}`).join('\n') || 'Analysis completed successfully'}

**Recommendations:**
${data.report.analysis.recommendations?.map((rec: string) => `• ${rec}`).join('\n') || 'Please consult with your healthcare provider'}

**Summary:** ${data.report.analysis.summary || 'Document uploaded and analyzed successfully'}

${data.report.analysis.followUpNeeded ? '⚠️ **Important:** Follow-up with your healthcare provider is recommended.' : ''}`,
            timestamp: new Date(),
            analyzed: true
          };
          setMessages(prev => [...prev, analysisMessage]);
          console.log('Analysis message added to chat');
          
          // Speak the analysis if voice is enabled
          if (isSpeaking) {
            const speakText = `Document analysis complete. ${data.report.analysis.summary}. ${data.report.analysis.followUpNeeded ? 'Follow-up with your healthcare provider is recommended.' : ''}`;
            speakResponse(speakText);
          }
        } else {
          console.error('No analysis data found in response!', data);
          // Still show a success message even without analysis
          const successMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'doctor',
            content: `✅ Document uploaded successfully! The file "${file.name}" has been saved to your medical records.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        }
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Upload failed with status:', response.status, errorData);
        throw new Error(errorData?.error || `Upload failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('File upload error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'doctor',
        content: `❌ Sorry, I encountered an error while uploading and analyzing your document. ${error instanceof Error ? `Error: ${error.message}` : ''} Please try again or contact support if the issue persists.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window && isSpeaking) {
      speechSynthesis.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(selectedLanguage);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        // Speech finished
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const getLanguageCode = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN', 
      'es': 'es-ES',
      'fr': 'fr-FR'
    };
    return languageMap[lang] || 'en-US';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">AI Doctor - 3D Virtual Consultation</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Models Section */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  3D Anatomical Models
                </CardTitle>
                <CardDescription>
                  Interactive medical visualization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 3D Anatomical Model Display */}
                {currentAnatomicalModel ? (
                  <AnatomicalModel 
                    modelId={currentAnatomicalModel}
                    className="w-full"
                  />
                ) : (
                  <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 overflow-hidden flex items-center justify-center">
                    <div className="text-center p-6">
                      <Stethoscope className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">3D Model Display</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Ask about a specific body part or health condition to see relevant anatomical models
                      </p>
                      <div className="mt-4 text-xs text-gray-400">
                        Try asking about: heart, lungs, brain, eyes, digestive system, etc.
                      </div>
                    </div>
                  </div>
                )}

                {/* Model Status */}
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    AI Enhanced Consultation
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    3D models powered by Gemini AI analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Medical Consultation
                </CardTitle>
                <CardDescription>
                  Discuss your health concerns with AI-powered medical assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language & Controls */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Language:</span>
                      <select 
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSpeaking}
                      className="text-xs"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                      {isSpeaking ? 'Mute' : 'Voice'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isListening ? stopListening : startListening}
                      disabled={!speechRecognition.current}
                      className="text-xs"
                    >
                      {isListening ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                      {isListening ? 'Stop' : 'Talk'}
                    </Button>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Upload Medical Documents:</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload medical reports, prescriptions, X-rays, or lab results
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="medical-file-upload"
                        disabled={isLoading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('medical-file-upload')?.click()}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Choose File
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Supported: PDF, Images (JPG, PNG), Word documents
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Questions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick Questions:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickQuestions.slice(0, 4).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickQuestion(question)}
                        className="text-left justify-start h-auto p-2 text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1 flex-shrink-0" />
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-4 bg-white">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-3">
                      {/* Regular Chat Message */}
                      <div
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {message.role === 'doctor' && (
                              <Stethoscope className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                            )}
                            {message.role === 'user' && (
                              <User className="w-4 h-4 text-blue-100 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString()}
                                {message.analyzed && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    <Brain className="w-2 h-2 mr-1" />
                                    AI Analyzed
                                  </Badge>
                                )}
                                {message.bodyPart && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    <Heart className="w-2 h-2 mr-1" />
                                    {message.bodyPart}
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Structured Response (only for doctor messages with structured data) */}
                      {message.role === 'doctor' && message.structured && (
                        <div className="ml-4">
                          <StructuredHealthResponse data={message.structured} />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-500" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Health Context Display */}
                {currentVitals && (
                  <Alert>
                    <Heart className="h-4 w-4" />
                    <AlertDescription>
                      Current Health Context: HR {currentVitals.heartRate} BPM, 
                      BP {currentVitals.bloodPressureSystolic}/{currentVitals.bloodPressureDiastolic}, 
                      SpO₂ {currentVitals.oxygenSaturation}%, 
                      Temp {currentVitals.bodyTemperature}°F
                    </AlertDescription>
                  </Alert>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your health question or concern..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Disclaimer */}
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Medical Disclaimer:</strong> This AI assistant provides general health information 
                    and should not replace professional medical advice, diagnosis, or treatment. Always consult 
                    with qualified healthcare professionals for medical concerns.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}