/**
 * Audit History Tracker
 * Tracks audit scores over time to show progress
 */

import { AuditResult } from "./audit-engine";

export interface AuditHistoryEntry {
  url: string;
  timestamp: number;
  overallScore: number;
  cssScore: number;
  jsScore: number;
  accessibilityScore?: number;
  totalIssues: number;
}

export interface AuditHistory {
  url: string;
  entries: AuditHistoryEntry[];
  trend: "improving" | "declining" | "stable";
  improvement: number; // percentage change from first to last
}

const HISTORY_KEY = "audit_history";
const MAX_HISTORY_ENTRIES = 50;

/**
 * Add an audit result to history
 */
export async function addToHistory(result: AuditResult): Promise<void> {
  try {
    const history = await getHistory();
    
    const entry: AuditHistoryEntry = {
      url: result.url,
      timestamp: result.timestamp,
      overallScore: result.overallScore,
      cssScore: result.cssScore,
      jsScore: result.jsScore,
      accessibilityScore: result.accessibilityScore,
      totalIssues: result.summary.totalIssues,
    };

    // Get existing history for this URL
    const urlHistory = history[result.url] || [];
    
    // Add new entry
    urlHistory.push(entry);
    
    // Keep only the most recent entries
    if (urlHistory.length > MAX_HISTORY_ENTRIES) {
      urlHistory.shift();
    }

    history[result.url] = urlHistory;

    // Save to storage
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error("Failed to add to history:", error);
  }
}

/**
 * Get all history
 */
export async function getHistory(): Promise<Record<string, AuditHistoryEntry[]>> {
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : {};
    }
  } catch (error) {
    console.error("Failed to get history:", error);
  }
  return {};
}

/**
 * Get history for a specific URL
 */
export async function getURLHistory(url: string): Promise<AuditHistory | null> {
  try {
    const history = await getHistory();
    const entries = history[url] || [];

    if (entries.length === 0) {
      return null;
    }

    // Calculate trend
    const firstScore = entries[0].overallScore;
    const lastScore = entries[entries.length - 1].overallScore;
    const improvement = ((lastScore - firstScore) / firstScore) * 100;

    let trend: "improving" | "declining" | "stable";
    if (improvement > 2) {
      trend = "improving";
    } else if (improvement < -2) {
      trend = "declining";
    } else {
      trend = "stable";
    }

    return {
      url,
      entries,
      trend,
      improvement,
    };
  } catch (error) {
    console.error("Failed to get URL history:", error);
  }
  return null;
}

/**
 * Get score history for charting
 */
export async function getScoreHistory(
  url: string,
  metric: "overall" | "css" | "js" | "accessibility" = "overall"
): Promise<{ timestamps: number[]; scores: number[] }> {
  try {
    const history = await getHistory();
    const entries = history[url] || [];

    const timestamps = entries.map((e) => e.timestamp);
    const scores = entries.map((e) => {
      switch (metric) {
        case "css":
          return e.cssScore;
        case "js":
          return e.jsScore;
        case "accessibility":
          return e.accessibilityScore || 0;
        default:
          return e.overallScore;
      }
    });

    return { timestamps, scores };
  } catch (error) {
    console.error("Failed to get score history:", error);
  }
  return { timestamps: [], scores: [] };
}

/**
 * Clear history for a URL
 */
export async function clearURLHistory(url: string): Promise<void> {
  try {
    const history = await getHistory();
    delete history[url];

    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
}

/**
 * Get statistics for a URL
 */
export async function getURLStatistics(url: string): Promise<{
  averageScore: number;
  bestScore: number;
  worstScore: number;
  auditCount: number;
  lastAudit: number;
} | null> {
  try {
    const history = await getHistory();
    const entries = history[url] || [];

    if (entries.length === 0) {
      return null;
    }

    const scores = entries.map((e) => e.overallScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    return {
      averageScore,
      bestScore,
      worstScore,
      auditCount: entries.length,
      lastAudit: entries[entries.length - 1].timestamp,
    };
  } catch (error) {
    console.error("Failed to get statistics:", error);
  }
  return null;
}
