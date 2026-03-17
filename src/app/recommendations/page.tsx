"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { RecommendationCard } from "@/components/RecommendationCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function RecommendationsPage() {
  const router = useRouter();
  const {
    analysis,
    recommendations,
    setRecommendations,
    updateBudgetMove,
    updateCreativeAngle,
    updateLifecycleExperiment,
    updateExecSummary,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!analysis) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate recommendations");
      }

      const recs = await res.json();
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!analysis) {
    return (
      <div className="max-w-5xl space-y-6">
        <h2 className="text-xl font-semibold">Recommendations</h2>
        <Card>
          <p className="text-gea-muted text-sm">
            No analysis data available. Please complete the{" "}
            <button
              onClick={() => router.push("/ingest")}
              className="text-gea-accent hover:underline"
            >
              data ingest
            </button>{" "}
            and{" "}
            <button
              onClick={() => router.push("/analysis")}
              className="text-gea-accent hover:underline"
            >
              analysis
            </button>{" "}
            steps first.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recommendations</h2>
          <p className="text-sm text-gea-muted">
            AI-generated strategy powered by Claude
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/analysis")}>
            Back
          </Button>
          {!recommendations && (
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : "Generate Recommendations"}
            </Button>
          )}
          {recommendations && (
            <Button onClick={() => router.push("/publish")}>
              Continue to Publish
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card>
          <p className="text-gea-danger text-sm">{error}</p>
        </Card>
      )}

      {loading && (
        <Card>
          <div className="flex items-center gap-3 py-8 justify-center">
            <div className="w-4 h-4 border-2 border-gea-accent border-t-transparent animate-spin" />
            <p className="text-gea-muted text-sm">
              Claude is analyzing your data and generating recommendations...
            </p>
          </div>
        </Card>
      )}

      {recommendations && (
        <>
          {/* Exec Summary */}
          <Card title="Executive Summary">
            <div
              className="text-sm leading-relaxed cursor-pointer hover:bg-gea-bg/50 p-2 -m-2 transition-colors"
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) =>
                updateExecSummary(e.currentTarget.textContent || "")
              }
            >
              {recommendations.execSummary}
            </div>
          </Card>

          {/* Budget Moves */}
          <div>
            <h3 className="text-sm font-medium text-gea-muted mb-3 uppercase tracking-wide">
              Budget Moves (3)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.budgetMoves.map((move) => (
                <RecommendationCard
                  key={move.id}
                  type="budget"
                  title={move.target}
                  badge={{
                    label: move.action.toUpperCase(),
                    variant:
                      move.action === "scale"
                        ? "success"
                        : move.action === "cut"
                          ? "danger"
                          : "neutral",
                  }}
                  body={move.rationale}
                  fields={
                    move.amount ? [{ label: "Amount", value: move.amount }] : []
                  }
                  onEdit={(text) =>
                    updateBudgetMove(move.id, { rationale: text })
                  }
                />
              ))}
            </div>
          </div>

          {/* Creative Angles */}
          <div>
            <h3 className="text-sm font-medium text-gea-muted mb-3 uppercase tracking-wide">
              Creative Angles to Test (5)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.creativeAngles.map((angle) => (
                <RecommendationCard
                  key={angle.id}
                  type="creative"
                  title={angle.angle}
                  body={angle.rationale}
                  fields={[
                    { label: "Audience", value: angle.targetAudience },
                    { label: "Format", value: angle.format },
                  ]}
                  onEdit={(text) =>
                    updateCreativeAngle(angle.id, { rationale: text })
                  }
                />
              ))}
            </div>
          </div>

          {/* Lifecycle Experiments */}
          <div>
            <h3 className="text-sm font-medium text-gea-muted mb-3 uppercase tracking-wide">
              Lifecycle Experiments (3)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.lifecycleExperiments.map((exp) => (
                <RecommendationCard
                  key={exp.id}
                  type="lifecycle"
                  title={exp.name}
                  subtitle={exp.channel}
                  body={exp.hypothesis}
                  fields={[
                    { label: "Metric", value: exp.metricToWatch },
                  ]}
                  onEdit={(text) =>
                    updateLifecycleExperiment(exp.id, { hypothesis: text })
                  }
                />
              ))}
            </div>
          </div>

          {/* Risks */}
          <Card title="Risks">
            <p className="text-sm text-gea-text">{recommendations.risks}</p>
          </Card>
        </>
      )}
    </div>
  );
}
