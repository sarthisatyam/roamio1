import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const TEAL = "#04a5c2";

export const Scene5Smart = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const items = [
    { icon: "🤖", title: "AI Travel Bot", desc: "Ask anything, anytime", delay: 0 },
    { icon: "🔍", title: "Smart Search", desc: "Hotels, activities, guides", delay: 18 },
    { icon: "🛡️", title: "Safety First", desc: "Gender filters & parental mode", delay: 36 },
    { icon: "📊", title: "AI Itineraries", desc: "Personalized suggestions", delay: 54 },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, #0f1923 0%, #1a2332 50%, #162030 100%)`,
      fontFamily,
    }}>
      <div style={{
        position: "absolute",
        top: 180,
        left: 60,
        right: 60,
      }}>
        <div style={{
          background: `${TEAL}22`,
          border: `1px solid ${TEAL}44`,
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

      {/* 2x2 grid */}
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
            top: 520 + row * 320,
            width: 440,
            height: 270,
            background: `rgba(255,255,255,0.04)`,
            borderRadius: 28,
            padding: 32,
            border: `1px solid rgba(255,255,255,0.08)`,
            transform: `scale(${scale})`,
            opacity: op,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "white", marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)" }}>{item.desc}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
