/**
 * BlockchainGraph.jsx
 * Displays transactions as blockchain blocks and their connections
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineChevronRight } from 'react-icons/hi';

const BlockchainGraph = ({ transactions = [], blocks = [], onSelectTransaction }) => {
  const [visibleTransactions, setVisibleTransactions] = useState(10);
  const [networkGraph, setNetworkGraph] = useState([]);

  useEffect(() => {
    buildNetworkGraph();
  }, [transactions, blocks]);

  const buildNetworkGraph = () => {
    // Group transactions by block number
    const groupedByBlock = {};
    
    transactions.forEach((tx) => {
      const blockNum = tx.block_number || 'pending';
      if (!groupedByBlock[blockNum]) {
        groupedByBlock[blockNum] = [];
      }
      groupedByBlock[blockNum].push(tx);
    });

    // Create nodes for blocks and transactions
    const nodes = Object.entries(groupedByBlock)
      .sort(([a], [b]) => {
        if (a === 'pending') return 1;
        if (b === 'pending') return -1;
        return parseInt(b) - parseInt(a);
      })
      .slice(0, visibleTransactions)
      .map(([blockNum, txs], idx) => ({
        blockNumber: blockNum,
        transactions: txs,
        posX: (idx % 5) * 240 + 40,
        posY: Math.floor(idx / 5) * 280 + 40,
      }));

    setNetworkGraph(nodes);
  };

  const getStatusColor = (status) => {
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

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'border-green-500 shadow-lg shadow-green-500/30';
      case 'pending':
        return 'border-yellow-500 shadow-lg shadow-yellow-500/30';
      case 'failed':
        return 'border-red-500 shadow-lg shadow-red-500/30';
      default:
        return 'border-slate-500 shadow-lg shadow-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex gap-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
        {['confirmed', 'pending', 'failed'].map((status) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(status)}`}
            />
            <span className="text-sm text-slate-300 capitalize">{status}</span>
          </div>
        ))}
        <div className="flex-1" />
        <p className="text-sm text-slate-400">
          Showing {Math.min(visibleTransactions, transactions.length)} of{' '}
          {transactions.length} transactions
        </p>
      </div>

      {/* Graph Container */}
      <div className="overflow-x-auto rounded-lg border border-slate-600 bg-slate-800/50">
        <svg
          className="w-full h-auto"
          style={{ minHeight: '400px', minWidth: '100%' }}
          viewBox={`0 0 ${Math.max(1200, (networkGraph.length % 5) * 250 + 200)} 
                    ${Math.ceil(networkGraph.length / 5) * 300}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connection Lines */}
          {networkGraph.map((node, idx) => {
            if (idx < networkGraph.length - 1) {
              const nextNode = networkGraph[idx + 1];
              return (
                <motion.line
                  key={`line-${idx}`}
                  x1={node.posX + 90}
                  y1={node.posY + 140}
                  x2={nextNode.posX + 90}
                  y2={nextNode.posY}
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  opacity="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: idx * 0.1 }}
                />
              );
            }
            return null;
          })}

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Blocks */}
          <g>
            {networkGraph.map((node, idx) => (
              <motion.g
                key={`block-${idx}`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                {/* Block Container */}
                <g
                  onClick={() => {
                    if (node.transactions.length > 0) {
                      onSelectTransaction(node.transactions[0]);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {/* Block Background */}
                  <motion.rect
                    x={node.posX}
                    y={node.posY}
                    width="180"
                    height="140"
                    rx="8"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="2"
                    whileHover={{
                      fill: '#334155',
                      stroke: '#64748b',
                    }}
                  />

                  {/* Block Header */}
                  <rect
                    x={node.posX}
                    y={node.posY}
                    width="180"
                    height="40"
                    rx="8"
                    fill={`url(#blockGradient-${idx})`}
                    opacity="0.8"
                  />

                  <defs>
                    <linearGradient
                      id={`blockGradient-${idx}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          node.blockNumber === 'pending'
                            ? '#eab308'
                            : '#3b82f6'
                        }
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          node.blockNumber === 'pending'
                            ? '#ca8a04'
                            : '#1e40af'
                        }
                      />
                    </linearGradient>
                  </defs>

                  {/* Block Number */}
                  <text
                    x={node.posX + 90}
                    y={node.posY + 26}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="white"
                    fontFamily="monospace"
                  >
                    Block #{node.blockNumber}
                  </text>

                  {/* Transaction Count */}
                  <circle
                    cx={node.posX + 20}
                    cy={node.posY + 70}
                    r="12"
                    fill="#3b82f6"
                    opacity="0.3"
                  />
                  <text
                    x={node.posX + 20}
                    y={node.posY + 75}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#60a5fa"
                    fontFamily="monospace"
                  >
                    {node.transactions.length}
                  </text>

                  {/* Transactions */}
                  {node.transactions.slice(0, 3).map((tx, txIdx) => (
                    <g key={`tx-${idx}-${txIdx}`}>
                      <text
                        x={node.posX + 50}
                        y={node.posY + 60 + txIdx * 20}
                        fontSize="10"
                        fill="#94a3b8"
                        fontFamily="monospace"
                      >
                        {tx.status.slice(0, 3).toUpperCase()}
                      </text>
                    </g>
                  ))}

                  {node.transactions.length > 3 && (
                    <text
                      x={node.posX + 90}
                      y={node.posY + 130}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748b"
                      fontStyle="italic"
                    >
                      +{node.transactions.length - 3} more
                    </text>
                  )}
                </g>
              </motion.g>
            ))}
          </g>
        </svg>
      </div>

      {/* Load More */}
      {visibleTransactions < transactions.length && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setVisibleTransactions((prev) => prev + 10)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
        >
          Load More Blocks <HiOutlineChevronRight className="w-4 h-4" />
        </motion.button>
      )}

      {/* Block Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {networkGraph.slice(0, 6).map((node) => (
          <motion.div
            key={`detail-${node.blockNumber}`}
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/70 transition-colors"
            onClick={() => {
              if (node.transactions.length > 0) {
                onSelectTransaction(node.transactions[0]);
              }
            }}
          >
            <div className="space-y-2">
              <h3 className="font-bold text-slate-200">Block #{node.blockNumber}</h3>
              <p className="text-sm text-slate-400">
                Transactions: <span className="text-blue-400">{node.transactions.length}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {node.transactions.slice(0, 3).map((tx, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-1 rounded font-mono ${
                      tx.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-400'
                        : tx.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {tx.status}
                  </span>
                ))}
                {node.transactions.length > 3 && (
                  <span className="text-xs px-2 py-1 rounded bg-slate-600/50 text-slate-300">
                    +{node.transactions.length - 3}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainGraph;
