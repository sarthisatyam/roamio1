import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const TEAL = "#04a5c2";

export const Scene6CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 12 } });
  const titleScale = interpolate(titleS, [0, 1], [0.5, 1]);
  const titleOp = interpolate(titleS, [0, 1], [0, 1]);

  const subtitleOp = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const btnS = spring({ frame: frame - 50, fps, config: { damping: 10 } });
  const btnScale = interpolate(btnS, [0, 1], [0.3, 1]);

  // Pulse glow
  const pulse = Math.sin(frame * 0.08) * 0.15 + 0.85;

  const urlOp = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, #0f1923 0%, #1a2332 40%, #0f1923 100%)`,
      fontFamily,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Glow background */}
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${CORAL}22 0%, transparent 70%)`,
        opacity: pulse,
      }} />

      <div style={{
        transform: `scale(${titleScale})`,
        opacity: titleOp,
        textAlign: "center",
        marginBottom: 30,
      }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -2 }}>
          Your Next
        </div>
        <div style={{
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -2,
          background: `linear-gradient(135deg, ${CORAL}, ${TEAL})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Adventure
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -2 }}>
          Awaits
        </div>
      </div>

      <div style={{
        opacity: subtitleOp,
        fontSize: 30,
        color: "rgba(255,255,255,0.6)",
        textAlign: "center",
        marginBottom: 50,
        lineHeight: 1.5,
      }}>
        Travel solo. Connect with companions.{"\n"}Explore together.
      </div>

      {/* CTA button */}
      <div style={{
        transform: `scale(${btnScale})`,
        background: `linear-gradient(135deg, ${CORAL}, ${TEAL})`,
        padding: "24px 72px",
        borderRadius: 60,
        boxShadow: `0 20px 60px ${CORAL}50`,
      }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: "white" }}>Try Roamio Free</span>
      </div>

      <div style={{
        opacity: urlOp,
        fontSize: 26,
        color: TEAL,
        marginTop: 40,
        fontWeight: 600,
      }}>
        roamio1.lovable.app
      </div>
    </AbsoluteFill>
  );
};
