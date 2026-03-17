"use client";

import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import type { MetricDelta } from "@/lib/analysis/types";

function formatValue(value: number, format: MetricDelta["format"]): string {
  switch (format) {
    case "currency":
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "ratio":
      return `${value.toFixed(2)}x`;
    case "number":
      return value.toLocaleString();
  }
}

export function MetricCard({ metric }: { metric: MetricDelta }) {
  const deltaVariant = metric.deltaPercent
    ? metric.deltaPercent > 0
      ? "success"
      : "danger"
    : "neutral";

  // For CAC and CPM, lower is better — flip the color
  const invertedMetrics = ["CAC", "Avg CPM", "Avg CPC"];
  const effectiveVariant =
    invertedMetrics.includes(metric.label) && deltaVariant !== "neutral"
      ? deltaVariant === "success"
        ? "danger"
        : "success"
      : deltaVariant;

  return (
    <Card className="flex flex-col gap-1">
      <p className="text-xs text-gea-muted uppercase tracking-wide">
        {metric.label}
        {metric.isAnomaly && (
          <span className="ml-1 text-gea-warning" title="Anomaly: >15% WoW swing">
            !!
          </span>
        )}
      </p>
      <p className="text-2xl font-semibold">
        {formatValue(metric.current, metric.format)}
      </p>
      {metric.deltaPercent !== null && (
        <Badge variant={effectiveVariant}>
          {metric.deltaPercent > 0 ? "+" : ""}
          {metric.deltaPercent.toFixed(1)}% WoW
        </Badge>
      )}
    </Card>
  );
}
