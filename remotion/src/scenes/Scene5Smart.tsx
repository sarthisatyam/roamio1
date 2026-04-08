import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const Scene5Smart = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    { icon: "🤖", title: "AI Travel Bot", desc: "Ask anything, anytime", delay: 0 },
    { icon: "🔍", title: "Smart Search", desc: "Hotels, activities, guides", delay: 14 },
    { icon: "🛡️", title: "Safety First", desc: "Gender filters & parental mode", delay: 28 },
    { icon: "📊", title: "AI Itineraries", desc: "Personalized suggestions", delay: 42 },
    { icon: "🌐", title: "Join Community", desc: "Share experiences & learn", delay: 56 },
    { icon: "🗣️", title: "Language Assistant", desc: "Navigate any local language", delay: 70 },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 50%, ${CORAL} 100%)`,
      fontFamily,
    }}>
      <div style={{
        position: "absolute",
        top: 140,
        left: 60,
        right: 60,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.9)",
          borderRadius: 40,
          padding: "10px 28px",
          color: TEAL,
          fontSize: 22,
          fontWeight: 600,
          display: "inline-block",
        }}>
          ⚡ Smart Features
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, color: "white", lineHeight: 1.2, marginTop: 20 }}>
          AI-Powered{"\n"}Travel Intelligence
        </div>
      </div>

      {/* 3x2 grid */}
      {items.map((item, i) => {
        const s = spring({ frame: frame - item.delay - 10, fps, config: { damping: 14 } });
        const scale = interpolate(s, [0, 1], [0.5, 1]);
        const op = interpolate(s, [0, 1], [0, 1]);

        const col = i % 2;
        const row = Math.floor(i / 2);

        return (
          <div key={i} style={{
            position: "absolute",
            left: 50 + col * 500,
            top: 440 + row * 230,
            width: 440,
            height: 200,
            background: `rgba(255,255,255,0.10)`,
            borderRadius: 28,
            padding: 28,
            border: `1px solid rgba(255,255,255,0.18)`,
            transform: `scale(${scale})`,
            opacity: op,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: TEAL, marginBottom: 6, background: "rgba(255,255,255,0.85)", borderRadius: 8, padding: "2px 10px", display: "inline-block" }}>{item.title}</div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.8)" }}>{item.desc}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
