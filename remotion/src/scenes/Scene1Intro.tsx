import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const TEAL = "#04a5c2";

export const Scene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo circle scale
  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  
  // Title slide up
  const titleY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 15 } }), [0, 1], [80, 0]);
  const titleOp = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  
  // Tagline
  const tagOp = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = interpolate(spring({ frame: frame - 50, fps, config: { damping: 15 } }), [0, 1], [40, 0]);

  // Decorative line
  const lineWidth = interpolate(frame, [80, 120], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, #0f1923 0%, #1a2332 40%, #1f2d40 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily,
    }}>
      {/* Gradient orb behind logo */}
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${CORAL}20 0%, transparent 70%)`,
        top: "25%",
        transform: `scale(${logoScale})`,
      }} />

      {/* Logo circle */}
      <div style={{
        width: 160,
        height: 160,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${CORAL}, ${TEAL})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${logoScale})`,
        boxShadow: `0 20px 60px ${CORAL}40`,
        marginBottom: 50,
      }}>
        <span style={{ fontSize: 64, fontWeight: 800, color: "white", letterSpacing: -2 }}>R</span>
      </div>

      {/* Title */}
      <div style={{
        fontSize: 82,
        fontWeight: 800,
        color: "white",
        letterSpacing: -3,
        transform: `translateY(${titleY}px)`,
        opacity: titleOp,
      }}>
        Roamio
      </div>

      {/* Decorative line */}
      <div style={{
        width: lineWidth,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)`,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 2,
      }} />

      {/* Tagline */}
      <div style={{
        fontSize: 36,
        fontWeight: 600,
        color: TEAL,
        opacity: tagOp,
        transform: `translateY(${tagY}px)`,
        textAlign: "center",
        lineHeight: 1.4,
      }}>
        Travel Solo,{"\n"}Not Alone
      </div>
    </AbsoluteFill>
  );
};
