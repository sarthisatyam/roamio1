import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "showcase",
  puppeteerInstance: browser,
});

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: "/tmp/roamio-showcase-video-only.mp4",
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
});

await browser.close({ silent: false });

// Mux background music
const { execSync } = await import("child_process");
execSync(
  `ffmpeg -y -i /tmp/roamio-showcase-video-only.mp4 -i ${path.resolve(__dirname, "../public/audio/bgm.mp3")} -c:v copy -c:a aac -b:a 192k -shortest -map 0:v:0 -map 1:a:0 /mnt/documents/roamio-showcase-video.mp4`,
  { stdio: "inherit" }
);
console.log("Done! Video saved to /mnt/documents/roamio-showcase-video.mp4");
