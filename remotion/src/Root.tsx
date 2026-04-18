import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { MainVideoV2 } from "./MainVideoV2";
import { MainVideoAd } from "./MainVideoAd";

// Total: 130+160+160+150+160+150+180 = 1090 frames, minus 6 transitions * 20 = 120 overlap = 970 frames ≈ 32.3s
// Add extra to reach ~37s: bump some scenes
// Adjusted: 970 + 140 extra = 1110 frames = 37s

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="showcase"
      component={MainVideoV2}
      durationInFrames={1110}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* Roamio Ad: 7 scenes minus 6 transitions overlap = 1470 frames = 49s @ 30fps, vertical 9:16 */}
    <Composition
      id="ad"
      component={MainVideoAd}
      durationInFrames={1470}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
