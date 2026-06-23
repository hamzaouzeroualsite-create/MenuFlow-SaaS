'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export function useSocket(restaurantId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:restaurant', restaurantId);
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  return socketRef;
}

export function useOrderSocket(
  restaurantId: string | undefined,
  onNewOrder: (data: unknown) => void,
  onOrderUpdate: (data: unknown) => void
) {
  const socketRef = useSocket(restaurantId);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('order:new', onNewOrder);
    socket.on('order:updated', onOrderUpdate);

    return () => {
      socket.off('order:new', onNewOrder);
      socket.off('order:updated', onOrderUpdate);
    };
  }, [socketRef, onNewOrder, onOrderUpdate]);
}
