import { useEffect, useState } from 'react';

interface UseDualChannelOpts<T> {
  /** Server-provided data (rendered at SSR time). */
  serverData?: T | null;
  /** How to read & parse the stored value. Returns null if nothing stored. */
  readStored(): T | null;
  /** If true, skip client fallback when serverData is already provided. */
  skipIfServer?: boolean;
}

/**
 * Dual-channel data resolver.
 *
 * Uses server-provided data (SSR) when available. Falls back to reading
 * from localStorage on the client for anonymous users. This pattern is
 * used in the Sidebar's completion marks: logged-in users get server-side
 * data rendered directly, guests get localStorage data injected by script.
 *
 * Returns `null` when no data is available from either channel.
 */
export function useDualChannel<T>(opts: UseDualChannelOpts<T>): {
  data: T | null;
  source: 'server' | 'client' | null;
} {
  const { serverData, readStored, skipIfServer = false } = opts;
  const [clientData, setClientData] = useState<T | null>(null);

  useEffect(() => {
    if (serverData && skipIfServer) {
      setClientData(null);
      return;
    }
    const stored = readStored();
    setClientData(stored);
  }, [serverData, skipIfServer, readStored]);

  if (serverData != null) {
    return { data: serverData, source: 'server' };
  }

  if (clientData != null) {
    return { data: clientData, source: 'client' };
  }

  return { data: null, source: null };
}
