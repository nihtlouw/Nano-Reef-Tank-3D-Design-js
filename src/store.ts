import { create } from "zustand";

export type LightMode = "actinic" | "reef" | "moon";
export type CamView = "front" | "angle" | "top" | "inside";

interface ReefState {
  light: LightMode;
  setLight: (l: LightMode) => void;
  view: CamView;
  viewNonce: number;
  setView: (v: CamView) => void;
  feedNonce: number;
  feed: () => void;
  mandarin: boolean;
  butterfly: boolean;
  goby: boolean;
  toggle: (k: "mandarin" | "butterfly" | "goby") => void;
  flow: number;
  setFlow: (f: number) => void;
}

export const useReef = create<ReefState>((set) => ({
  light: "actinic",
  setLight: (light) => set({ light }),
  view: "front",
  viewNonce: 0,
  setView: (view) => set((s) => ({ view, viewNonce: s.viewNonce + 1 })),
  feedNonce: 0,
  feed: () => set((s) => ({ feedNonce: s.feedNonce + 1 })),
  mandarin: true,
  butterfly: false,
  goby: true,
  toggle: (k) => set((s) => ({ [k]: !s[k] }) as Partial<ReefState>),
  flow: 1,
  setFlow: (flow) => set({ flow }),
}));

// Tank dimensions (scene units)
export const TANK = {
  w: 6,
  h: 3.7,
  d: 3.6,
  water: 3.35,
  sand: 0.32,
};
