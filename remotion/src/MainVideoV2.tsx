import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { S1Intro } from "./scenes-v2/S1Intro";
import { S2Home } from "./scenes-v2/S2Home";
import { S3Companion } from "./scenes-v2/S3Companion";
import { S4Bookings } from "./scenes-v2/S4Bookings";
import { S5Journey } from "./scenes-v2/S5Journey";
import { S6AIBot } from "./scenes-v2/S6AIBot";
import { S7CTA } from "./scenes-v2/S7CTA";

const CORAL = "#d94f6e";

export const MainVideoV2 = () => {
  const frame = useCurrentFrame();
  const c1Y = Math.sin(frame * 0.02) * 30;
  const c2Y = Math.cos(frame * 0.015) * 40;

  return (
    <AbsoluteFill style={{ background: CORAL }}>
      {/* Floating accents */}
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(185,69,90,0.3), transparent)",
        top: 200 + c1Y, right: -80, zIndex: 0,
      }} />
      <div style={{
        position: "absolute", width: 250, height: 250, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent)",
        bottom: 300 + c2Y, left: -60, zIndex: 0,
      }} />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={130}>
          <S1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <S2Home />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <S3Companion />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <S4Bookings />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={160}>
          <S5Journey />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <S6AIBot />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <S7CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
