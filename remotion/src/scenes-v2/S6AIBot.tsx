import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { IPhoneFrame } from "../components/IPhoneFrame";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const S6AIBot = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneS = spring({ frame, fps, config: { damping: 12 } });
  const phoneScale = interpolate(phoneS, [0, 1], [0.5, 1]);
  const phoneOp = interpolate(phoneS, [0, 1], [0, 1]);

  const textS = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const textOp = interpolate(textS, [0, 1], [0, 1]);

  const features = [
    { icon: "🤖", text: "AI travel assistant" },
    { icon: "🔍", text: "Smart hotel search" },
    { icon: "🌐", text: "Language helper" },
    { icon: "🆘", text: "Emergency support" },
    { icon: "👥", text: "Community insights" },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 50%, ${CORAL} 100%)`,
      fontFamily,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Left text */}
      <div style={{
        position: "absolute",
        left: 80,
        top: 180,
        opacity: textOp,
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
          ⚡ Smart Features
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 40 }}>
          AI-Powered{"\n"}Intelligence
        </div>

        {features.map((f, i) => {
          const fS = spring({ frame: frame - 30 - i * 10, fps, config: { damping: 14 } });
          const fOp = interpolate(fS, [0, 1], [0, 1]);
          return (
            <div key={i} style={{
              opacity: fOp,
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
            }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <span style={{ fontSize: 22, color: "white", fontWeight: 600 }}>{f.text}</span>
            </div>
          );
        })}
      </div>

      {/* Phone right */}
      <div style={{
        position: "absolute",
        right: 120,
        opacity: phoneOp,
        transform: `scale(${phoneScale})`,
      }}>
        <IPhoneFrame screenSrc="images/screens/ai-bot.png" scale={1.1} />
      </div>
    </AbsoluteFill>
  );
};
