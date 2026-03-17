import { create } from "zustand";
import type { WeeklyData } from "./adapters/types";
import type { AnalysisResult } from "./analysis/types";

export interface BudgetMove {
  id: string;
  action: "keep" | "scale" | "cut";
  target: string;
  rationale: string;
  amount?: string;
}

export interface CreativeAngle {
  id: string;
  angle: string;
  targetAudience: string;
  format: string;
  rationale: string;
}

export interface LifecycleExperiment {
  id: string;
  name: string;
  hypothesis: string;
  channel: "Email" | "SMS" | "Push";
  metricToWatch: string;
}

export interface Recommendations {
  budgetMoves: BudgetMove[];
  creativeAngles: CreativeAngle[];
  lifecycleExperiments: LifecycleExperiment[];
  execSummary: string;
  risks: string;
}

interface AppState {
  // Step 1: Ingested data
  currentWeek: WeeklyData;
  previousWeek: WeeklyData | null;
  weekOf: string;

  // Step 2: Analysis
  analysis: AnalysisResult | null;

  // Step 3: Recommendations
  recommendations: Recommendations | null;

  // Step 4: Publish status
  publishStatus: "idle" | "publishing" | "done" | "error";
  publishedUrls: string[];

  // Actions
  setCurrentWeek: (data: Partial<WeeklyData>) => void;
  setPreviousWeek: (data: Partial<WeeklyData>) => void;
  setWeekOf: (date: string) => void;
  setAnalysis: (result: AnalysisResult) => void;
  setRecommendations: (recs: Recommendations) => void;
  updateBudgetMove: (id: string, updates: Partial<BudgetMove>) => void;
  updateCreativeAngle: (id: string, updates: Partial<CreativeAngle>) => void;
  updateLifecycleExperiment: (id: string, updates: Partial<LifecycleExperiment>) => void;
  updateExecSummary: (text: string) => void;
  setPublishStatus: (status: AppState["publishStatus"]) => void;
  setPublishedUrls: (urls: string[]) => void;
  reset: () => void;
}

const emptyWeek: WeeklyData = {
  weekOf: "",
  meta: null,
  ga4: null,
  shopify: null,
  klaviyo: null,
};

export const useAppStore = create<AppState>((set) => ({
  currentWeek: { ...emptyWeek },
  previousWeek: null,
  weekOf: new Date().toISOString().split("T")[0],
  analysis: null,
  recommendations: null,
  publishStatus: "idle",
  publishedUrls: [],

  setCurrentWeek: (data) =>
    set((s) => ({ currentWeek: { ...s.currentWeek, ...data } })),

  setPreviousWeek: (data) =>
    set((s) => ({
      previousWeek: s.previousWeek
        ? { ...s.previousWeek, ...data }
        : { ...emptyWeek, ...data },
    })),

  setWeekOf: (date) => set({ weekOf: date }),

  setAnalysis: (result) => set({ analysis: result }),

  setRecommendations: (recs) => set({ recommendations: recs }),

  updateBudgetMove: (id, updates) =>
    set((s) => ({
      recommendations: s.recommendations
        ? {
            ...s.recommendations,
            budgetMoves: s.recommendations.budgetMoves.map((m) =>
              m.id === id ? { ...m, ...updates } : m
            ),
          }
        : null,
    })),

  updateCreativeAngle: (id, updates) =>
    set((s) => ({
      recommendations: s.recommendations
        ? {
            ...s.recommendations,
            creativeAngles: s.recommendations.creativeAngles.map((a) =>
              a.id === id ? { ...a, ...updates } : a
            ),
          }
        : null,
    })),

  updateLifecycleExperiment: (id, updates) =>
    set((s) => ({
      recommendations: s.recommendations
        ? {
            ...s.recommendations,
            lifecycleExperiments: s.recommendations.lifecycleExperiments.map(
              (e) => (e.id === id ? { ...e, ...updates } : e)
            ),
          }
        : null,
    })),

  updateExecSummary: (text) =>
    set((s) => ({
      recommendations: s.recommendations
        ? { ...s.recommendations, execSummary: text }
        : null,
    })),

  setPublishStatus: (status) => set({ publishStatus: status }),

  setPublishedUrls: (urls) => set({ publishedUrls: urls }),

  reset: () =>
    set({
      currentWeek: { ...emptyWeek },
      previousWeek: null,
      weekOf: new Date().toISOString().split("T")[0],
      analysis: null,
      recommendations: null,
      publishStatus: "idle",
      publishedUrls: [],
    }),
}));
