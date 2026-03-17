"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const DB_IDS_KEY = "gea-notion-db-ids";

export default function PublishPage() {
  const router = useRouter();
  const {
    analysis,
    recommendations,
    weekOf,
    publishStatus,
    publishedUrls,
    setPublishStatus,
    setPublishedUrls,
  } = useAppStore();

  const [progress, setProgress] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Load saved DB IDs from localStorage
  const [savedDbIds, setSavedDbIds] = useState<{
    weeklyReport: string;
    creativeBriefs: string;
    lifecycleExperiments: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(DB_IDS_KEY);
    if (stored) {
      try {
        setSavedDbIds(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const handlePublish = async () => {
    if (!analysis || !recommendations) return;

    setPublishStatus("publishing");
    setProgress(["Starting publish to Notion..."]);
    setErrors([]);

    try {
      setProgress((p) => [...p, "Creating databases and pages..."]);

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis,
          recommendations,
          weekOf,
          existingDbIds: savedDbIds,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Publish failed");
      }

      // Save DB IDs for next time
      if (result.databaseIds) {
        localStorage.setItem(DB_IDS_KEY, JSON.stringify(result.databaseIds));
        setSavedDbIds(result.databaseIds);
      }

      if (result.errors?.length > 0) {
        setErrors(result.errors);
      }

      setPublishedUrls(result.pageUrls || []);
      setProgress((p) => [
        ...p,
        `Published ${result.pageUrls?.length || 0} pages to Notion`,
      ]);
      setPublishStatus(result.success ? "done" : "error");
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Unknown error"]);
      setPublishStatus("error");
    }
  };

  if (!analysis || !recommendations) {
    return (
      <div className="max-w-5xl space-y-6">
        <h2 className="text-xl font-semibold">Publish</h2>
        <Card>
          <p className="text-gea-muted text-sm">
            Complete the previous steps first:{" "}
            <button
              onClick={() => router.push("/ingest")}
              className="text-gea-accent hover:underline"
            >
              Ingest
            </button>
            {" → "}
            <button
              onClick={() => router.push("/analysis")}
              className="text-gea-accent hover:underline"
            >
              Analysis
            </button>
            {" → "}
            <button
              onClick={() => router.push("/recommendations")}
              className="text-gea-accent hover:underline"
            >
              Recommendations
            </button>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Publish to Notion</h2>
          <p className="text-sm text-gea-muted">
            Week of {weekOf}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => router.push("/recommendations")}
          >
            Back
          </Button>
          {publishStatus !== "publishing" && publishStatus !== "done" && (
            <Button onClick={handlePublish}>Publish to Notion</Button>
          )}
        </div>
      </div>

      {/* DB Status */}
      <Card title="Notion Databases">
        {savedDbIds ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">Configured</Badge>
              <span className="text-sm text-gea-muted">
                Using existing databases from previous publish
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem(DB_IDS_KEY);
                setSavedDbIds(null);
              }}
              className="text-xs text-gea-accent hover:underline"
            >
              Reset (create new databases on next publish)
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="warning">New</Badge>
            <span className="text-sm text-gea-muted">
              Will create 3 new databases in your Notion workspace
            </span>
          </div>
        )}
      </Card>

      {/* Preview */}
      <Card title="Publish Preview">
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-1">Weekly Growth Report</p>
            <p className="text-gea-muted pl-3 border-l-2 border-gea-border">
              {recommendations.execSummary.slice(0, 150)}...
            </p>
          </div>

          <div>
            <p className="font-medium mb-1">
              Budget Moves ({recommendations.budgetMoves.length})
            </p>
            <ul className="text-gea-muted pl-3 border-l-2 border-gea-border space-y-1">
              {recommendations.budgetMoves.map((m) => (
                <li key={m.id}>
                  [{m.action.toUpperCase()}] {m.target}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium mb-1">
              Creative Briefs (publishing top 2 of{" "}
              {recommendations.creativeAngles.length})
            </p>
            <ul className="text-gea-muted pl-3 border-l-2 border-gea-border space-y-1">
              {recommendations.creativeAngles.slice(0, 2).map((a) => (
                <li key={a.id}>{a.angle}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium mb-1">
              Lifecycle Experiments ({recommendations.lifecycleExperiments.length})
            </p>
            <ul className="text-gea-muted pl-3 border-l-2 border-gea-border space-y-1">
              {recommendations.lifecycleExperiments.map((e) => (
                <li key={e.id}>
                  {e.name} ({e.channel})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Progress */}
      {progress.length > 0 && (
        <Card title="Progress">
          <div className="space-y-1">
            {progress.map((msg, i) => (
              <p key={i} className="text-sm text-gea-muted flex items-center gap-2">
                {i === progress.length - 1 && publishStatus === "publishing" ? (
                  <span className="w-3 h-3 border-2 border-gea-accent border-t-transparent animate-spin inline-block" />
                ) : (
                  <span className="text-gea-success">&#10003;</span>
                )}
                {msg}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Card title="Errors">
          <div className="space-y-1">
            {errors.map((err, i) => (
              <p key={i} className="text-sm text-gea-danger">
                {err}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Success */}
      {publishStatus === "done" && (
        <Card>
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-gea-success mb-2">
              Published Successfully
            </p>
            {publishedUrls.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-gea-muted">View in Notion:</p>
                {publishedUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gea-accent hover:underline block"
                  >
                    {url}
                  </a>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
