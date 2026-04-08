import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const Scene3Companion = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cards = [
    { name: "Alex, 24", city: "Goa", delay: 15 },
    { name: "Priya, 22", city: "Manali", delay: 30 },
    { name: "Jordan, 26", city: "Bali", delay: 45 },
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
          background: "rgba(255,255,255,0.9)",
          borderRadius: 40,
          padding: "10px 28px",
          color: TEAL,
          fontSize: 22,
          fontWeight: 600,
          display: "inline-block",
          marginBottom: 20,
        }}>
          👥 Companion
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "white", lineHeight: 1.2, marginTop: 16 }}>
          Find Your{"\n"}Travel Buddy
        </div>
      </div>

      {cards.map((card, i) => {
        const s = spring({ frame: frame - card.delay, fps, config: { damping: 12 } });
        const scale = interpolate(s, [0, 1], [0.6, 1]);
        const op = interpolate(s, [0, 1], [0, 1]);
        const rot = interpolate(s, [0, 1], [15, (i - 1) * 6]);

        return (
          <div key={i} style={{
            position: "absolute",
            left: 100 + i * 30,
            right: 100 - i * 30,
            top: 520 + i * 160,
            transform: `scale(${scale}) rotate(${rot}deg)`,
            opacity: op,
            background: `rgba(255,255,255,0.12)`,
            borderRadius: 28,
            padding: "36px 32px",
            border: `1px solid rgba(255,255,255,0.2)`,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: TEAL,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "white",
              fontWeight: 700,
            }}>
              {card.name[0]}
            </div>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, color: "white" }}>{card.name}</div>
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>📍 {card.city}</div>
            </div>
          </div>
        );
      })}

      <div style={{
        position: "absolute",
        bottom: 350,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 24,
        opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `rgba(255,255,255,0.15)`, border: `2px solid white`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36,
        }}>❤️</div>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `${TEAL}33`, border: `2px solid ${TEAL}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36,
        }}>💬</div>
      </div>
    </AbsoluteFill>
  );
};
