import { useState, useEffect, useRef, useCallback } from "react";
import { ws } from "@shared/routes";

export function useDesignWebSocket() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [previewReadyId, setPreviewReadyId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => setConnected(true);
    socket.onclose = () => {
      setConnected(false);
      // Auto reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "status") {
          const parsed = ws.receive.status.parse(data.data);
          setStatusMessage(parsed.message);
        } else if (data.type === "preview_ready") {
          const parsed = ws.receive.preview_ready.parse(data.data);
          setPreviewReadyId(parsed.uuid);
          setStatusMessage("Preview Ready!");
          setTimeout(() => setStatusMessage(null), 3000);
        }
      } catch (err) {
        console.error("Failed to parse WS message", err);
      }
    };

    socketRef.current = socket;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const clearReadyState = () => setPreviewReadyId(null);

  return { statusMessage, previewReadyId, connected, clearReadyState };
}
