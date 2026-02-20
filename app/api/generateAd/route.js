import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import axios from "axios";
import OpenAI from "openai";
import googleTTS from "google-tts-api";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

export const runtime = "nodejs";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

function sanitizeForDrawtext(input) {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\\\'")
    .replace(/\n/g, " ");
}

function createVideo({ imagePath, audioPath, outputPath, captionText }) {
  return new Promise((resolve, reject) => {
    // Build a 1080x1920 vertical video, loop image to audio duration,
    // and draw an easy-to-read caption near the bottom.
    ffmpeg()
      .input(imagePath)
      .inputOptions(["-loop 1"])
      .input(audioPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-shortest",
        "-pix_fmt yuv420p",
        "-r 30",
        "-tune stillimage",
        "-vf scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,drawtext=fontcolor=white:fontsize=52:box=1:boxcolor=black@0.4:boxborderw=18:x=(w-text_w)/2:y=h-(text_h*2.2):text='" +
          sanitizeForDrawtext(captionText) +
          "'"
      ])
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
}

export async function POST(request) {
  let tempDir;

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY environment variable." }, { status: 500 });
    }

    const formData = await request.formData();
    const prompt = formData.get("prompt");
    const image = formData.get("image");

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    if (!image || typeof image === "string") {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    // 1) Generate short ad script/caption text.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an ad copywriter. Return one short UGC ad voiceover script (max 2 sentences, under 220 chars). No emojis."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8
    });

    const script = completion.choices?.[0]?.message?.content?.trim();
    if (!script) {
      throw new Error("Model did not return an ad script.");
    }

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ugc-ad-"));
    const imageExt = path.extname(image.name || "") || ".png";
    const imagePath = path.join(tempDir, `input${imageExt}`);
    const audioPath = path.join(tempDir, "voiceover.mp3");
    const outputPath = path.join(tempDir, `ugc-ad-${crypto.randomUUID()}.mp4`);

    // 2) Write uploaded image to disk.
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(imagePath, imageBuffer);

    // 3) Convert script to speech using Google TTS (free endpoint wrapper).
    const ttsUrl = googleTTS.getAudioUrl(script, {
      lang: "en",
      slow: false,
      host: "https://translate.google.com"
    });
    const ttsResponse = await axios.get(ttsUrl, { responseType: "arraybuffer" });
    await fs.writeFile(audioPath, Buffer.from(ttsResponse.data));

    // 4) Stitch image + voice + caption into vertical MP4.
    await createVideo({ imagePath, audioPath, outputPath, captionText: script });

    const finalBuffer = await fs.readFile(outputPath);

    return new NextResponse(finalBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "attachment; filename=ugc-ad.mp4"
      }
    });
  } catch (error) {
    console.error("generateAd failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate ad." },
      { status: 500 }
    );
  } finally {
    // Always clean temporary files to keep serverless environment tidy.
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
