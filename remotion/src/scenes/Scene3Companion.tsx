import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const TEAL = "#04a5c2";

export const Scene3Companion = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Profile cards stagger in
  const cards = [
    { name: "Alex, 24", city: "Goa", delay: 15, color: CORAL },
    { name: "Priya, 22", city: "Manali", delay: 30, color: TEAL },
    { name: "Jordan, 26", city: "Bali", delay: 45, color: CORAL },
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
        opacity: headerOp,
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
          marginBottom: 20,
        }}>
          👥 Companion
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "white", lineHeight: 1.2, marginTop: 16 }}>
          Find Your{"\n"}Travel Buddy
        </div>
      </div>

      {/* Profile cards */}
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
            background: `linear-gradient(135deg, ${card.color}18, rgba(255,255,255,0.04))`,
            borderRadius: 28,
            padding: "36px 32px",
            border: `1px solid ${card.color}33`,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${card.color}, ${card.color}88)`,
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
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>📍 {card.city}</div>
            </div>
          </div>
        );
      })}

      {/* Like/connect action */}
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
          background: `${CORAL}22`, border: `2px solid ${CORAL}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36,
        }}>❤️</div>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `${TEAL}22`, border: `2px solid ${TEAL}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36,
        }}>💬</div>
      </div>
    </AbsoluteFill>
  );
};
