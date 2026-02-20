"use client";

import { useState } from "react";

export default function HomePage() {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!image || !prompt.trim()) {
      setError("Please upload an image and enter a prompt.");
      return;
    }

    setError("");
    setDownloadUrl("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("prompt", prompt);

      const response = await fetch("/api/generateAd", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to generate ad video.");
      }

      const videoBlob = await response.blob();
      const blobUrl = URL.createObjectURL(videoBlob);
      setDownloadUrl(blobUrl);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#111827",
          color: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
        }}
      >
        <h1 style={{ marginTop: 0 }}>AI UGC Ad Generator</h1>
        <p style={{ color: "#9ca3af" }}>Upload a product image and describe your target ad angle.</p>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ display: "block", marginBottom: 6 }}>Upload image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            style={{ width: "100%" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ display: "block", marginBottom: 6 }}>Ad prompt</span>
          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a punchy ad for a vitamin gummy focused on morning energy for busy moms."
            style={{ width: "100%", borderRadius: 8, padding: 10 }}
          />
        </label>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          style={{
            background: isLoading ? "#6b7280" : "#22c55e",
            color: "#111827",
            fontWeight: 700,
            border: 0,
            borderRadius: 10,
            padding: "12px 18px",
            cursor: isLoading ? "not-allowed" : "pointer"
          }}
        >
          {isLoading ? "Generating..." : "Generate Ad Video"}
        </button>

        {isLoading && <p style={{ marginTop: 12 }}>⏳ Creating script, voiceover, and final video...</p>}
        {error && <p style={{ marginTop: 12, color: "#fca5a5" }}>Error: {error}</p>}

        {downloadUrl && (
          <p style={{ marginTop: 16 }}>
            ✅ Video ready: {" "}
            <a href={downloadUrl} download="ugc-ad.mp4" style={{ color: "#86efac", fontWeight: 700 }}>
              Download MP4
            </a>
          </p>
        )}
      </section>
    </main>
  );
}
