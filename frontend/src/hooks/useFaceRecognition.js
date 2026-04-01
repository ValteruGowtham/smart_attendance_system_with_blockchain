// src/hooks/useFaceRecognition.js
import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for face recognition features
 * Handles camera access and image capture
 */
export const useFaceRecognition = () => {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied'
        : 'Failed to access camera';
      setError(errorMsg);
      console.error('Camera access error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Video or canvas element not found');
      return null;
    }

    try {
      const context = canvasRef.current.getContext('2d');
      const video = videoRef.current;

      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;

      context.drawImage(video, 0, 0);
      return canvasRef.current.toBlob(blob => blob, 'image/jpeg', 0.95);
    } catch (err) {
      setError('Failed to capture frame');
      console.error('Capture error:', err);
      return null;
    }
  }, []);

  return {
    stream,
    loading,
    error,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureFrame,
  };
};

export default useFaceRecognition;
