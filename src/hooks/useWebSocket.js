import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function useWebSocket({ onTimeSlotUpdate, onConnect: onConnectCallback }) {
  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Set());
  const onTimeSlotUpdateRef = useRef(onTimeSlotUpdate);
  const onConnectCallbackRef = useRef(onConnectCallback);

  useEffect(() => {
    onTimeSlotUpdateRef.current = onTimeSlotUpdate;
  }, [onTimeSlotUpdate]);

  useEffect(() => {
    onConnectCallbackRef.current = onConnectCallback;
  }, [onConnectCallback]);

  const subscribeToTimeSlot = useCallback((timeSlotId) => {
    if (!clientRef.current?.connected) return;
    if (subscriptionsRef.current.has(timeSlotId)) return;

    clientRef.current.subscribe(
      `/topic/timeslots/${timeSlotId}`,
      (message) => {
        const data = JSON.parse(message.body);
        onTimeSlotUpdateRef.current(data);
      }
    );
    subscriptionsRef.current.add(timeSlotId);
  }, []);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('https://kt-backend-1ge5.onrender.com/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        subscriptionsRef.current.clear();
        if (onConnectCallbackRef.current) onConnectCallbackRef.current();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        subscriptionsRef.current.clear();
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

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

  return {
    subscribeToTimeSlot,
    sendReservationRequest,
    sendReservationResponse,
    client: clientRef,
  };
}