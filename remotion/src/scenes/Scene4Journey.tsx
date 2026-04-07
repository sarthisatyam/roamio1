import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const Scene4Journey = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const features = [
    { icon: "📋", text: "Plan itinerary together", delay: 15 },
    { icon: "💰", text: "Split expenses fairly", delay: 30 },
    { icon: "🗳️", text: "Vote on activities", delay: 45 },
    { icon: "💬", text: "Group & trip chat", delay: 60 },
    { icon: "📍", text: "Real-time location", delay: 75 },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 50%, ${CORAL} 100%)`,
      fontFamily,
    }}>
      <div style={{
        position: "absolute",
        top: 180,
        left: 60,
        right: 60,
        opacity: headerOp,
      }}>
        <div style={{
          background: `rgba(255,255,255,0.15)`,
          border: `1px solid rgba(255,255,255,0.3)`,
          borderRadius: 40,
          padding: "10px 28px",
          color: TEAL,
          fontSize: 22,
          fontWeight: 600,
          display: "inline-block",
        }}>
          🗺️ Journey
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "white", lineHeight: 1.2, marginTop: 20 }}>
          Plan, Split{"\n"}& Travel
        </div>
      </div>

      {features.map((feat, i) => {
        const s = spring({ frame: frame - feat.delay, fps, config: { damping: 15 } });
        const x = interpolate(s, [0, 1], [-400, 0]);
        const op = interpolate(s, [0, 1], [0, 1]);
        const dotScale = spring({ frame: frame - feat.delay - 5, fps, config: { damping: 10 } });

        return (
          <div key={i} style={{
            position: "absolute",
            left: 60,
            right: 60,
            top: 500 + i * 120,
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: op,
            transform: `translateX(${x}px)`,
          }}>
            <div style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: i % 2 === 0 ? TEAL : "white",
              transform: `scale(${interpolate(dotScale, [0, 1], [0, 1])})`,
              flexShrink: 0,
              boxShadow: `0 0 20px ${i % 2 === 0 ? TEAL : "rgba(255,255,255,0.5)"}`,
            }} />
            {i < features.length - 1 && (
              <div style={{
                position: "absolute",
                left: 7,
                top: 40,
                width: 2,
                height: 80,
                background: `linear-gradient(180deg, ${i % 2 === 0 ? TEAL : "rgba(255,255,255,0.4)"}44, transparent)`,
              }} />
            )}
            <div style={{ fontSize: 34, marginRight: 8 }}>{feat.icon}</div>
            <span style={{ fontSize: 28, fontWeight: 600, color: "white" }}>{feat.text}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
