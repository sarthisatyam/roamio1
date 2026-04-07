import { AbsoluteFill, useCurrentFrame, interpolate, Sequence, Audio, staticFile } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Explore } from "./scenes/Scene2Explore";
import { Scene3Companion } from "./scenes/Scene3Companion";
import { Scene4Journey } from "./scenes/Scene4Journey";
import { Scene5Smart } from "./scenes/Scene5Smart";
import { Scene6CTA } from "./scenes/Scene6CTA";

const CORAL = "#d94f6e";
const TEAL = "#04a5c2";
const DARK = "#1a2332";

export const MainVideo = () => {
  const frame = useCurrentFrame();

  // Persistent floating shapes
  const circleY1 = Math.sin(frame * 0.02) * 30;
  const circleY2 = Math.cos(frame * 0.015) * 40;

  return (
    <AbsoluteFill style={{ background: DARK }}>
      {/* Background music */}
      <Audio src={staticFile("audio/bgm.mp3")} volume={0.4} />
      {/* Persistent floating accents */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${CORAL}33, transparent)`,
          top: 200 + circleY1,
          right: -80,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${TEAL}33, transparent)`,
          bottom: 300 + circleY2,
          left: -60,
          zIndex: 0,
        }}
      />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2Explore />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene3Companion />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene4Journey />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene5Smart />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Scene6CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
