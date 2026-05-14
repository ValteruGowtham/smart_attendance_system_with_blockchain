/**
 * BlockchainTransactionVisualization.jsx
 * Main component for displaying blockchain transactions
 * Supports timeline and graph views
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCube, HiOutlineLink, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import TransactionTimeline from './TransactionTimeline';
import BlockchainGraph from './BlockchainGraph';
import TransactionDetails from './TransactionDetails';

const BlockchainTransactionVisualization = ({ transactions = [], blocks = [], loading = false }) => {
  const [viewType, setViewType] = useState('timeline');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    filterTransactions();
  }, [transactions, statusFilter]);

  const filterTransactions = () => {
    if (statusFilter === 'all') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(tx => tx.status === statusFilter)
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const stats = {
    total: transactions.length,
    confirmed: transactions.filter(tx => tx.status === 'confirmed').length,
    pending: transactions.filter(tx => tx.status === 'pending').length,
    failed: transactions.filter(tx => tx.status === 'failed').length,
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <HiOutlineCube className="w-8 h-8 text-blue-400" />
            Blockchain Transactions
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time transaction visualization and analysis
          </p>
        </div>
        <motion.div
          animate={{ rotate: autoRefresh ? 360 : 0 }}
          transition={{ duration: 2, repeat: autoRefresh ? Infinity : 0 }}
          className="cursor-pointer"
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          <HiOutlineLink className={`w-8 h-8 ${autoRefresh ? 'text-green-400' : 'text-slate-400'}`} />
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total', value: stats.total, color: 'from-blue-600 to-blue-400' },
          { label: 'Confirmed', value: stats.confirmed, color: 'from-green-600 to-green-400' },
          { label: 'Pending', value: stats.pending, color: 'from-yellow-600 to-yellow-400' },
          { label: 'Failed', value: stats.failed, color: 'from-red-600 to-red-400' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className={`bg-gradient-to-br ${stat.color} rounded-lg p-4 text-white shadow-lg`}
          >
            <p className="text-sm font-medium opacity-90">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* View Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4 flex-wrap"
      >
        <div className="flex gap-2 bg-slate-700 rounded-lg p-1">
          {['timeline', 'graph'].map((view) => (
            <button
              key={view}
              onClick={() => setViewType(view)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                viewType === view
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)} View
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'confirmed', 'pending', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all border ${
                statusFilter === status
                  ? getStatusColor(status)
                  : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <HiOutlineEye className="w-12 h-12 mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400 text-lg">
            No transactions found
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Transactions will appear here when blockchain records are created
          </p>
        </motion.div>
      )}

      {/* Content Area */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {viewType === 'timeline' ? (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TransactionTimeline
                  transactions={filteredTransactions}
                  onSelectTransaction={setSelectedTransaction}
                  selectedTransaction={selectedTransaction}
                />
              </motion.div>
            ) : (
              <motion.div
                key="graph"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BlockchainGraph
                  transactions={filteredTransactions}
                  blocks={blocks}
                  onSelectTransaction={setSelectedTransaction}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transaction Details Panel */}
          <AnimatePresence>
            {selectedTransaction && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <TransactionDetails
                  transaction={selectedTransaction}
                  onClose={() => setSelectedTransaction(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default BlockchainTransactionVisualization;
