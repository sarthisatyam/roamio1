import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Img, staticFile, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const TEAL = "#04a5c2";

const ImgPan: React.FC<{ src: string; durationInFrames: number; direction?: "lr" | "rl" | "in" }> = ({ src, durationInFrames, direction = "in" }) => {
  const frame = useCurrentFrame();
  const t = frame / durationInFrames;
  let transform = "";
  if (direction === "in") transform = `scale(${interpolate(t, [0, 1], [1.05, 1.2])})`;
  else if (direction === "lr") transform = `scale(1.15) translateX(${interpolate(t, [0, 1], [-40, 40])}px)`;
  else if (direction === "rl") transform = `scale(1.15) translateX(${interpolate(t, [0, 1], [40, -40])}px)`;
  const op = interpolate(frame, [0, 8, durationInFrames - 8, durationInFrames], [0, 1, 1, 0]);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      <div style={{ position: "absolute", inset: 0, transform }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)" }} />
    </div>
  );
};

const VOLine: React.FC<{ from: number; duration: number; text: string; bottom?: number; highlight?: string }> = ({ from, duration, text, bottom = 220, highlight }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const op = interpolate(local, [0, 10, duration - 10, duration], [0, 1, 1, 0]);
  const y = interpolate(local, [0, 12], [16, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", left: 40, right: 40, bottom,
      textAlign: "center", opacity: op, transform: `translateY(${y}px)`,
    }}>
      <div style={{
        display: "inline-block",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        padding: "12px 22px", borderRadius: 20,
        color: "white", fontSize: 30, fontWeight: 600,
        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
      }}>
        {highlight ? (
          <>
            {text} <span style={{ color: TEAL, fontWeight: 800 }}>{highlight}</span>
          </>
        ) : text}
      </div>
    </div>
  );
};

export const SceneMontage = () => {
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily }}>
      {/* Three panning shots */}
      <Sequence from={0} durationInFrames={120}>
        <ImgPan src="images/ad/montage-mountain.jpg" durationInFrames={120} direction="lr" />
      </Sequence>
      <Sequence from={120} durationInFrames={120}>
        <ImgPan src="images/ad/montage-cafe.jpg" durationInFrames={120} direction="in" />
      </Sequence>
      <Sequence from={240} durationInFrames={120}>
        <ImgPan src="images/ad/montage-scooter.jpg" durationInFrames={120} direction="rl" />
      </Sequence>

      {/* Top tag */}
      <div style={{ position: "absolute", top: 80, left: 40, right: 40, textAlign: "center" }}>
        <div style={{ display: "inline-block", background: CORAL, color: "white", padding: "10px 22px", borderRadius: 30, fontWeight: 800, fontSize: 26, letterSpacing: 1, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          SOLO. NOT ALONE. ✨
        </div>
      </div>

      {/* Voiceover lines */}
      <VOLine from={10} duration={110} text="Kabhi kabhi plans" highlight="toot jaate hain…" />
      <VOLine from={130} duration={110} text="Log saath" highlight="nahi aa paate…" />
      <VOLine from={250} duration={110} text="Par iska matlab nahi ki" highlight="tum ruk jao." />
    </AbsoluteFill>
  );
};
