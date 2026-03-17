"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { analyzeWeeklyData } from "@/lib/analysis/metrics";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AnalysisPage() {
  const router = useRouter();
  const { currentWeek, previousWeek, analysis, setAnalysis } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!analysis) {
      setLoading(true);
      const result = analyzeWeeklyData(currentWeek, previousWeek);
      setAnalysis(result);
      setLoading(false);
    }
  }, [currentWeek, previousWeek, analysis, setAnalysis]);

  if (loading || !analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gea-muted">Analyzing data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analysis</h2>
          <p className="text-sm text-gea-muted">
            Weekly performance dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/ingest")}>
            Back
          </Button>
          <Button onClick={() => router.push("/recommendations")}>
            Generate Recommendations
          </Button>
        </div>
      </div>

      {/* Data completeness */}
      <Card title="Data Sources">
        <div className="flex gap-4">
          {Object.entries(analysis.dataCompleteness).map(([source, present]) => (
            <div key={source} className="flex items-center gap-2">
              <span className="text-xs uppercase font-medium">{source}</span>
              <Badge variant={present ? "success" : "neutral"}>
                {present ? "Loaded" : "Missing"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* KPI Grid */}
      <div>
        <h3 className="text-sm font-medium text-gea-muted mb-3 uppercase tracking-wide">
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {analysis.kpis.map((kpi) => (
            <MetricCard key={kpi.label} metric={kpi} />
          ))}
        </div>
      </div>

      {/* Funnel */}
      {analysis.funnel.length > 0 && (
        <Card title="Conversion Funnel">
          <div className="flex items-center gap-2">
            {analysis.funnel.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {step.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gea-muted">{step.label}</p>
                  {step.rate !== null && (
                    <p className="text-xs text-gea-accent">
                      {step.rate.toFixed(1)}%
                    </p>
                  )}
                </div>
                {i < analysis.funnel.length - 1 && (
                  <span className="text-gea-border text-xl mx-2">&rarr;</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Anomalies */}
      {analysis.anomalies.length > 0 && (
        <Card title="Anomaly Flags">
          <div className="space-y-2">
            {analysis.anomalies.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-gea-warning font-bold">!!</span>
                <span>{a}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Campaign breakdown */}
      {analysis.campaigns.length > 0 && (
        <Card title="Campaign Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gea-border text-left text-xs text-gea-muted uppercase">
                  <th className="pb-2 pr-4">Campaign</th>
                  <th className="pb-2 pr-4">Spend</th>
                  <th className="pb-2 pr-4">ROAS</th>
                  <th className="pb-2 pr-4">CTR</th>
                  <th className="pb-2 pr-4">CPM</th>
                  <th className="pb-2 pr-4">Purchases</th>
                  <th className="pb-2">CPA</th>
                </tr>
              </thead>
              <tbody>
                {analysis.campaigns.map((c) => (
                  <tr
                    key={c.name}
                    className="border-b border-gea-border/50"
                  >
                    <td className="py-2 pr-4 font-medium">{c.name}</td>
                    <td className="py-2 pr-4">
                      ${c.spend.toFixed(2)}
                    </td>
                    <td className="py-2 pr-4">{c.roas.toFixed(2)}x</td>
                    <td className="py-2 pr-4">{c.ctr.toFixed(1)}%</td>
                    <td className="py-2 pr-4">${c.cpm.toFixed(2)}</td>
                    <td className="py-2 pr-4">{c.purchases}</td>
                    <td className="py-2">
                      ${c.costPerPurchase.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
