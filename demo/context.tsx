import { createContext, useContext } from "react";
import type { Action, Role, State } from "./model";
export type Modal = { kind: string; id?: string } | null;
export type Context = {
  state: State;
  role: Role;
  page: string;
  id?: string;
  go: (page: string, id?: string, role?: Role) => void;
  act: (a: Action, message?: string) => boolean;
  open: (m: Modal) => void;
};
export const DemoContext = createContext<Context | null>(null);
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Demo context missing");
  return context;
}
