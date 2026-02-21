"use client";

import { ChangeEvent, useEffect, useState } from "react";

type VoiceStyle = "Standard" | "Energetic";

const STOCK_VIDEO_SAMPLES = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
];

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>("Standard");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [result, setResult] = useState<{
    stockVideos: string[];
    finalVideo: string;
    summary: string;
  } | null>(null);


  useEffect(() => {
    if (!videoFile) {
      setUploadedVideoUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(videoFile);
    setUploadedVideoUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [videoFile]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = event.target.files?.[0] ?? null;
    if (type === "image") {
      setImageFile(file);
      return;
    }
    setVideoFile(file);
  };

  const handleGenerateAd = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setResult({
      stockVideos: STOCK_VIDEO_SAMPLES,
      finalVideo: uploadedVideoUrl || STOCK_VIDEO_SAMPLES[0],
      summary: `Created an ad concept in ${voiceStyle} style using your prompt${
        imageFile ? " and uploaded image" : ""
      }${videoFile ? " with uploaded video context" : ""}.`
    });

    setIsGenerating(false);
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Bode Agency AI</h1>
        <p>Create quick ad drafts with prompt + media inputs.</p>

        <label htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          placeholder="Describe your product and target audience..."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />

        <label htmlFor="imageUpload">Optional image upload</label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={(event) => handleFileChange(event, "image")}
        />

        <label htmlFor="videoUpload">Optional video upload</label>
        <input
          id="videoUpload"
          type="file"
          accept="video/*"
          onChange={(event) => handleFileChange(event, "video")}
        />

        <label htmlFor="voiceStyle">Voice style</label>
        <select
          id="voiceStyle"
          value={voiceStyle}
          onChange={(event) => setVoiceStyle(event.target.value as VoiceStyle)}
        >
          <option value="Standard">Standard</option>
          <option value="Energetic">Energetic</option>
        </select>

        <button type="button" onClick={handleGenerateAd} disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? "Generating..." : "Generate Ad"}
        </button>
      </section>

      <section className="card results">
        <h2>Generated Output</h2>
        {!result ? (
          <p>Your stock video picks and final edit will appear here.</p>
        ) : (
          <>
            <p>{result.summary}</p>
            <h3>Stock videos</h3>
            <div className="videoGrid">
              {result.stockVideos.map((videoUrl) => (
                <video key={videoUrl} controls src={videoUrl} />
              ))}
            </div>

            <h3>Final video</h3>
            <video controls src={result.finalVideo} className="finalVideo" />
          </>
        )}
      </section>
    </main>
  );
}
