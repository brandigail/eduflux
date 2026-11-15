/**
 * Generates the lesson clips in public/videos as animated title slides.
 * They are synthetic (drawn on a canvas and encoded with the browser's VideoEncoder),
 * so they carry no licence and keep the repo small. Run with: npm run videos
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { CLIP_SECONDS, DEMO_COURSES } from "../db/demo-data";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const outDir = join(root, "public", "videos");
mkdirSync(outDir, { recursive: true });

const PALETTES: Record<string, [string, string]> = {
  "web-fundamentals": ["#4f46e5", "#7c3aed"],
  "typescript-for-js-developers": ["#0e7490", "#1d4ed8"],
  "data-literacy": ["#047857", "#0f766e"],
};

interface ClipSpec {
  file: string;
  courseTitle: string;
  lessonTitle: string;
  lessonNumber: number;
  lessonCount: number;
  chapters: { at: number; title: string }[];
  colors: [string, string];
}

const clips: ClipSpec[] = DEMO_COURSES.flatMap((course) =>
  course.lessons.map((lesson, i) => ({
    file: `${course.slug}-${i + 1}.webm`,
    courseTitle: course.title.split(":")[0],
    lessonTitle: lesson.title,
    lessonNumber: i + 1,
    lessonCount: course.lessons.length,
    chapters: lesson.chapters,
    colors: PALETTES[course.slug] ?? ["#4f46e5", "#7c3aed"],
  })),
);

const muxerScript = join(root, "node_modules", "webm-muxer", "build", "webm-muxer.js");

async function main(): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // tsx instruments functions with a __name helper that does not exist inside the browser page.
  await page.addInitScript("window.__name = (fn) => fn;");
  // WebCodecs only exists in secure contexts, and about:blank is not one, so serve the page from a routed https URL.
  await page.route("https://clips.eduflux.test/", (route) =>
    route.fulfill({ contentType: "text/html", body: "<canvas id=c width=640 height=360></canvas>" }),
  );
  await page.goto("https://clips.eduflux.test/");
  await page.addScriptTag({ path: muxerScript });

  for (const clip of clips) {
    const base64: string = await page.evaluate(
      async ({ clip: spec, seconds }) => {
        const FPS = 30;
        const W = 640;
        const H = 360;
        const canvas = document.getElementById("c") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");

        const lib = (window as unknown as { WebMMuxer: { Muxer: new (o: unknown) => MuxerLike; ArrayBufferTarget: new () => { buffer: ArrayBuffer } } }).WebMMuxer;
        interface MuxerLike {
          addVideoChunk(chunk: EncodedVideoChunk, meta?: EncodedVideoChunkMetadata): void;
          finalize(): void;
        }
        const target = new lib.ArrayBufferTarget();
        const muxer = new lib.Muxer({ target, video: { codec: "V_VP8", width: W, height: H, frameRate: FPS } });
        const encoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => {
            throw e;
          },
        });
        encoder.configure({ codec: "vp8", width: W, height: H, bitrate: 220_000, framerate: FPS });

        const total = seconds * FPS;
        for (let f = 0; f < total; f++) {
          const t = f / FPS;
          const g = ctx.createLinearGradient(0, 0, W, H);
          g.addColorStop(0, spec.colors[0]);
          g.addColorStop(1, spec.colors[1]);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);

          // drifting translucent circles so motion is visible when seeking or pausing
          for (let k = 0; k < 5; k++) {
            const x = (W * ((k * 0.23 + t * 0.04 * (k + 1)) % 1.2)) - 60;
            const y = 70 + k * 52 + Math.sin(t * 1.4 + k) * 14;
            ctx.beginPath();
            ctx.arc(x, y, 26 + k * 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.05 + k * 0.015})`;
            ctx.fill();
          }

          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.font = "600 20px system-ui, sans-serif";
          ctx.fillText(`${spec.courseTitle}  ·  Lesson ${spec.lessonNumber} of ${spec.lessonCount}`, 32, 48);

          ctx.fillStyle = "#ffffff";
          ctx.font = "700 44px system-ui, sans-serif";
          const words = spec.lessonTitle.split(" ");
          let line = "";
          let y = 150;
          for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > W - 64 && line) {
              ctx.fillText(line, 32, y);
              line = word;
              y += 54;
            } else line = test;
          }
          ctx.fillText(line, 32, y);

          let idx = 0;
          spec.chapters.forEach((c, i) => {
            if (t >= c.at) idx = i;
          });
          const chapter = spec.chapters[idx];
          const fade = Math.min(1, (t - chapter.at) / 0.5);
          ctx.globalAlpha = Math.max(0.15, fade);
          ctx.fillStyle = "rgba(0,0,0,0.28)";
          ctx.fillRect(32, 250, W - 64, 56);
          ctx.fillStyle = "#ffffff";
          ctx.font = "600 26px system-ui, sans-serif";
          ctx.fillText(`${idx + 1}. ${chapter.title}`, 48, 287);
          ctx.globalAlpha = 1;

          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.fillRect(0, H - 8, W, 8);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, H - 8, (W * t) / seconds, 8);

          const frame = new VideoFrame(canvas, { timestamp: Math.round((f * 1_000_000) / FPS) });
          encoder.encode(frame, { keyFrame: f % 15 === 0 });
          frame.close();
          if (encoder.encodeQueueSize > 10) await new Promise((r) => setTimeout(r, 5));
        }
        await encoder.flush();
        muxer.finalize();

        const bytes = new Uint8Array(target.buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        return btoa(binary);
      },
      { clip, seconds: CLIP_SECONDS },
    );
    const buf = Buffer.from(base64, "base64");
    writeFileSync(join(outDir, clip.file), buf);
    console.log(`${clip.file}  ${(buf.length / 1024).toFixed(0)} KB`);
  }
  await browser.close();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
