import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { IPhoneFrame } from "../components/IPhoneFrame";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const S5Journey = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneS = spring({ frame, fps, config: { damping: 14 } });
  const phoneY = interpolate(phoneS, [0, 1], [400, 0]);
  const phoneOp = interpolate(phoneS, [0, 1], [0, 1]);

  const textS = spring({ frame: frame - 15, fps, config: { damping: 14 } });
  const textOp = interpolate(textS, [0, 1], [0, 1]);

  const features = [
    { icon: "📋", text: "Plan itinerary" },
    { icon: "💰", text: "Split expenses" },
    { icon: "🗳️", text: "Activity polls" },
    { icon: "👥", text: "Group management" },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 50%, ${CORAL} 100%)`,
      fontFamily,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Phone left */}
      <div style={{
        position: "absolute",
        left: 120,
        opacity: phoneOp,
        transform: `translateY(${phoneY}px)`,
      }}>
        <IPhoneFrame screenSrc="images/screens/journey.png" scale={1.1} />
      </div>

      {/* Right text */}
      <div style={{
        position: "absolute",
        right: 80,
        top: 200,
        opacity: textOp,
        textAlign: "right",
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
          🗺️ Journey
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 40 }}>
          Plan, Split{"\n"}& Travel
        </div>

        {features.map((f, i) => {
          const fS = spring({ frame: frame - 25 - i * 12, fps, config: { damping: 14 } });
          const fOp = interpolate(fS, [0, 1], [0, 1]);
          return (
            <div key={i} style={{
              opacity: fOp,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 14,
              marginBottom: 18,
            }}>
              <span style={{ fontSize: 24, color: "white", fontWeight: 600 }}>{f.text}</span>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
