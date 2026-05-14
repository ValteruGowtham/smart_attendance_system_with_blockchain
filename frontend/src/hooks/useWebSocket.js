/**
 * useWebSocket Hook
 * Manages WebSocket connection for real-time attendance updates
 * Handles reconnection, ping/pong keep-alive, and automatic reconnect on failure
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (url, onMessage, autoReconnect = true) => {
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectDelay = useRef(3000);
  const maxReconnectDelay = 30000;
  const pingInterval = useRef(null);
  
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'connecting', 'disconnected', 'error'
  const [lastPingTime, setLastPingTime] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      setConnectionStatus('connecting');
      
      // Construct WebSocket URL with protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const fullUrl = `${protocol}//${window.location.host}${url}`;
      
      console.log(`[WebSocket] Connecting to ${fullUrl}`);
      
      ws.current = new WebSocket(fullUrl);

      ws.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setConnectionStatus('connected');
        setConnectionError(null);
        reconnectAttempts.current = 0;
        reconnectDelay.current = 3000;

        // Start ping interval to keep connection alive
        startPingInterval();
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Handle pong responses
        if (data.type === 'pong') {
          setLastPingTime(new Date().toISOString());
          return;
        }

        // Handle connection established message
        if (data.type === 'connection_established') {
          console.log('[WebSocket] Connection established:', data);
          return;
        }

        // Forward other messages to handler
        if (onMessage) {
          onMessage(data);
        }
      };

      ws.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setConnectionStatus('error');
        setConnectionError('WebSocket connection error');
      };

      ws.current.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setConnectionStatus('disconnected');
        clearPingInterval();

        // Attempt to reconnect if enabled
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(
            reconnectDelay.current * Math.pow(2, reconnectAttempts.current - 1),
            maxReconnectDelay
          );
          
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setConnectionStatus('error');
      setConnectionError(error.message);
    }
  }, [url, onMessage, autoReconnect]);

  /**
   * Start ping interval to keep connection alive
   */
  const startPingInterval = () => {
    clearPingInterval();
    
    pingInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping' }));
        console.log('[WebSocket] Ping sent');
      }
    }, 30000); // Send ping every 30 seconds
  };

  /**
   * Clear ping interval
   */
  const clearPingInterval = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
  };

  /**
   * Send message through WebSocket
   */
  const send = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      console.log('[WebSocket] Message sent:', message);
    } else {
      console.warn('[WebSocket] Cannot send message: Connection not open', {
        readyState: ws.current?.readyState,
      });
    }
  }, []);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    clearPingInterval();
    
    if (ws.current) {
      ws.current.close(1000, 'User disconnected');
      ws.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, []);

  /**
   * Manually trigger reconnection
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      reconnectAttempts.current = 0;
      connect();
    }, 500);
  }, [connect, disconnect]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionStatus,
    send,
    disconnect,
    reconnect,
    lastPingTime,
    connectionError,
    isConnected: connectionStatus === 'connected',
  };
};

export default useWebSocket;
