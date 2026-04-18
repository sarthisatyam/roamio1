import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { SceneCelebration } from "./scenes-ad/SceneCelebration";
import { SceneParents } from "./scenes-ad/SceneParents";
import { SceneTwist1 } from "./scenes-ad/SceneTwist1";
import { SceneTwist2 } from "./scenes-ad/SceneTwist2";
import { SceneAlone } from "./scenes-ad/SceneAlone";
import { SceneMontage } from "./scenes-ad/SceneMontage";
import { SceneTagline } from "./scenes-ad/SceneTagline";

// Total timing (30fps):
// Celebration 180 (6s) + Parents 270 (9s) + Twist1 165 (5.5s) + Twist2 165 (5.5s)
// + Alone 240 (8s) + Montage 360 (12s) + Tagline 180 (6s) = 1560 frames
// minus 6 transitions * 15 = 90 overlap = 1470 frames = 49s

export const MainVideoAd = () => {
  const t = (n: number) => springTiming({ config: { damping: 200 }, durationInFrames: n });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={180}>
          <SceneCelebration />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t(15)} />

        <TransitionSeries.Sequence durationInFrames={270}>
          <SceneParents />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={t(15)} />

        <TransitionSeries.Sequence durationInFrames={165}>
          <SceneTwist1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t(15)} />

        <TransitionSeries.Sequence durationInFrames={165}>
          <SceneTwist2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t(20)} />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneAlone />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t(20)} />

        <TransitionSeries.Sequence durationInFrames={360}>
          <SceneMontage />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t(20)} />

        <TransitionSeries.Sequence durationInFrames={180}>
          <SceneTagline />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
