import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createBuildStore, type BuildOptions, type BuildState, type BuildStore } from './store';

const Ctx = createContext<BuildStore | null>(null);

export function BuildProvider({ children, options }: { children: ReactNode; options?: BuildOptions }) {
  const [store] = useState(() => createBuildStore(options));
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useBuildStore(): BuildStore {
  const store = useContext(Ctx);
  if (!store) throw new Error('useBuild must be used inside <BuildProvider>');
  return store;
}

export function useBuild<T>(selector: (s: BuildState) => T): T {
  return useStore(useBuildStore(), selector);
}
