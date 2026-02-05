"use client";

import { useState } from "react";
import BannerCarousel from "@/components/BannerCarousel";
import ImageSourcePanel from "@/components/ImageSourcePanel";
import CalendarPanel from "@/components/CalendarPanel";
import ExportPanel from "@/components/ExportPanel";
import type { Slide, AspectRatio } from "@/types/banner";

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9" },
  { value: "3:1", label: "3:1" },
  { value: "4:1", label: "4:1" },
  { value: "1:1", label: "1:1" },
];

export default function EditorPage() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [autoplay, setAutoplay] = useState(true);
  const [autoplaySpeed, setAutoplaySpeed] = useState(5);
  const [productName, setProductName] = useState("");

  const addSlide = (slide: Slide) => {
    setSlides((prev) => [...prev, slide]);
  };

  const removeSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const reorderSlides = (fromIndex: number, toIndex: number) => {
    setSlides((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  };

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
        <h1 className="text-xl font-semibold">Creator Banner Creator</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Create carousels from uploads or AI. Pick a region and date for celebration banners.
        </p>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="text-sm font-medium">Aspect ratio</span>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-sm"
                >
                  {ASPECT_RATIOS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Autoplay</span>
              </label>
              {autoplay && (
                <label className="flex items-center gap-2">
                  <span className="text-sm">Speed (s)</span>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    value={autoplaySpeed}
                    onChange={(e) => setAutoplaySpeed(Number(e.target.value))}
                    className="w-14 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-sm"
                  />
                </label>
              )}
            </div>
            <BannerCarousel
              slides={slides}
              aspectRatio={aspectRatio}
              autoplay={autoplay}
              autoplaySpeed={autoplaySpeed}
              onRemoveSlide={removeSlide}
              onReorderSlides={reorderSlides}
              onUpdateSlide={updateSlide}
              editable
            />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Product name (for celebration banners)</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Summer Sale"
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
            />
          </div>
          <ImageSourcePanel
            aspectRatio={aspectRatio}
            onAddSlide={addSlide}
          />
          <CalendarPanel
            onAddSlide={addSlide}
            productName={productName}
          />
          <ExportPanel
            slides={slides}
            aspectRatio={aspectRatio}
            autoplay={autoplay}
            autoplaySpeed={autoplaySpeed}
          />
        </aside>
      </main>
    </div>
  );
}
