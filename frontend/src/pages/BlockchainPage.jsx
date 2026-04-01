/**
 * BlockchainPage.jsx
 * Admin dashboard page for blockchain transaction visualization
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BlockchainTransactionVisualization from '../components/BlockchainTransactionVisualization';
import useBlockchainTransactions from '../hooks/useBlockchainTransactions';

export default function BlockchainPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { transactions, blocks, loading, error, refetch } = useBlockchainTransactions(
    '/api/blockchain/transactions/',
    autoRefresh,
    5000
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Blockchain Transactions
          </h1>
          <div className="flex gap-4">
            <button
              onClick={refetch}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-semibold transition"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                autoRefresh
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>
          </div>
        </div>
        <p className="text-slate-300">
          View and monitor all blockchain transactions related to attendance records
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg"
        >
          <p className="text-red-100">
            <span className="font-bold">Error:</span> {error}
          </p>
          <p className="text-red-200 text-sm mt-1">
            Using mock data for demonstration purposes
          </p>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-4 gap-4 mb-8"
      >
        {[
          {
            label: 'Total Transactions',
            value: transactions.length,
            color: 'from-blue-500 to-blue-600',
            icon: '📊',
          },
          {
            label: 'Confirmed',
            value: transactions.filter((t) => t.status === 'confirmed').length,
            color: 'from-green-500 to-green-600',
            icon: '✓',
          },
          {
            label: 'Pending',
            value: transactions.filter((t) => t.status === 'pending').length,
            color: 'from-yellow-500 to-yellow-600',
            icon: '⏳',
          },
          {
            label: 'Failed',
            value: transactions.filter((t) => t.status === 'failed').length,
            color: 'from-red-500 to-red-600',
            icon: '✗',
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * idx }}
            className={`p-4 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-sm text-white/80">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <BlockchainTransactionVisualization
          transactions={transactions}
          blocks={blocks}
          loading={loading}
        />
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-slate-800 rounded-lg p-6 border border-slate-700"
      >
        <h2 className="text-xl font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-2xl mb-2">⛓️</div>
            <h3 className="font-semibold mb-2">Smart Contracts</h3>
            <p className="text-slate-300 text-sm">
              Attendance records are stored on the blockchain using Ethereum smart contracts.
            </p>
          </div>
          <div>
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold mb-2">Real-Time Sync</h3>
            <p className="text-slate-300 text-sm">
              Transactions are automatically synced from the blockchain and displayed here.
            </p>
          </div>
          <div>
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold mb-2">Immutable Records</h3>
            <p className="text-slate-300 text-sm">
              All attendance records are immutable and permanently recorded on-chain.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 text-center text-slate-400 text-sm"
      >
        Auto-refresh: {autoRefresh ? 'Enabled (every 5s)' : 'Disabled'}
      </motion.div>
    </div>
  );
}
