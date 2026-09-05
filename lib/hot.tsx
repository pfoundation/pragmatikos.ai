'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/** Cross-section hover: family-pair label highlighted from anywhere (ranked list → hero radar). */
const HotCtx = createContext<[string | null, (v: string | null) => void]>([null, () => {}]);

export function HotProvider({ children }: { children: ReactNode }) {
  const [hot, setHot] = useState<string | null>(null);
  return <HotCtx.Provider value={[hot, setHot]}>{children}</HotCtx.Provider>;
}

export function useSharedHot(): [string | null, (v: string | null) => void] {
  return useContext(HotCtx);
}
