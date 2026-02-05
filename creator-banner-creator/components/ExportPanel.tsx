"use client";

import { useState } from "react";
import { buildBannerZip } from "@/lib/export";
import type { Slide, AspectRatio } from "@/types/banner";

interface ExportPanelProps {
  slides: Slide[];
  aspectRatio: AspectRatio;
  autoplay: boolean;
  autoplaySpeed: number;
}

export default function ExportPanel({
  slides,
  aspectRatio,
  autoplay,
  autoplaySpeed,
}: ExportPanelProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (slides.length === 0) {
      setError("Add at least one slide to download.");
      return;
    }
    setError(null);
    setDownloading(true);
    try {
      const blob = await buildBannerZip({
        slides,
        aspectRatio,
        autoplay,
        autoplaySpeed,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "banner-carousel.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h2 className="font-semibold text-slate-800 dark:text-slate-200">Download</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Export your banner as a ZIP with <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">index.html</code>, <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">images/</code>, and <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">banner-config.json</code>. Use the HTML file on any website.
      </p>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading || slides.length === 0}
        className="w-full py-2 px-3 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
      >
        {downloading ? "Preparing…" : "Download banner"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
