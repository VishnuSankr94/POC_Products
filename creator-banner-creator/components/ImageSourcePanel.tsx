"use client";

import { useState, useRef, useEffect } from "react";
import type { Slide, AspectRatio } from "@/types/banner";
import { resizeImageToAspect, getAspectRatioNumber } from "@/lib/resizeToAspect";

function generateId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) resolve({ base64: match[2], mimeType: match[1] });
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ImageSourcePanelProps {
  aspectRatio: AspectRatio;
  onAddSlide: (slide: Slide) => void;
}

export default function ImageSourcePanel({ aspectRatio, onAddSlide }: ImageSourcePanelProps) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ratioNum = getAspectRatioNumber(aspectRatio);

  const [productFile, setProductFile] = useState<File | null>(null);
  const [productPreviewUrl, setProductPreviewUrl] = useState<string | null>(null);
  const [bannerInstructions, setBannerInstructions] = useState("");
  const [creatingBanner, setCreatingBanner] = useState(false);

  useEffect(() => {
    if (!productFile) {
      setProductPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(productFile);
    setProductPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [productFile]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setError(null);
    try {
      const blob = await resizeImageToAspect(file, ratioNum);
      const url = URL.createObjectURL(blob);
      onAddSlide({
        id: generateId(),
        imageUrl: url,
        imageBlob: blob,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
    e.target.value = "";
  };

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Enter a prompt");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate image");
      const imageUrl = data.imageUrl;
      if (!imageUrl) throw new Error("No image in response");
      onAddSlide({
        id: generateId(),
        imageUrl,
      });
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setProductFile(file && file.type.startsWith("image/") ? file : null);
    setError(null);
    e.target.value = "";
  };

  const handleCreateBannerFromProduct = async () => {
    if (!productFile) {
      setError("Upload a product image first");
      return;
    }
    const trimmed = bannerInstructions.trim();
    if (!trimmed) {
      setError("Enter instructions for the banner (style, layout, background, text placement, design)");
      return;
    }
    setError(null);
    setCreatingBanner(true);
    try {
      const { base64, mimeType } = await fileToBase64(productFile);
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          imageBase64: base64,
          imageMimeType: mimeType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create banner");
      const imageUrl = data.imageUrl;
      if (!imageUrl) throw new Error("No image in response");
      onAddSlide({ id: generateId(), imageUrl });
      setBannerInstructions("");
      setProductFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Banner creation failed");
    } finally {
      setCreatingBanner(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h2 className="font-semibold text-slate-800 dark:text-slate-200">Add image</h2>

      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Create banner from product</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
          Upload a product image and describe how the banner should look (style, layout, background, text placement).
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleProductFileChange}
          className="hidden"
          id="product-image-input"
        />
        <label
          htmlFor="product-image-input"
          className="block w-full py-2 px-3 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-sm font-medium text-center cursor-pointer"
        >
          {productFile ? productFile.name : "Choose product image"}
        </label>
        {productPreviewUrl && (
          <img
            src={productPreviewUrl}
            alt="Product"
            className="mt-2 w-full h-20 object-contain rounded border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700"
          />
        )}
        <textarea
          value={bannerInstructions}
          onChange={(e) => setBannerInstructions(e.target.value)}
          placeholder="e.g. Create a 16:9 banner. Put the product on the left. Gradient background blue to purple. Add headline 'Summer Sale' in bold white text on the right. Minimal, modern style."
          rows={3}
          className="mt-2 w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm resize-y"
          disabled={creatingBanner}
        />
        <button
          type="button"
          onClick={handleCreateBannerFromProduct}
          disabled={creatingBanner || !productFile || !bannerInstructions.trim()}
          className="mt-2 w-full py-2 px-3 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
        >
          {creatingBanner ? "Creating banner…" : "Create banner from product"}
        </button>
      </div>

      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Upload (add as slide)</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 px-3 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-sm font-medium"
        >
          Choose file
        </button>
      </div>

      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Or generate from text only</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the banner image..."
          rows={3}
          className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm resize-y"
          disabled={generating}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="mt-2 w-full py-2 px-3 rounded bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 hover:bg-slate-700 dark:hover:bg-slate-300 text-sm font-medium disabled:opacity-50"
        >
          {generating ? "Generating…" : "Generate image"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
