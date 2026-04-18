import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";

export const SceneTwist2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardS = spring({ frame, fps, config: { damping: 14 } });
  const cardScale = interpolate(cardS, [0, 1], [0.7, 1]);
  const cardOp = interpolate(cardS, [0, 1], [0, 1]);

  // waveform animation
  const bars = Array.from({ length: 30 });

  const drop1S = spring({ frame: frame - 80, fps, config: { damping: 14 } });
  const drop1Op = interpolate(drop1S, [0, 1], [0, 1]);
  const drop1Y = interpolate(drop1S, [0, 1], [30, 0]);

  const drop2S = spring({ frame: frame - 120, fps, config: { damping: 14 } });
  const drop2Op = interpolate(drop2S, [0, 1], [0, 1]);
  const drop2Y = interpolate(drop2S, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(180deg, #1a1a26 0%, #2d1a26 100%)`,
      fontFamily,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 40,
    }}>
      {/* Voice note card */}
      <div style={{
        background: "white", borderRadius: 24, padding: 28, width: "90%",
        opacity: cardOp, transform: `scale(${cardScale})`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: CORAL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "white", fontWeight: 800 }}>A</div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#222" }}>Ananya</div>
            <div style={{ fontSize: 18, color: "#888" }}>Voice message · 0:08</div>
          </div>
        </div>

        {/* Play button + waveform */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f5f5f7", padding: "16px 18px", borderRadius: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 22 }}>▶</div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, flex: 1, height: 40 }}>
            {bars.map((_, i) => {
              const h = 6 + Math.abs(Math.sin((frame * 0.3) + i * 0.8)) * 28;
              const active = i < (frame / 4) % 30;
              return <div key={i} style={{ width: 4, height: h, background: active ? CORAL : "#ccc", borderRadius: 2 }} />;
            })}
          </div>
        </div>

        <div style={{ marginTop: 20, fontSize: 22, color: "#444", fontStyle: "italic", lineHeight: 1.4 }}>
          "Guys… mujhe fever ho gaya… I can't come 😭"
        </div>
      </div>

      {/* Reaction lines */}
      <div style={{
        marginTop: 40, opacity: drop1Op, transform: `translateY(${drop1Y}px)`,
        background: "rgba(255,255,255,0.95)", padding: "14px 24px", borderRadius: 24,
        fontSize: 26, fontWeight: 600, color: "#222",
      }}>
        Kabir: "Ab kya hi bacha…"
      </div>
      <div style={{
        marginTop: 16, opacity: drop2Op, transform: `translateY(${drop2Y}px)`,
        background: CORAL, color: "white", padding: "14px 24px", borderRadius: 24,
        fontSize: 26, fontWeight: 700,
      }}>
        "Main bhi drop kar raha hoon bhai." 💔
      </div>
    </AbsoluteFill>
  );
};
