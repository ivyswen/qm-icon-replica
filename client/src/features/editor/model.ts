import type { ExportDesignState } from "@/features/export/export";

export type Shape =
  | "spark"
  | "circle"
  | "diamond"
  | "hex"
  | "heart"
  | (string & {});
export type Background =
  | "solid"
  | "linear"
  | "radial"
  | "conic"
  | "image"
  | "transparent";
export type PreviewPlatform = "all" | "mobile" | "desktop" | "web";
export type SavedSnapshot = ExportDesignState & { id: string; savedAt: number };
