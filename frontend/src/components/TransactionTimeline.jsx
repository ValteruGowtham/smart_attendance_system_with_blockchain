/**
 * TransactionTimeline.jsx
 * Displays transactions in a vertical timeline format
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClipboardList } from 'react-icons/hi';

const TransactionTimeline = ({ transactions = [], onSelectTransaction, selectedTransaction }) => {
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.created_at || 0);
    const dateB = new Date(b.timestamp || b.created_at || 0);
    return dateB - dateA;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <HiOutlineCheckCircle className="w-6 h-6 text-green-400" />;
      case 'pending':
        return <HiOutlineClipboardList className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 'failed':
        return <HiOutlineXCircle className="w-6 h-6 text-red-400" />;
      default:
        return <HiOutlineClipboardList className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    if (hash.length <= 20) return hash;
    return `${hash.slice(0, 10)}...${hash.slice(-10)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="relative">
      {/* Timeline Track */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500" />

      {/* Transactions */}
      <div className="space-y-4">
        {sortedTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.tx_hash || transaction.transaction_hash || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectTransaction(transaction)}
            className="cursor-pointer group"
          >
            <div className="flex gap-4 relative">
              {/* Timeline Node */}
              <motion.div
                whileHover={{ scale: 1.2 }}
                className={`flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 border-2 flex items-center justify-center z-10 transition-all ${
                  selectedTransaction?.tx_hash === transaction.tx_hash ||
                  selectedTransaction?.transaction_hash === transaction.transaction_hash
                    ? 'border-blue-400 shadow-lg shadow-blue-500/50'
                    : 'border-slate-600 group-hover:border-blue-400'
                }`}
              >
                {getStatusIcon(transaction.status)}
              </motion.div>

              {/* Content */}
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex-1 rounded-lg border p-4 transition-all ${getStatusBgColor(
                  transaction.status
                )} ${
                  selectedTransaction?.tx_hash === transaction.tx_hash ||
                  selectedTransaction?.transaction_hash === transaction.transaction_hash
                    ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900'
                    : 'hover:border-slate-400'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`font-mono text-sm font-bold ${getStatusTextColor(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {formatDate(transaction.timestamp || transaction.created_at)}
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-slate-700 px-2 py-1 rounded text-slate-300">
                    Block #{transaction.block_number || 'N/A'}
                  </span>
                </div>

                {/* Transaction Hash */}
                <div className="mb-2">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Transaction Hash</p>
                  <p className="font-mono text-sm text-blue-300 hover:text-blue-200 break-all mt-1">
                    {formatHash(transaction.tx_hash || transaction.transaction_hash)}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-slate-600">
                  {transaction.student_name && (
                    <>
                      <div>
                        <p className="text-slate-500">Student</p>
                        <p className="text-slate-200 font-medium">{transaction.student_name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Reg. ID</p>
                        <p className="text-slate-200 font-medium font-mono">
                          {transaction.student_id || 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                  {transaction.gas_used && (
                    <div>
                      <p className="text-slate-500">Gas Used</p>
                      <p className="text-slate-200 font-medium">{transaction.gas_used.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Click Hint */}
                <p className="text-xs text-slate-500 mt-3 group-hover:text-slate-300 transition-colors">
                  Click to view details →
                </p>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TransactionTimeline;
