import { useState, useRef, useEffect, useCallback } from 'react';
import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';

interface UseWebRTCProps {
  roomId?: string;
}

interface CallState {
  isCallActive: boolean;
  isVideoCall: boolean;
  isAudioCall: boolean;
  isMicMuted: boolean;
  isVideoMuted: boolean;
  callDuration: number;
  isConnecting: boolean;
  error: string | null;
}

interface UseWebRTCReturn {
  callState: CallState;
  myVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  startVideoCall: () => void;
  startAudioCall: () => void;
  endCall: () => void;
  toggleMic: () => void;
  toggleVideo: () => void;
  answerCall: () => void;
  incomingCall: boolean;
  callerName: string;
}

export function useWebRTC({ roomId }: UseWebRTCProps = {}): UseWebRTCReturn {
  const [callState, setCallState] = useState<CallState>({
    isCallActive: false,
    isVideoCall: false,
    isAudioCall: false,
    isMicMuted: false,
    isVideoMuted: false,
    callDuration: 0,
    isConnecting: false,
    error: null
  });

  const [incomingCall, setIncomingCall] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);
  const callDurationRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // For development, we'll simulate the signaling without an actual server
    // In production, you would connect to your WebSocket server
    console.log('WebRTC initialized for room:', roomId);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  const getMediaStream = useCallback(async (video: boolean, audio: boolean = true) => {
    try {
      setCallState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      const constraints = {
        video: video ? { width: 640, height: 480 } : false,
        audio: audio
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream;
      }

      setCallState(prev => ({ 
        ...prev, 
        isConnecting: false,
        isCallActive: true,
        isVideoCall: video,
        isAudioCall: !video
      }));

      return mediaStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCallState(prev => ({ 
        ...prev, 
        isConnecting: false,
        error: 'Unable to access camera/microphone. Please check permissions.'
      }));
      throw error;
    }
  }, []);

  const createPeerConnection = useCallback((isInitiator: boolean, mediaStream: MediaStream) => {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: mediaStream
    });

    peer.on('signal', (data: any) => {
      // In a real implementation, send this signal data through your signaling server
      console.log('Peer signal:', data);
    });

    peer.on('stream', (remoteStream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    peer.on('connect', () => {
      console.log('Peer connected');
      startCallTimer();
    });

    peer.on('error', (error: Error) => {
      console.error('Peer error:', error);
      setCallState(prev => ({ ...prev, error: 'Connection failed' }));
    });

    peerRef.current = peer;
    return peer;
  }, []);

  const startCallTimer = useCallback(() => {
    if (callDurationRef.current) {
      clearInterval(callDurationRef.current);
    }

    const startTime = Date.now();
    callDurationRef.current = setInterval(() => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      setCallState(prev => ({ ...prev, callDuration: duration }));
    }, 1000);
  }, []);

  const startVideoCall = useCallback(async () => {
    try {
      const mediaStream = await getMediaStream(true, true);
      createPeerConnection(true, mediaStream);
    } catch (error) {
      console.error('Failed to start video call:', error);
    }
  }, [getMediaStream, createPeerConnection]);

  const startAudioCall = useCallback(async () => {
    try {
      const mediaStream = await getMediaStream(false, true);
      createPeerConnection(true, mediaStream);
    } catch (error) {
      console.error('Failed to start audio call:', error);
    }
  }, [getMediaStream, createPeerConnection]);

  const answerCall = useCallback(async () => {
    try {
      const mediaStream = await getMediaStream(callState.isVideoCall, true);
      createPeerConnection(false, mediaStream);
      setIncomingCall(false);
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  }, [getMediaStream, createPeerConnection, callState.isVideoCall]);

  const endCall = useCallback(() => {
    // Clean up peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Stop media stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    // Clear video elements
    if (myVideoRef.current) {
      myVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Clear call timer
    if (callDurationRef.current) {
      clearInterval(callDurationRef.current);
      callDurationRef.current = null;
    }

    // Reset state
    setCallState({
      isCallActive: false,
      isVideoCall: false,
      isAudioCall: false,
      isMicMuted: false,
      isVideoMuted: false,
      callDuration: 0,
      isConnecting: false,
      error: null
    });

    setIncomingCall(false);
    setCallerName('');
  }, [stream]);

  const toggleMic = useCallback(() => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isMicMuted: !audioTrack.enabled }));
      }
    }
  }, [stream]);

  const toggleVideo = useCallback(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, isVideoMuted: !videoTrack.enabled }));
      }
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
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
  };
}