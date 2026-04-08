import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { IPhoneFrame } from "../components/IPhoneFrame";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const S2Home = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneS = spring({ frame, fps, config: { damping: 14 } });
  const phoneScale = interpolate(phoneS, [0, 1], [0.5, 1]);
  const phoneOp = interpolate(phoneS, [0, 1], [0, 1]);

  const textS = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const textOp = interpolate(textS, [0, 1], [0, 1]);
  const textX = interpolate(textS, [0, 1], [-60, 0]);

  const features = [
    { icon: "🌍", text: "Discover destinations" },
    { icon: "🔍", text: "AI-powered search" },
    { icon: "💰", text: "Budget-friendly options" },
    { icon: "🛡️", text: "Safety-first categories" },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 50%, ${CORAL} 100%)`,
      fontFamily,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Left side text */}
      <div style={{
        position: "absolute",
        left: 80,
        top: 200,
        opacity: textOp,
        transform: `translateX(${textX}px)`,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.9)",
          borderRadius: 40,
          padding: "8px 24px",
          color: TEAL,
          fontSize: 20,
          fontWeight: 600,
          display: "inline-block",
          marginBottom: 20,
        }}>
          🏠 Home
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 40 }}>
          Explore &{"\n"}Discover
        </div>

        {features.map((f, i) => {
          const fS = spring({ frame: frame - 30 - i * 12, fps, config: { damping: 14 } });
          const fOp = interpolate(fS, [0, 1], [0, 1]);
          const fX = interpolate(fS, [0, 1], [-40, 0]);
          return (
            <div key={i} style={{
              opacity: fOp,
              transform: `translateX(${fX}px)`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
            }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <span style={{ fontSize: 24, color: "white", fontWeight: 600 }}>{f.text}</span>
            </div>
          );
        })}
      </div>

      {/* Phone on right */}
      <div style={{
        position: "absolute",
        right: 120,
        opacity: phoneOp,
        transform: `scale(${phoneScale})`,
      }}>
        <IPhoneFrame screenSrc="images/screens/home.png" scale={1.1} />
      </div>
    </AbsoluteFill>
  );
};
