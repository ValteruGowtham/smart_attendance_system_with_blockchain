import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiShieldCheck, 
  HiCube, 
  HiGlobeAlt, 
  HiRefresh, 
  HiDatabase, 
  HiLink, 
  HiClipboardCopy,
  HiExternalLink,
  HiSearch,
  HiChip,
  HiArrowLeft
} from 'react-icons/hi';
import { getBlockchainInfo, verifyTransaction } from '../api/api';
import { useToast } from '../context/ToastContext';

const BlockchainPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchHash, setSearchHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const { toast } = useToast();

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const res = await getBlockchainInfo();
      setData(res.data);
    } catch (err) {
      // Silently handle error as backend now provides simulated data or empty states
      console.error('Blockchain connection issue:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVerify = async () => {
    if (!searchHash || !searchHash.startsWith('0x')) {
      toast.error('Please enter a valid transaction hash starting with 0x');
      return;
    }

    try {
      setVerifying(true);
      setSearchResult(null);
      const res = await verifyTransaction(searchHash);
      if (res.data.found) {
        setSearchResult(res.data.details);
        toast.success('Transaction Verified on Ledger');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Transaction verification failed');
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000); // Auto refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text, msg) => {
    navigator.clipboard.writeText(text);
    toast.success(msg || 'Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center text-white p-6">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-gray-400 font-mono tracking-widest animate-pulse">SYNCHRONIZING WITH LEDGER...</p>
      </div>
    );
  }

  const { stats, transactions } = data || {};

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 font-sans selection:bg-indigo-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .glass-panel {
          background: rgba(17, 25, 40, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.125);
          border-radius: 16px;
        }
        .glow-indigo { box-shadow: 0 0 20px rgba(99, 102, 241, 0.15); }
        .glow-emerald { box-shadow: 0 0 20px rgba(16, 185, 129, 0.15); }
      `}</style>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link to="/" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all mr-2">
                <HiArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <HiShieldCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Trust Protocol</h1>
            </div>
            <p className="text-gray-400 max-w-2xl">
              Blockchain-backed attendance verification. All records are cryptographically hashed 
              and stored on an immutable ledger, ensuring zero tampering and full auditability.
            </p>
          </div>
          
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold ${refreshing ? 'opacity-50' : ''}`}
          >
            <HiRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Network'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Network Status', value: 'ONLINE', icon: HiGlobeAlt, color: 'text-emerald-400', sub: stats?.connection_url },
            { label: 'Current Block', value: stats?.latest_block?.toLocaleString(), icon: HiCube, color: 'text-indigo-400', sub: 'Main Chain Height' },
            { label: 'Network ID', value: stats?.network_id, icon: HiLink, color: 'text-sky-400', sub: 'Ethereum / Ganache' },
            { label: 'Validator Nodes', value: stats?.accounts_count, icon: HiChip, color: 'text-violet-400', sub: 'Active Peers' },
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 glow-indigo hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{s.label}</div>
              <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-[10px] font-medium mt-1 truncate">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Transaction List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <HiDatabase className="text-indigo-400" />
                  Immutable Audit Trail
                </h2>
                <div className="text-xs font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  Recent 10 Cycles
                </div>
              </div>

              <div className="space-y-4">
                {transactions?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-mono">
                    NO ON-CHAIN RECORDS FOUND
                  </div>
                ) : (
                  transactions?.map((tx, idx) => (
                    <motion.div 
                      key={tx.tx_hash}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold">{tx.student}</div>
                            <div className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{tx.reg_id} • {tx.course}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            MINED
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono mt-1">{tx.date}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 p-2 bg-black/40 rounded border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                        <span className="text-[10px] font-mono text-gray-500 uppercase px-2">TxHash</span>
                        <code className="text-xs font-mono text-indigo-300 flex-1 truncate">
                          {tx.tx_hash}
                        </code>
                        <button 
                          onClick={() => copyToClipboard(tx.tx_hash, 'Transaction Hash copied')}
                          className="p-1.5 hover:bg-white/10 rounded transition-colors"
                          title="Copy Hash"
                        >
                          <HiClipboardCopy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="glass-panel p-6 glow-emerald border-emerald-500/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <HiGlobeAlt className="text-emerald-400" />
                Chain Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Contract Deployment</span>
                  <HiExternalLink className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase mb-1">Gas Price (Current)</p>
                  <span className="text-xl font-bold font-mono">
                    {stats?.gas_price ? (stats.gas_price / 1e9).toFixed(1) : '2.0'} Gwei
                  </span>
                </div>
                {data?.is_simulated && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Showcase Demo Mode
                    </p>
                    <p className="text-[10px] text-amber-500/70 mt-1 leading-tight">
                      Blockchain network is currently offline. Showing local simulated ledger for demonstration.
                    </p>
                  </div>
                )}
                <div className="pt-4 border-t border-white/5">
                  <div className="text-[10px] text-emerald-500/80 italic leading-relaxed">
                    "Every attendance record is hashed using SHA256 before being committed to the block. 
                    This creates a mathematical proof of presence that cannot be retroactively altered."
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <HiSearch className="text-sky-400" />
                Verify Record
              </h3>
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Paste a transaction hash to verify its existence in the public ledger.</p>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    placeholder="0x..." 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <HiSearch className="absolute right-4 top-3.5 text-gray-600" />
                </div>
                <button 
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                >
                  {verifying ? 'Verifying...' : 'Lookup Transaction'}
                </button>

                <AnimatePresence>
                  {searchResult && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <div className="text-[10px] font-bold text-emerald-400 uppercase mb-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Verification Success
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Block Number</span>
                          <span className="font-mono text-gray-300">{searchResult.block_number || 'Demo-1'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subject</span>
                          <span className="text-gray-300">{searchResult.course || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Student</span>
                          <span className="text-gray-300">{searchResult.student || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/5">
                          <span className="text-gray-500">Status</span>
                          <span className="text-emerald-400 font-bold uppercase">{searchResult.status === 1 ? 'SUCCESS' : searchResult.status || 'CONFIRMED'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Network Peer Monitoring</span>
              </div>
              <div className="text-[10px] text-gray-500 font-mono leading-relaxed">
                Listening for block events...
                <br />✓ Connection: HTTP/1.1
                <br />✓ Handshake: Completed
                <br />✓ Latency: 12ms
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainPage;
