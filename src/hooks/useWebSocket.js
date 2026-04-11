import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function useWebSocket({ onTimeSlotUpdate }) {
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
    });

    clientRef.current = client;
    client.activate();

    return client;
  }, []);

  const subscribeToTimeSlot = useCallback((timeSlotId) => {
    if (!clientRef.current?.connected) return;

    clientRef.current.subscribe(
      `/topic/timeslots/${timeSlotId}`,
      (message) => {
        const data = JSON.parse(message.body);
        onTimeSlotUpdate(data);
      }
    );
  }, [onTimeSlotUpdate]);

  const sendReservationRequest = useCallback((payload) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: '/app/reservation/request',
      body: JSON.stringify(payload),
    });
  }, []);

  const sendReservationResponse = useCallback((payload) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: '/app/reservation/respond',
      body: JSON.stringify(payload),
    });
  }, []);

  useEffect(() => {
    const client = connect();
    return () => {
      client.deactivate();
    };
  }, [connect]);

  return {
    subscribeToTimeSlot,
    sendReservationRequest,
    sendReservationResponse,
    client: clientRef,
  };
}