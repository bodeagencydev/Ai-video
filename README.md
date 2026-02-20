# AI UGC Ad Generator (Next.js 14)

A complete App Router project that:
1. Accepts an uploaded product image + ad prompt.
2. Generates a short ad script with OpenAI.
3. Converts script to speech (Google TTS free endpoint wrapper).
4. Uses FFmpeg to produce a 9:16 MP4 with caption text.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

Create `.env.local`:

```env
OPENAI_API_KEY=your_openai_key_here
```

## FFmpeg installation notes

This project uses `ffmpeg-static`, which ships a binary for many platforms and works on most local/dev environments and serverless builds.

If FFmpeg is missing on your machine, install manually:

- macOS (Homebrew): `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt-get update && sudo apt-get install -y ffmpeg`
- Windows (choco): `choco install ffmpeg`

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add `OPENAI_API_KEY` in Project Settings → Environment Variables.
4. Deploy.

> Note: Video generation with FFmpeg is CPU heavy. For production-scale workloads, move processing to a background queue/worker.

## API endpoint

`POST /api/generateAd`
- Multipart fields:
  - `image`: image file
  - `prompt`: string
- Returns: `video/mp4`

## Error handling and cleanup

- API validates prompt/image and environment configuration.
- API returns JSON errors with proper status codes for common failures.
- Temporary files are created in OS temp dir and always removed in `finally`.
