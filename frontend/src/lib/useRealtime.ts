import { useEffect, useRef, useState } from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type TableName = 'people' | 'gifts';
export type ChangePayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

interface Options {
  /** Called for every INSERT / UPDATE / DELETE on `people` or `gifts`. */
  onChange: (table: TableName, payload: ChangePayload) => void;
  /** Called whenever we (re)connect or the tab becomes visible again, to refetch and catch up. */
  onResync: () => void;
}

/**
 * Subscribes to Supabase Realtime `postgres_changes` on the people and gifts tables.
 * Resyncs on (re)subscribe, when the browser comes back online and when the tab is
 * shown again (phones pause background tabs). Cleans up on unmount.
 * Returns `true` while the live connection is down.
 */
export function useRealtime({ onChange, onResync }: Options): boolean {
  const onChangeRef = useRef(onChange);
  const onResyncRef = useRef(onResync);
  onChangeRef.current = onChange;
  onResyncRef.current = onResync;
  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel(`family-wishlist-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, (payload) =>
        onChangeRef.current('people', payload as ChangePayload),
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, (payload) =>
        onChangeRef.current('gifts', payload as ChangePayload),
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setDisconnected(false);
          // Covers the gap between the initial fetch and the subscription, and any reconnect.
          onResyncRef.current();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // supabase-js retries automatically; we just tell the user.
          setDisconnected(true);
        }
      });

    const resync = () => {
      if (document.visibilityState === 'visible') onResyncRef.current();
    };
    window.addEventListener('online', resync);
    document.addEventListener('visibilitychange', resync);

    return () => {
      window.removeEventListener('online', resync);
      document.removeEventListener('visibilitychange', resync);
      client.removeChannel(channel);
    };
  }, []);

  return disconnected;
}
