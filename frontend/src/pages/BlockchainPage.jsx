/**
 * BlockchainPage.jsx - Blockchain Explorer
 * View and explore all blockchain transactions with expandable details
 */

import React, { useState, useMemo } from 'react';
import {
  HiSearch,
  HiChevronDown,
  HiChevronUp,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
  HiCube,
  HiCheckBadge,
  HiLink,
} from 'react-icons/hi';

export default function BlockchainPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Mock blockchain data
  const transactions = [
    {
      id: 1,
      hash: 'a3f8c1e9b2d4f7a6c5e8b1d3f9a2c4e6',
      studentName: 'Rahul Kumar',
      faculty: 'Dr. Singh',
      dateTime: '2024-12-20 10:02:15',
      period: '2',
      status: 'Confirmed',
      fullHash: 'a3f8c1e9b2d4f7a6c5e8b1d3f9a2c4e6b7d9f0a1c3e5f7a8b0d2e4f6a8c',
      blockNumber: 15847,
      gasUsed: 24500,
    },
    {
      id: 2,
      hash: 'b4e7d2f9a1c6e8b3d5f7a0c2e4f6a8b1',
      studentName: 'Priya Sharma',
      faculty: 'Dr. Kumar',
      dateTime: '2024-12-20 10:01:45',
      period: '2',
      status: 'Confirmed',
      fullHash: 'b4e7d2f9a1c6e8b3d5f7a0c2e4f6a8b1c3e5f7a9b0d2e4f6a8c0e2f4a6c8',
      blockNumber: 15846,
      gasUsed: 24500,
    },
    {
      id: 3,
      hash: 'c5f6e3a0b2d7f9c1e4f6a8b0d2e5f7a9',
      studentName: 'Arjun Singh',
      faculty: 'Mr. Gupta',
      dateTime: '2024-12-20 09:58:30',
      period: '1',
      status: 'Pending',
      fullHash: 'c5f6e3a0b2d7f9c1e4f6a8b0d2e5f7a9b1c3e5f7a9b0d2e4f6a8c0e2f4a6',
      blockNumber: 15845,
      gasUsed: 0,
    },
    {
      id: 4,
      hash: 'd6a7f4b1c3e8f0d2f5a7b9c1e3f5a8b0',
      studentName: 'Neha Patel',
      faculty: 'Dr. Sharma',
      dateTime: '2024-12-20 09:45:20',
      period: '1',
      status: 'Confirmed',
      fullHash: 'd6a7f4b1c3e8f0d2f5a7b9c1e3f5a8b0c2d4f6a8b0c2e4f6a8c0e2f4a6c8e',
      blockNumber: 15844,
      gasUsed: 24500,
    },
    {
      id: 5,
      hash: 'e7b8f5c2d4e9f1a3f6b8c0d2e4f6a9b1',
      studentName: 'Amit Verma',
      faculty: 'Dr. Singh',
      dateTime: '2024-12-20 09:30:10',
      period: '1',
      status: 'Confirmed',
      fullHash: 'e7b8f5c2d4e9f1a3f6b8c0d2e4f6a9b1c3e5f7a9b0d2e4f6a8c0e2f4a6c8e0',
      blockNumber: 15843,
      gasUsed: 24500,
    },
  ];

  // Stats
  const stats = {
    totalTransactions: transactions.length,
    verifiedRecords: transactions.filter(t => t.status === 'Confirmed').length,
    lastBlockNumber: 15847,
    networkStatus: 'Connected',
  };

  // Filter transactions by search term
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const term = searchTerm.toLowerCase();
    return transactions.filter(t =>
      t.studentName.toLowerCase().includes(term) ||
      t.hash.toLowerCase().includes(term) ||
      t.fullHash.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    // Toast would go here
    console.log(`Copied ${label} to clipboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Blockchain Explorer</h1>
        <p className="text-slate-600">Real-time attendance transaction verification on the blockchain</p>
      </div>

      {/* Top Stats Bar */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Total Transactions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">Total Transactions</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTransactions}</p>
            </div>
            <HiCube className="w-12 h-12 text-blue-400 opacity-60" />
          </div>
        </div>

        {/* Verified Records */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">Verified Records</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.verifiedRecords}</p>
            </div>
            <HiCheckBadge className="w-12 h-12 text-green-400 opacity-60" />
          </div>
        </div>

        {/* Last Block Number */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold">Last Block Number</p>
              <p className="text-3xl font-bold text-slate-900 font-mono mt-2">{stats.lastBlockNumber}</p>
            </div>
            <HiLink className="w-12 h-12 text-purple-400 opacity-60" />
          </div>
        </div>

        {/* Network Status */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-semibold">Network Status</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-lg font-bold text-green-600">{stats.networkStatus}</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-200 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <HiSearch className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or transaction hash..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            <div>Tx Hash</div>
            <div>Student Name</div>
            <div>Faculty</div>
            <div>Date / Time</div>
            <div>Period</div>
            <div>Status</div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-200">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <React.Fragment key={tx.id}>
                {/* Main Row */}
                <div
                  className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
                >
                  <div className="grid grid-cols-6 gap-4 items-center">
                    {/* Tx Hash (Truncated) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(tx.hash, 'Hash');
                        }}
                        className="font-mono text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        title="Click to copy full hash"
                      >
                        {tx.hash.substring(0, 12)}...
                      </button>
                      <HiLink className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Student Name */}
                    <div className="text-slate-900 font-medium">{tx.studentName}</div>

                    {/* Faculty */}
                    <div className="text-slate-600">{tx.faculty}</div>

                    {/* Date / Time */}
                    <div className="text-slate-600 text-sm">{tx.dateTime}</div>

                    {/* Period */}
                    <div className="text-slate-600 font-medium">Period {tx.period}</div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === 'Confirmed'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {tx.status === 'Confirmed' ? (
                          <HiCheckCircle className="w-4 h-4" />
                        ) : (
                          <HiClock className="w-4 h-4" />
                        )}
                        {tx.status}
                      </div>
                      {expandedRow === tx.id ? (
                        <HiChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <HiChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRow === tx.id && (
                  <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-slate-600 text-xs uppercase font-semibold tracking-wide mb-2">Full Transaction Hash</p>
                          <div className="bg-white rounded-lg p-4 font-mono text-sm text-slate-700 break-all overflow-x-auto max-h-20 border border-slate-200">
                            {tx.fullHash}
                          </div>
                          <button
                            onClick={() => copyToClipboard(tx.fullHash, 'Full Hash')}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                          >
                            📋 Copy Full Hash
                          </button>
                        </div>

                        <div>
                          <p className="text-slate-600 text-xs uppercase font-semibold tracking-wide mb-2">Block Number</p>
                          <p className="text-slate-900 font-mono text-lg">#{tx.blockNumber}</p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-slate-600 text-xs uppercase font-semibold tracking-wide mb-2">Gas Used</p>
                          <p className="text-slate-900 font-mono text-lg">{tx.gasUsed} units</p>
                        </div>

                        <div className="pt-4">
                          <button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <HiCheckBadge className="w-5 h-5" />
                            Verify on Chain
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <HiExclamationCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No transactions found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-slate-500 text-sm">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>
    </div>
  );
}
