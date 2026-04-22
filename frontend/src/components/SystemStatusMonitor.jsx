/**
 * SystemStatusMonitor.jsx
 * Displays status of network, camera, and blockchain
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineWifiIcon,
  HiOutlineCamera,
  HiOutlineLink,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { useNetworkStatus, useCameraPermission, useBlockchainStatus } from '../context/ErrorContext';

const SystemStatusMonitor = ({ showDetails = false }) => {
  const networkStatus = useNetworkStatus();
  const { permission: cameraPermission, isChecking: cameraChecking } = useCameraPermission();
  const { status: blockchainStatus } = useBlockchainStatus();
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const statusIndicators = [
    {
      name: 'Network',
      icon: HiOutlineWifiIcon,
      status: networkStatus === 'online' ? 'good' : 'bad',
      label: networkStatus === 'online' ? 'Connected' : 'Offline',
      details: networkStatus === 'online' ? 'Your internet connection is stable' : 'No internet connection',
    },
    {
      name: 'Camera',
      icon: HiOutlineCamera,
      status: cameraPermission === 'granted' ? 'good' : cameraPermission === 'denied' ? 'bad' : 'warning',
      label:
        cameraPermission === 'granted' ? 'Ready' : cameraPermission === 'denied' ? 'Disabled' : 'Checking...',
      details:
        cameraPermission === 'granted'
          ? 'Camera access granted'
          : cameraPermission === 'denied'
          ? 'Camera permission required'
          : 'Checking camera permission...',
    },
    {
      name: 'Blockchain',
      icon: HiOutlineLink,
      status: blockchainStatus.isConnected ? 'good' : 'bad',
      label: blockchainStatus.isConnected ? 'Connected' : 'Disconnected',
      details: blockchainStatus.isConnected
        ? `${blockchainStatus.pendingTransactions} pending`
        : blockchainStatus.error,
    },
  ];

  const getStatusIcon = (status) => {
    if (status === 'good') return HiOutlineCheckCircle;
    if (status === 'bad') return HiOutlineXCircle;
    return HiOutlineExclamationCircle;
  };

  const getStatusColor = (status) => {
    if (status === 'good') return 'text-green-400';
    if (status === 'bad') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getStatusBg = (status) => {
    if (status === 'good') return 'bg-green-900/20';
    if (status === 'bad') return 'bg-red-900/20';
    return 'bg-yellow-900/20';
  };

  const allGood = statusIndicators.every((s) => s.status === 'good');

  // Compact view
  if (!isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-40 transition-all ${
          allGood ? 'bg-green-900/50 hover:bg-green-900/70' : 'bg-red-900/50 hover:bg-red-900/70 animate-pulse'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="System Status"
      >
        {allGood ? (
          <HiOutlineCheckCircle className="h-5 w-5 text-green-400" />
        ) : (
          <HiOutlineExclamationCircle className="h-5 w-5 text-red-400" />
        )}
      </motion.button>
    );
  }

  // Expanded view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 w-80 max-h-96 z-50 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3 }}>
            {allGood ? (
              <HiOutlineCheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <HiOutlineExclamationCircle className="h-5 w-5 text-yellow-400" />
            )}
          </motion.div>
          System Status
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Status items */}
      <div className="p-4 space-y-3 overflow-y-auto max-h-80">
        {statusIndicators.map((indicator, index) => {
          const Icon = indicator.icon;
          const StatusIcon = getStatusIcon(indicator.status);

          return (
            <motion.div
              key={indicator.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border ${getStatusBg(indicator.status)} border-slate-600`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{indicator.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{indicator.details}</p>
                </div>
                <StatusIcon className={`h-5 w-5 flex-shrink-0 ${getStatusColor(indicator.status)}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      {blockchainStatus.pendingTransactions > 0 && (
        <motion.div
          className="p-4 bg-blue-900/20 border-t border-blue-700/50 text-xs text-blue-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-semibold mb-1">⏳ Pending Blockchain Operations</p>
          <p>
            {blockchainStatus.pendingTransactions} transaction{blockchainStatus.pendingTransactions !== 1 ? 's' : ''} will
            be recorded when blockchain is fully synced.
          </p>
        </motion.div>
      )}

      {blockchainStatus.failedTransactions > 0 && (
        <motion.div
          className="p-4 bg-orange-900/20 border-t border-orange-700/50 text-xs text-orange-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-semibold mb-1">⚠️ Retrying Failed Operations</p>
          <p>
            {blockchainStatus.failedTransactions} transaction{blockchainStatus.failedTransactions !== 1 ? 's' : ''} will
            retry shortly.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SystemStatusMonitor;
