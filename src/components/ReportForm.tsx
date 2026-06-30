"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  MapPin,
  Sparkles,
  Loader2,
  Camera,
  Video,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/types";
import type { AICategorization } from "@/lib/types";
import { DEFAULT_CENTER } from "@/lib/constants";

export default function ReportForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(DEFAULT_CENTER);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "none">("none");
  const [aiPreview, setAiPreview] = useState<AICategorization | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const analyzeDescription = useCallback(async (text: string) => {
    if (text.length < 10) {
      setAiPreview(null);
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text, locationHint: address }),
      });
      if (res.ok) setAiPreview(await res.json());
    } finally {
      setAnalyzing(false);
    }
  }, [address]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDescriptionChange(text: string) {
    setDescription(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyzeDescription(text), 600);
  }

  function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");

    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => setLocation(DEFAULT_CENTER)
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          title: aiPreview?.suggestedTitle,
          location: { ...location, address },
          mediaUrls: mediaPreview ? [mediaPreview] : [],
          mediaType,
        }),
      });
      if (res.ok) {
        const issue = await res.json();
        router.push(`/issues/${issue.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Describe the issue
        </label>
        <textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="e.g. Large pothole on Main Street near the school crossing. Very dangerous for cyclists..."
          rows={4}
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {(analyzing || aiPreview) && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <Sparkles className="h-4 w-4" />
            AI Analysis
            {analyzing && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          {aiPreview && (
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-emerald-700 shadow-sm">
                  {CATEGORY_LABELS[aiPreview.category]}
                </span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-amber-700 shadow-sm">
                  {aiPreview.priority} priority
                </span>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 shadow-sm">
                  {Math.round(aiPreview.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-xs text-emerald-700">{aiPreview.reasoning}</p>
              <p className="text-xs font-medium text-slate-600">
                Suggested title: {aiPreview.suggestedTitle}
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Photo or video evidence
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 transition hover:border-emerald-300 hover:bg-emerald-50/30">
          {mediaPreview ? (
            mediaType === "video" ? (
              <video src={mediaPreview} className="max-h-48 rounded-lg" controls />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-cover" />
            )
          ) : (
            <>
              <div className="mb-2 flex gap-3">
                <Camera className="h-8 w-8 text-slate-300" />
                <Video className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">
                Click to upload photo or video
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Supports JPG, PNG, MP4
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Location address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street, neighborhood, landmark"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            GPS coordinates
          </label>
          <button
            type="button"
            onClick={getLocation}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            <MapPin className="h-4 w-4" />
            Use my location ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || description.length < 10}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Submit Report (+50 points)
      </button>
    </form>
  );
}
