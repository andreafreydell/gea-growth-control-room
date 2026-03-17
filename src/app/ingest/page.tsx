"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/lib/store";
import { metaAdapter } from "@/lib/adapters/meta";
import { ga4Adapter } from "@/lib/adapters/ga4";
import { shopifyAdapter } from "@/lib/adapters/shopify";
import { klaviyoAdapter } from "@/lib/adapters/klaviyo";
import type { ValidationResult } from "@/lib/adapters/types";

export default function IngestPage() {
  const router = useRouter();
  const { setCurrentWeek, setPreviousWeek, weekOf, setWeekOf, currentWeek } =
    useAppStore();

  const [validations, setValidations] = useState<
    Record<string, ValidationResult | null>
  >({
    meta: null,
    ga4: null,
    shopify: null,
    klaviyo: null,
  });

  const [showPrevious, setShowPrevious] = useState(false);
  const [prevValidations, setPrevValidations] = useState<
    Record<string, ValidationResult | null>
  >({
    meta: null,
    ga4: null,
    shopify: null,
    klaviyo: null,
  });

  const handleMetaData = useCallback(
    (raw: string, isPrevious = false) => {
      const rows = metaAdapter.parseCSV(raw);
      const normalized = metaAdapter.normalize(rows);
      const validation = metaAdapter.validate(normalized);
      if (isPrevious) {
        setPreviousWeek({ meta: normalized });
        setPrevValidations((v) => ({ ...v, meta: validation }));
      } else {
        setCurrentWeek({ meta: normalized });
        setValidations((v) => ({ ...v, meta: validation }));
      }
    },
    [setCurrentWeek, setPreviousWeek]
  );

  const handleGA4Data = useCallback(
    (raw: string, isPrevious = false) => {
      const rows = ga4Adapter.parseCSV(raw);
      const normalized = ga4Adapter.normalize(rows);
      const validation = ga4Adapter.validate(normalized);
      if (isPrevious) {
        setPreviousWeek({ ga4: normalized });
        setPrevValidations((v) => ({ ...v, ga4: validation }));
      } else {
        setCurrentWeek({ ga4: normalized });
        setValidations((v) => ({ ...v, ga4: validation }));
      }
    },
    [setCurrentWeek, setPreviousWeek]
  );

  const handleShopifyData = useCallback(
    (raw: string, isPrevious = false) => {
      const rows = shopifyAdapter.parseCSV(raw);
      const normalized = shopifyAdapter.normalize(rows);
      const validation = shopifyAdapter.validate(normalized);
      if (isPrevious) {
        setPreviousWeek({ shopify: normalized });
        setPrevValidations((v) => ({ ...v, shopify: validation }));
      } else {
        setCurrentWeek({ shopify: normalized });
        setValidations((v) => ({ ...v, shopify: validation }));
      }
    },
    [setCurrentWeek, setPreviousWeek]
  );

  const handleKlaviyoData = useCallback(
    (raw: string, isPrevious = false) => {
      const rows = klaviyoAdapter.parseCSV(raw);
      const normalized = klaviyoAdapter.normalize(rows);
      const validation = klaviyoAdapter.validate(normalized);
      if (isPrevious) {
        setPreviousWeek({ klaviyo: normalized });
        setPrevValidations((v) => ({ ...v, klaviyo: validation }));
      } else {
        setCurrentWeek({ klaviyo: normalized });
        setValidations((v) => ({ ...v, klaviyo: validation }));
      }
    },
    [setCurrentWeek, setPreviousWeek]
  );

  const hasAnyData =
    currentWeek.meta !== null ||
    currentWeek.ga4 !== null ||
    currentWeek.shopify !== null ||
    currentWeek.klaviyo !== null;

  const allValid = Object.values(validations).every(
    (v) => v === null || v.valid
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Data Ingest</h2>
          <p className="text-sm text-gea-muted">
            Upload or paste your weekly exports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gea-muted">Week of:</label>
          <input
            type="date"
            value={weekOf}
            onChange={(e) => setWeekOf(e.target.value)}
            className="border border-gea-border bg-gea-card px-3 py-1.5 text-sm focus:outline-none focus:border-gea-accent"
          />
        </div>
      </div>

      {/* Current week data */}
      <div>
        <h3 className="text-sm font-medium text-gea-muted mb-3 uppercase tracking-wide">
          Current Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUploader
            source="meta"
            label="Meta Ads"
            requiredColumns={metaAdapter.requiredColumns}
            onData={(raw) => handleMetaData(raw)}
            validation={validations.meta}
          />
          <FileUploader
            source="ga4"
            label="GA4 Events"
            requiredColumns={ga4Adapter.requiredColumns}
            onData={(raw) => handleGA4Data(raw)}
            validation={validations.ga4}
          />
          <FileUploader
            source="shopify"
            label="Shopify"
            requiredColumns={shopifyAdapter.requiredColumns}
            onData={(raw) => handleShopifyData(raw)}
            validation={validations.shopify}
          />
          <FileUploader
            source="klaviyo"
            label="Klaviyo"
            requiredColumns={klaviyoAdapter.requiredColumns}
            onData={(raw) => handleKlaviyoData(raw)}
            validation={validations.klaviyo}
          />
        </div>
      </div>

      {/* Previous week toggle */}
      <div>
        <button
          onClick={() => setShowPrevious(!showPrevious)}
          className="text-sm text-gea-accent hover:underline"
        >
          {showPrevious ? "Hide" : "Add"} previous week data (for WoW comparison)
        </button>

        {showPrevious && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <FileUploader
              source="meta"
              label="Meta Ads (Previous)"
              requiredColumns={metaAdapter.requiredColumns}
              onData={(raw) => handleMetaData(raw, true)}
              validation={prevValidations.meta}
            />
            <FileUploader
              source="ga4"
              label="GA4 Events (Previous)"
              requiredColumns={ga4Adapter.requiredColumns}
              onData={(raw) => handleGA4Data(raw, true)}
              validation={prevValidations.ga4}
            />
            <FileUploader
              source="shopify"
              label="Shopify (Previous)"
              requiredColumns={shopifyAdapter.requiredColumns}
              onData={(raw) => handleShopifyData(raw, true)}
              validation={prevValidations.shopify}
            />
            <FileUploader
              source="klaviyo"
              label="Klaviyo (Previous)"
              requiredColumns={klaviyoAdapter.requiredColumns}
              onData={(raw) => handleKlaviyoData(raw, true)}
              validation={prevValidations.klaviyo}
            />
          </div>
        )}
      </div>

      {/* Status summary */}
      <Card title="Data Status">
        <div className="flex gap-4">
          {(["meta", "ga4", "shopify", "klaviyo"] as const).map((source) => (
            <div key={source} className="flex items-center gap-2">
              <span className="text-xs uppercase font-medium">{source}</span>
              {validations[source] ? (
                validations[source]!.valid ? (
                  <Badge variant="success">Ready</Badge>
                ) : (
                  <Badge variant="danger">Error</Badge>
                )
              ) : (
                <Badge variant="neutral">No data</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Continue button */}
      <div className="flex justify-end">
        <Button
          disabled={!hasAnyData || !allValid}
          onClick={() => router.push("/analysis")}
        >
          Continue to Analysis
        </Button>
      </div>
    </div>
  );
}
