import { create } from "zustand";

export type LightMode = "actinic" | "reef" | "moon";
export type CamView = "front" | "angle" | "top" | "inside";
export type TankFocus = "both" | "main" | "panorama";

interface ReefState {
  light: LightMode;
  setLight: (l: LightMode) => void;
  focus: TankFocus;
  focusTank: (focus: TankFocus) => void;
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
  focus: "both",
  focusTank: (focus) =>
    set((s) => ({ focus, view: "front", viewNonce: s.viewNonce + 1 })),
  view: "front",
  viewNonce: 0,
  setView: (view) =>
    set((s) => ({
      view,
      viewNonce: s.viewNonce + 1,
      // An inside view needs one tank; enter the original when coming from the overview.
      focus: view === "inside" && s.focus === "both" ? "main" : s.focus,
    })),
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
