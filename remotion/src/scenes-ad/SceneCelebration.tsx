import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const TEAL = "#04a5c2";

const Bubble: React.FC<{ from: number; text: string; sub?: string; align: "left" | "right"; color?: string; top: string }> = ({ from, text, sub, align, color = "white", top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const op = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [20, 0]);
  return (
    <div style={{
      position: "absolute",
      [align]: 40,
      top,
      maxWidth: 460,
      opacity: op,
      transform: `translateY(${y}px)`,
      background: color,
      color: color === "white" ? "#222" : "white",
      padding: "14px 20px",
      borderRadius: align === "left" ? "20px 20px 20px 4px" : "20px 20px 4px 20px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      fontWeight: 600,
      fontSize: 28,
      lineHeight: 1.25,
    }}>
      {sub && <div style={{ fontSize: 16, fontWeight: 700, color: TEAL, marginBottom: 4 }}>{sub}</div>}
      {text}
    </div>
  );
};

export const SceneCelebration = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const zoom = interpolate(frame, [0, durationInFrames], [1.05, 1.18]);
  const imgY = interpolate(frame, [0, durationInFrames], [0, -30]);
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const titleS = spring({ frame: frame - 5, fps, config: { damping: 12 } });
  const titleScale = interpolate(titleS, [0, 1], [0.6, 1]);

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${zoom}) translateY(${imgY}px)`,
        opacity: fadeIn,
      }}>
        <Img src={staticFile("images/ad/scene1-celebration.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%)" }} />

      {/* Top tag */}
      <div style={{
        position: "absolute", top: 80, left: 40, right: 40,
        textAlign: "center",
        opacity: fadeIn,
        transform: `scale(${titleScale})`,
      }}>
        <div style={{ display: "inline-block", background: CORAL, color: "white", padding: "10px 22px", borderRadius: 30, fontWeight: 800, fontSize: 26, letterSpacing: 1 }}>
          BOARDS KHATAM 🎉
        </div>
      </div>

      <Sequence from={20}>
        <Bubble from={0} text="Boards khatam… ab tension khatam 😎" sub="KABIR" align="left" top="38%" />
      </Sequence>
      <Sequence from={55}>
        <Bubble from={0} text="Guys suno… trip? Mountains, cafés, full freedom! 🏔️" sub="AARAV" align="right" top="55%" color={CORAL} />
      </Sequence>
      <Sequence from={100}>
        <Bubble from={0} text="DONEEE! 🔥" sub="ALL" align="left" top="74%" color={TEAL} />
      </Sequence>
    </AbsoluteFill>
  );
};
