/**
 * CameraErrorHandler.jsx
 * Specific error handling for camera and face detection issues
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlineExclamationCircle,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowPath,
  HiOutlineXMark,
} from 'react-icons/hi2';

const CameraErrorHandler = ({ error, onRetry, onManualEntry }) => {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  if (!error) return null;

  const errorType = error.error_type || error.type;

  // Troubleshooting steps based on error type
  const getTroubleshootingSteps = () => {
    switch (errorType) {
      case 'camera_not_available':
      case 'camera_initialization_failed':
        return [
          { step: 1, title: 'Check Camera Connection', desc: 'Ensure your camera is properly connected to your device' },
          { step: 2, title: 'Refresh Page', desc: 'Try reloading the page to reinitialize the camera' },
          { step: 3, title: 'Check Other Apps', desc: 'Close other apps using the camera (Zoom, Skype, etc.)' },
          { step: 4, title: 'Restart Browser', desc: 'Close and reopen your browser completely' },
        ];

      case 'camera_permission_denied':
        return [
          { step: 1, title: 'Allow Camera Access', desc: 'Click the permission dialog and select "Allow"' },
          { step: 2, title: 'Check Browser Settings', desc: 'Settings → Privacy → Camera → Enable for this site' },
          { step: 3, title: 'Check OS Settings', desc: 'Ensure your OS allows camera access for the browser' },
          { step: 4, title: 'Refresh Page', desc: 'Reload the page after enabling permissions' },
        ];

      case 'multiple_faces_detected':
        return [
          { step: 1, title: 'Clear the Area', desc: 'Ensure no one else is visible in the camera frame' },
          { step: 2, title: 'Check Mirror', desc: 'Remove any mirrors that might reflect faces' },
          { step: 3, title: 'Adjust Camera Angle', desc: 'Point camera directly at your face only' },
          { step: 4, title: 'Retry Capture', desc: 'Take another photo or video capture' },
        ];

      case 'no_face_detected':
        return [
          { step: 1, title: 'Improve Lighting', desc: 'Ensure you have adequate lighting from the front' },
          { step: 2, title: 'Face Camera', desc: 'Look directly at the camera' },
          { step: 3, title: 'Remove Obstructions', desc: 'Remove hat, sunglasses, or other face coverings' },
          { step: 4, title: 'Move Closer', desc: 'Move your face closer to the camera' },
        ];

      case 'face_not_recognized':
      case 'unclear_face':
        return [
          { step: 1, title: 'Better Lighting', desc: 'Ensure even lighting - avoid harsh shadows' },
          { step: 2, title: 'Clear View', desc: 'Ensure your entire face is clearly visible' },
          { step: 3, title: 'Remove Accessories', desc: 'Remove glasses, masks, heavy makeup if possible' },
          { step: 4, title: 'Retry with Best Photo', desc: 'Take another clear, well-lit photo' },
        ];

      default:
        return [];
    }
  };

  const steps = getTroubleshootingSteps();
  const canManualEntry = error?.fallback_possible ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-red-700/50 shadow-2xl"
    >
      {/* Error Header */}
      <div className="flex items-start gap-4 mb-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <HiOutlineExclamationCircle className="h-8 w-8 text-red-400 flex-shrink-0" />
        </motion.div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">{error.title || 'Camera Error'}</h2>
          <p className="text-sm text-slate-300 mt-1">{error.message || error.user_message}</p>
        </div>
      </div>

      {/* Error Details */}
      {error?.details?.recommendation && (
        <div className="mb-6 p-3 rounded-lg bg-orange-900/20 border border-orange-700/50">
          <p className="text-sm text-orange-100">
            <span className="font-semibold">💡 Suggestion: </span>
            {error.details.recommendation}
          </p>
        </div>
      )}

      {/* Troubleshooting Section */}
      {steps.length > 0 && (
        <motion.div className="mb-6">
          <button
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-white font-medium"
          >
            <span className="flex items-center gap-2">
              <HiOutlineQuestionMarkCircle className="h-5 w-5" />
              Troubleshooting Steps
            </span>
            <motion.div
              animate={{ rotate: showTroubleshooting ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▼
            </motion.div>
          </button>

          {showTroubleshooting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 space-y-3 pl-3"
            >
              {steps.map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: item.step * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/50 flex items-center justify-center text-xs font-bold text-blue-100">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Retry Button */}
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <HiOutlineArrowPath className="h-5 w-5" />
            Try Again
          </motion.button>
        )}

        {/* Manual Entry Fallback */}
        {canManualEntry && onManualEntry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onManualEntry}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
          >
            Use Manual Entry
          </motion.button>
        )}

        {/* Contact Support */}
        <button
          className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors py-2"
        >
          📧 Still having issues? Contact support
        </button>
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-3 rounded-lg bg-blue-900/20 border border-blue-700/50">
        <p className="text-xs text-blue-100">
          <span className="font-semibold">ℹ️ Note: </span>
          Ensure you have a stable internet connection. Face recognition works best in bright, even lighting.
        </p>
      </div>
    </motion.div>
  );
};

export default CameraErrorHandler;
