import React from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebRTC } from '@/hooks/use-webrtc';

interface VideoCallProps {
  onEndCall?: () => void;
  mentorName?: string;
  roomId?: string;
}

export function VideoCall({ onEndCall, mentorName = 'Mental Health Mentor', roomId }: VideoCallProps) {
  const {
    callState,
    myVideoRef,
    remoteVideoRef,
    startVideoCall,
    startAudioCall,
    endCall,
    toggleMic,
    toggleVideo,
    answerCall,
    incomingCall,
    callerName
  } = useWebRTC({ roomId });

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    endCall();
    onEndCall?.();
  };

  // Incoming call interface
  if (incomingCall) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Incoming Call</h3>
            <p className="text-gray-600">{callerName || mentorName} is calling...</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={answerCall} className="bg-green-500 hover:bg-green-600 text-white">
              <Phone className="w-4 h-4 mr-2" />
              Answer
            </Button>
            <Button onClick={handleEndCall} variant="destructive">
              <PhoneOff className="w-4 h-4 mr-2" />
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Call controls interface
  if (!callState.isCallActive && !callState.isConnecting) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect with {mentorName}</h3>
            <p className="text-gray-600 mb-4">Start a voice or video call for personalized support</p>
          </div>

          {callState.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{callState.error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={startVideoCall} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={callState.isConnecting}
            >
              <Video className="w-4 h-4 mr-2" />
              Start Video Call
            </Button>
            <Button 
              onClick={startAudioCall} 
              variant="outline" 
              className="w-full"
              disabled={callState.isConnecting}
            >
              <Phone className="w-4 h-4 mr-2" />
              Start Voice Call
            </Button>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Calls are secure and confidential</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active call interface
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        {/* Call status header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              {callState.isConnecting ? 'Connecting...' : 'Connected'}
            </Badge>
            <span className="text-sm font-medium">{mentorName}</span>
          </div>
          <div className="text-sm text-gray-600">
            {formatCallDuration(callState.callDuration)}
          </div>
        </div>

        {/* Video containers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* My video */}
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {callState.isVideoCall ? (
                <video
                  ref={myVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mic className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                You
              </div>
              {callState.isVideoMuted && callState.isVideoCall && (
                <div className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded">
                  <VideoOff className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Remote video */}
          <div className="relative">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {callState.isVideoCall ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mic className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {mentorName}
              </div>
            </div>
          </div>
        </div>

        {/* Call controls */}
        <div className="flex justify-center space-x-4">
          {callState.isVideoCall && (
            <Button
              onClick={toggleVideo}
              variant={callState.isVideoMuted ? "destructive" : "outline"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
            >
              {callState.isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
          )}
          
          <Button
            onClick={toggleMic}
            variant={callState.isMicMuted ? "destructive" : "outline"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            {callState.isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Button
            onClick={handleEndCall}
            variant="destructive"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>

        {/* Call info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>End-to-end encrypted • Anonymous • Confidential</p>
        </div>
      </CardContent>
    </Card>
  );
}