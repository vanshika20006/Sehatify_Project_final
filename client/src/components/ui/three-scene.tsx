import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface ThreeSceneProps {
  className?: string;
  isVisible?: boolean;
  animationState?: 'idle' | 'listening' | 'thinking' | 'speaking';
  onInteraction?: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'start' | 'end' | 'soundstart' | 'soundend', listener: (event: Event) => void): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function ThreeScene({ 
  className = "", 
  isVisible = true, 
  animationState = 'idle',
  onInteraction
}: ThreeSceneProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.addEventListener('start', () => {
      setIsListening(true);
    });

    recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      processUserInput(transcript);
    });

    recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    });

    recognition.addEventListener('end', () => {
      setIsListening(false);
    });

    recognition.start();
  };

  const processUserInput = async (input: string) => {
    // Enhanced AI responses for medical consultation queries
    let aiResponse = '';
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('feeling tired') || lowerInput.includes('fatigue') || lowerInput.includes('tired lately')) {
      aiResponse = "Fatigue can have several causes: insufficient sleep (aim for 7-9 hours), poor nutrition, dehydration, stress, or underlying conditions like anemia or thyroid issues. I recommend maintaining a regular sleep schedule, eating balanced meals, staying hydrated, and if fatigue persists for more than 2 weeks, consult your healthcare provider for proper evaluation.";
    } else if (lowerInput.includes('blood pressure') || lowerInput.includes('high blood pressure') || lowerInput.includes('bp readings')) {
      aiResponse = "High blood pressure readings can be concerning. Normal BP is typically below 120/80 mmHg. If your readings are consistently above 130/80, this may indicate hypertension. Immediate steps: reduce sodium intake, exercise regularly, manage stress, and avoid smoking. However, it's crucial to consult your doctor for proper evaluation and possible medication if needed.";
    } else if (lowerInput.includes('exercises for heart') || lowerInput.includes('heart health') || lowerInput.includes('cardiovascular')) {
      aiResponse = "Excellent heart-healthy exercises include: brisk walking (30 min daily), swimming, cycling, and strength training 2-3 times weekly. Start with moderate intensity - you should be able to talk while exercising. Gradually increase duration and intensity. Also important: maintain healthy weight, eat heart-healthy foods, and avoid smoking.";
    } else if (lowerInput.includes('headache') || lowerInput.includes('head pain')) {
      aiResponse = "For headache relief: ensure adequate hydration, rest in a quiet dark room, apply cold/warm compress, and consider gentle neck stretches. Common triggers include stress, dehydration, eye strain, and irregular sleep. If headaches are severe, frequent, or accompanied by vision changes, nausea, or fever, seek immediate medical attention.";
    } else if (lowerInput.includes('diet') || lowerInput.includes('food') || lowerInput.includes('nutrition')) {
      aiResponse = "For optimal health, focus on whole foods: plenty of vegetables, fruits, lean proteins, and whole grains. Limit processed foods, sugar, and excess sodium. Stay hydrated with water throughout the day.";
    } else if (lowerInput.includes('exercise') || lowerInput.includes('workout') || lowerInput.includes('fitness')) {
      aiResponse = "Regular exercise is crucial for health. Aim for at least 150 minutes of moderate aerobic activity weekly, plus strength training twice a week. Start slowly and gradually increase intensity.";
    } else if (lowerInput.includes('sleep') || lowerInput.includes('rest')) {
      aiResponse = "Quality sleep is vital for health. Adults need 7-9 hours nightly. Maintain a consistent sleep schedule, create a dark, cool environment, and avoid screens before bedtime.";
    } else if (lowerInput.includes('stress') || lowerInput.includes('anxiety')) {
      aiResponse = "Managing stress is important for overall health. Try deep breathing, meditation, regular exercise, and maintaining social connections. If stress persists, consider speaking with a healthcare professional.";
    } else {
      aiResponse = "I'm here to provide medical guidance and answer your health questions. Please describe your symptoms or health concerns, and I'll do my best to help. Remember, for serious symptoms or persistent issues, always consult with a qualified healthcare professional.";
    }

    setResponse(aiResponse);
    speakResponse(aiResponse);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`${className} relative`}>
      {/* Sketchfab 3D Doctor Embed */}
      <div className="w-full h-full bg-gradient-to-br from-blue-50/30 to-white rounded-lg border border-blue-100 overflow-hidden">
        <div className="sketchfab-embed-wrapper h-full"> 
          <iframe 
            title="Doctor - Sketchfab Weekly - 13 Mar'23" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; fullscreen; xr-spatial-tracking" 
            src="https://sketchfab.com/models/9c89a438a5e940e59a0f9a07c22d6ade/embed?ui_theme=dark"
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          /> 
          <p style={{ fontSize: '13px', fontWeight: 'normal', margin: '5px', color: '#4A4A4A' }}> 
            <a 
              href="https://sketchfab.com/3d-models/doctor-sketchfab-weekly-13-mar23-9c89a438a5e940e59a0f9a07c22d6ade?utm_medium=embed&utm_campaign=share-popup&utm_content=9c89a438a5e940e59a0f9a07c22d6ade" 
              target="_blank" 
              rel="nofollow noopener noreferrer" 
              style={{ fontWeight: 'bold', color: '#1CAAD9' }}
            > 
              Doctor - Sketchfab Weekly - 13 Mar'23 
            </a> by <a 
              href="https://sketchfab.com/BrushDip?utm_medium=embed&utm_campaign=share-popup&utm_content=9c89a438a5e940e59a0f9a07c22d6ade" 
              target="_blank" 
              rel="nofollow noopener noreferrer" 
              style={{ fontWeight: 'bold', color: '#1CAAD9' }}
            > 
              BrushDip 
            </a> on <a 
              href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=9c89a438a5e940e59a0f9a07c22d6ade" 
              target="_blank" 
              rel="nofollow noopener noreferrer" 
              style={{ fontWeight: 'bold', color: '#1CAAD9' }}
            >
              Sketchfab
            </a>
          </p>
        </div>
      </div>

      {/* Medical Consultation Interface */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">Medical Consultation</h3>
            <p className="text-xs text-gray-600">Discuss your health concerns with AI-powered medical assistance</p>
          </div>
          <div className="flex gap-2 items-center">
            <select className="text-xs px-2 py-1 border rounded">
              <option value="en">English</option>
            </select>
            <Button
              onClick={isListening ? undefined : startListening}
              disabled={isListening}
              variant={isListening ? "default" : "outline"}
              size="sm"
              className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              Voice
            </Button>
            <Button
              onClick={isSpeaking ? stopSpeaking : undefined}
              disabled={!isSpeaking}
              variant={isSpeaking ? "default" : "outline"}
              size="sm"
              className={isSpeaking ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              Talk
            </Button>
          </div>
        </div>

        {!transcript && !response && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Hello! I'm Dr. AI, your personal 3D virtual health assistant. I'm here to help you with health questions, analyze your symptoms, and provide medical guidance.
              </p>
              <p className="text-sm text-blue-700">
                How are you feeling today? Is there anything specific about your health you'd like to discuss?
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-2 text-sm">Quick Questions:</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => processUserInput("I'm feeling tired lately, what could be causing this?")}
                  className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  I'm feeling tired lately, what could be causing this?
                </button>
                <button 
                  onClick={() => processUserInput("My blood pressure readings seem high, should I be concerned?")}
                  className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  My blood pressure readings seem high, should I be concerned?
                </button>
                <button 
                  onClick={() => processUserInput("What are some good exercises for heart health?")}
                  className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  What are some good exercises for heart health?
                </button>
                <button 
                  onClick={() => processUserInput("I have a headache, what might help?")}
                  className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  I have a headache, what might help?
                </button>
              </div>
            </div>
          </div>
        )}
        
        {transcript && (
          <div className="mb-2 p-2 bg-gray-100 rounded text-sm">
            <strong>You:</strong> {transcript}
          </div>
        )}
        
        {response && (
          <div className="p-2 bg-blue-50 rounded text-sm">
            <strong>Dr. AI:</strong> {response}
          </div>
        )}
      </div>

      {/* Status Indicators */}
      {animationState === 'listening' && (
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          Listening...
        </div>
      )}
      
      {animationState === 'thinking' && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          Thinking...
        </div>
      )}
      
      {animationState === 'speaking' && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          Speaking...
        </div>
      )}
    </div>
  );
}