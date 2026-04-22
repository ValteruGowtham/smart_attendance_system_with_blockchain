/**
 * TransactionDetails.jsx
 * Displays detailed information about a blockchain transaction
 */

import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineX, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';

const TransactionDetails = ({ transaction, onClose }) => {
  const formatHash = (hash, full = false) => {
    if (!hash) return 'N/A';
    if (full) return hash;
    if (hash.length <= 32) return hash;
    return `${hash.slice(0, 16)}...${hash.slice(-16)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <HiOutlineCheckCircle className="w-6 h-6 text-green-400" />;
      case 'pending':
        return <HiOutlineClock className="w-6 h-6 text-yellow-400" />;
      case 'failed':
        return <HiOutlineXCircle className="w-6 h-6 text-red-400" />;
      default:
        return <HiOutlineClock className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusGradient = (status) => {
    switch (status) {
      case 'confirmed':
        return 'from-green-600 to-green-500';
      case 'pending':
        return 'from-yellow-600 to-yellow-500';
      case 'failed':
        return 'from-red-600 to-red-500';
      default:
        return 'from-slate-600 to-slate-500';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const transactionFields = [
    { label: 'Transaction Hash', value: transaction.tx_hash || transaction.transaction_hash },
    { label: 'Status', value: transaction.status },
    { label: 'Block Number', value: transaction.block_number || 'Pending' },
    { label: 'From Address', value: transaction.from || 'N/A' },
    { label: 'To Address', value: transaction.to || 'Contract' },
    { label: 'Gas Used', value: transaction.gas_used ? `${transaction.gas_used.toLocaleString()} gas` : 'N/A' },
    { label: 'Gas Price', value: transaction.gas_price ? `${transaction.gas_price} wei` : 'N/A' },
    { label: 'Value', value: transaction.value ? `${transaction.value} ETH` : '0 ETH' },
    { label: 'Confirmations', value: transaction.confirmations || '0' },
  ];

  const attendanceFields = [
    { label: 'Student Name', value: transaction.student_name },
    { label: 'Student ID', value: transaction.student_id || transaction.registration_id },
    { label: 'Course', value: transaction.course_name || transaction.course_id },
    { label: 'Attendance Date', value: transaction.attendance_date || transaction.date },
    { label: 'Attendance Time', value: transaction.attendance_time || transaction.time },
    { label: 'Attendance Status', value: transaction.attendance_status },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6 p-6 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl border border-slate-600 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(transaction.status)}
          <div>
            <h2 className="text-2xl font-bold text-white">Transaction Details</h2>
            <p className="text-slate-400 text-sm mt-1">
              Status: <span className="font-semibold capitalize text-amber-300">{transaction.status}</span>
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <HiOutlineX className="w-5 h-5 text-slate-400" />
        </motion.button>
      </div>

      {/* Main Hash Display */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`p-4 bg-gradient-to-r ${getStatusGradient(transaction.status)} rounded-lg cursor-pointer hover:shadow-lg transition-all`}
        onClick={() => copyToClipboard(formatHash(transaction.tx_hash || transaction.transaction_hash, true))}
      >
        <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-2">Transaction Hash</p>
        <p className="font-mono text-sm text-white break-all hover:text-white/80 transition-colors">
          {formatHash(transaction.tx_hash || transaction.transaction_hash, true)}
        </p>
        <p className="text-xs text-white/60 mt-2">Click to copy</p>
      </motion.div>

      {/* Timestamp */}
      <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Timestamp</p>
        <p className="text-slate-200 font-mono">
          {formatDate(transaction.timestamp || transaction.created_at)}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blockchain Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full" />
            Blockchain Details
          </h3>

          {transactionFields.map((field, idx) =>
            field.value ? (
              <div
                key={idx}
                className="p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:border-slate-500 transition-colors cursor-pointer group"
                onClick={() => {
                  if (field.value && field.value.length > 10) {
                    copyToClipboard(field.value);
                  }
                }}
              >
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  {field.label}
                </p>
                <p
                  className={`${
                    field.label.includes('Hash') || field.label.includes('Address')
                      ? 'font-mono text-blue-300 break-all'
                      : 'text-slate-200'
                  } text-sm group-hover:text-blue-300 transition-colors`}
                >
                  {field.value}
                </p>
              </div>
            ) : null
          )}
        </motion.div>

        {/* Attendance Details */}
        {(transaction.student_name ||
          transaction.student_id ||
          transaction.course_name) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-green-500 rounded-full" />
              Attendance Details
            </h3>

            {attendanceFields.map((field, idx) =>
              field.value ? (
                <div
                  key={idx}
                  className="p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:border-slate-500 transition-colors"
                >
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    {field.label}
                  </p>
                  <p className="text-slate-200 text-sm">{field.value}</p>
                </div>
              ) : null
            )}
          </motion.div>
        )}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
      >
        <p className="text-sm text-blue-300">
          <span className="font-semibold">ℹ️ Transaction Info:</span> This transaction is{' '}
          {transaction.status === 'confirmed'
            ? 'confirmed on the blockchain and immutable.'
            : transaction.status === 'pending'
              ? 'pending confirmation. It may take a few moments.'
              : 'failed. Please contact support if this is unexpected.'}
        </p>
      </motion.div>

      {/* Copy Full JSON */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => copyToClipboard(JSON.stringify(transaction, null, 2))}
        className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg transition-colors text-sm"
      >
        Copy Full JSON
      </motion.button>
    </motion.div>
  );
};

export default TransactionDetails;
