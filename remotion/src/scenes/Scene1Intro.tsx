import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const Scene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 100 } });
  const titleY = interpolate(spring({ frame: frame - 20, fps, config: { damping: 15 } }), [0, 1], [80, 0]);
  const titleOp = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tagY = interpolate(spring({ frame: frame - 50, fps, config: { damping: 15 } }), [0, 1], [40, 0]);
  const lineWidth = interpolate(frame, [80, 120], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 40%, ${CORAL} 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily,
    }}>
      {/* Glow behind logo */}
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)`,
        top: "25%",
        transform: `scale(${logoScale})`,
      }} />

      {/* Logo */}
      <div style={{
        width: 180,
        height: 180,
        borderRadius: "50%",
        overflow: "hidden",
        transform: `scale(${logoScale})`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.3)`,
        marginBottom: 50,
        border: "4px solid white",
      }}>
        <Img src={staticFile("images/roamio-logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
