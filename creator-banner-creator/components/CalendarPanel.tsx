"use client";

import { useState, useEffect } from "react";
import {
  getCelebrationsForDate,
  getRegionFromLocale,
  REGIONS,
  type RegionCode,
  type Celebration,
} from "@/lib/calendar";
import type { Slide } from "@/types/banner";

function generateId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface CalendarPanelProps {
  onAddSlide: (slide: Slide) => void;
  productName: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPanel({ onAddSlide, productName }: CalendarPanelProps) {
  const [region, setRegion] = useState<RegionCode>("in");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<{ month: number; day: number } | null>(null);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const code = getRegionFromLocale(
        typeof navigator !== "undefined" ? navigator.language : "en-IN"
      );
      setRegion(code);
    } catch {
      setRegion("in");
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setCelebrations([]);
      return;
    }
    const list = getCelebrationsForDate(
      region,
      selectedDate.month + 1,
      selectedDate.day
    );
    setCelebrations(list);
  }, [region, selectedDate]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handleCreateBanner = async (celebrationName: string) => {
    const product = productName.trim() || "your product";
    const prompt = `Festive ${celebrationName} banner featuring ${product}, professional marketing banner, high quality, clean design`;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate image");
      const imageUrl = data.imageUrl;
      if (!imageUrl) throw new Error("No image in response");
      onAddSlide({
        id: generateId(),
        imageUrl,
        caption: `${celebrationName} – ${product}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const today = new Date();
  const isToday = (day: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h2 className="font-semibold text-slate-800 dark:text-slate-200">Calendar</h2>

      <div>
        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Region</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as RegionCode)}
          className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="flex-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-sm"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-24 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-sm"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="font-medium text-slate-500 dark:text-slate-400 py-1">
            {d}
          </span>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const selected =
            selectedDate?.month === month &&
            selectedDate?.day === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDate({ month, day })}
              className={`py-1.5 rounded text-sm ${
                selected
                  ? "bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900"
                  : "hover:bg-slate-100 dark:hover:bg-slate-600"
              } ${isToday(day) ? "ring-2 ring-emerald-500" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {celebrations.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Celebrations on this date
          </p>
          <ul className="space-y-2">
            {celebrations.map((c) => (
              <li key={c.date + c.name} className="flex items-center justify-between gap-2">
                <span className="text-sm">{c.name}</span>
                <button
                  type="button"
                  onClick={() => handleCreateBanner(c.name)}
                  disabled={generating}
                  className="py-1.5 px-2 rounded bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-600 dark:hover:bg-slate-200 disabled:opacity-50"
                >
                  {generating ? "Generating…" : "Create banner"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}