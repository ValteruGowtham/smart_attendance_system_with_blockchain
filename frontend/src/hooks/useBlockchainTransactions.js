/**
 * useBlockchainTransactions.js
 * Custom hook for fetching blockchain transactions from API
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useBlockchainTransactions = (endpoint = '/api/blockchain/transactions/', autoRefresh = false, refreshInterval = 5000) => {
  const [transactions, setTransactions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch transactions
      const txResponse = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const txData = Array.isArray(txResponse.data) ? txResponse.data : txResponse.data.results || [];
      setTransactions(txData);

      // Transform to blocks if needed
      const blockMap = {};
      txData.forEach((tx) => {
        const blockNum = tx.block_number || 'pending';
        if (!blockMap[blockNum]) {
          blockMap[blockNum] = {
            number: blockNum,
            transactions: [],
            timestamp: tx.timestamp || tx.created_at,
          };
        }
        blockMap[blockNum].transactions.push(tx);
      });

      setBlocks(Object.values(blockMap));
    } catch (err) {
      console.error('Error fetching blockchain transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
      
      // Return mock data for demo purposes
      const mockTransactions = generateMockTransactions();
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchTransactions();

    if (autoRefresh) {
      const interval = setInterval(fetchTransactions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTransactions, autoRefresh, refreshInterval]);

  const generateMockTransactions = () => [
    {
      tx_hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
      block_number: 15847,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      gas_used: 127450,
      gas_price: '20',
      student_name: 'John Doe',
      student_id: 'CSE001',
      course_name: 'Data Structures',
    },
    {
      tx_hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1b',
      block_number: 15846,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      gas_used: 125300,
      gas_price: '20',
      student_name: 'Jane Smith',
      student_id: 'CSE002',
      course_name: 'Algorithms',
    },
    {
      tx_hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1b2c',
      block_number: null,
      status: 'pending',
      timestamp: new Date().toISOString(),
      student_name: 'Mike Johnson',
      student_id: 'CSE003',
      course_name: 'Database Systems',
    },
  ];

  return {
    transactions,
    blocks,
    loading,
    error,
    refetch: fetchTransactions,
    setTransactions,
    setBlocks,
  };
};

export default useBlockchainTransactions;
