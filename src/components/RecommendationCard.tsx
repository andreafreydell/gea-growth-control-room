"use client";

import { useState } from "react";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";

interface RecommendationCardProps {
  type: "budget" | "creative" | "lifecycle";
  title: string;
  subtitle?: string;
  body: string;
  badge?: { label: string; variant: "success" | "danger" | "warning" | "neutral" };
  fields?: { label: string; value: string }[];
  onEdit?: (newBody: string) => void;
}

export function RecommendationCard({
  type,
  title,
  subtitle,
  body,
  badge,
  fields,
  onEdit,
}: RecommendationCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(body);

  const typeColors = {
    budget: "border-l-4 border-l-gea-accent",
    creative: "border-l-4 border-l-gea-success",
    lifecycle: "border-l-4 border-l-gea-warning",
  };

  return (
    <Card className={typeColors[type]}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          {subtitle && (
            <p className="text-xs text-gea-muted">{subtitle}</p>
          )}
        </div>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full border border-gea-border bg-gea-bg p-2 text-sm focus:outline-none focus:border-gea-accent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onEdit?.(editText);
                setEditing(false);
              }}
              className="text-xs text-gea-accent hover:underline"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditText(body);
                setEditing(false);
              }}
              className="text-xs text-gea-muted hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className="text-sm text-gea-text cursor-pointer hover:bg-gea-bg/50 p-1 -m-1 transition-colors"
          onClick={() => onEdit && setEditing(true)}
          title={onEdit ? "Click to edit" : undefined}
        >
          {body}
        </p>
      )}

      {fields && fields.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {fields.map((f) => (
            <span key={f.label} className="text-xs text-gea-muted">
              <span className="font-medium">{f.label}:</span> {f.value}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
